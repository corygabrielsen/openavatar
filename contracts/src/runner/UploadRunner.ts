import { AvatarDefinitions, AvatarLayerStack, AvatarPose, LayerDescriptor, PatternDescriptor } from '@openavatar/types'
import { providers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployable } from '../abi/Deployable'
import { DeploymentConfig } from '../abi/DeploymentConfig'
import { chooseDeploymentConfiguration } from '../abi/DeploymentConfigChooser'
import { GasParams } from '../client/GasParams'
import { OpenAvatarGen0Assets } from '../client/OpenAvatarGen0Assets'
import { OpenAvatarGen0AssetsCanvasStore } from '../client/core/assets/OpenAvatarGen0AssetsCanvasStore'
import { Contracts } from '../deploy/Deployer'
import { PaletteUploader } from '../upload/PaletteUploader'
import { PatternUploader } from '../upload/PatternUploader'
import { confirmIfPublicDeployment } from '../util/NetworkUtils'
import { fmtCommas } from '../util/StringUtils'
import { BaseRunner } from './BaseRunner'

class GasSpentAccumulator {
  private gasUsed = 0
  private ethSpent = 0

  update(data: { receipt: providers.TransactionReceipt }): void {
    this.gasUsed += data.receipt.gasUsed.toNumber()
    const gasPriceInEth = data.receipt.effectiveGasPrice.toNumber() / 1e9
    const ethSpent = (gasPriceInEth * data.receipt.gasUsed.toNumber()) / 1e9
    this.ethSpent += ethSpent
  }

  getEthSpent(): number {
    return this.ethSpent
  }

  getGasUsed(): number {
    return this.gasUsed
  }
}

export class UploadRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment) {
    await this.waitForNetwork(hre)
    this.logNetwork(hre)

    const gasParams = {
      maxFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxfeepergas, 'gwei'),
      maxPriorityFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxpriorityfeepergas, 'gwei'),
    }
    const gasParamsAsStringsForLogging = {
      maxFeePerGas: fmtCommas(gasParams.maxFeePerGas.toNumber() / 10 ** 9),
      maxPriorityFeePerGas: fmtCommas(gasParams.maxPriorityFeePerGas.toNumber() / 10 ** 9),
    }
    this.console.log(`Uploading with gas params:`)
    this.console.log(`    maxFeePerGas         : ${gasParamsAsStringsForLogging.maxFeePerGas} gwei`)
    this.console.log(`    maxPriorityFeePerGas : ${gasParamsAsStringsForLogging.maxPriorityFeePerGas} gwei`)

    const beforeEthBalance = await hre.ethers.provider.getBalance(hre.ethers.provider.getSigner().getAddress())
    this.console.log(`ETH balance: ${hre.ethers.utils.formatEther(beforeEthBalance)}`)

    // deploy the contracts
    const deploymentConfig: DeploymentConfig = await chooseDeploymentConfiguration(taskArgs.deploytype, hre.network)
    const contracts: Contracts = await Contracts.make(
      hre,
      deploymentConfig,
      { create2: taskArgs.create2 },
      { logging: this.config.logging }
    )
    if (this.config.logging) {
      contracts.log()
      this.console.log()
    }
    await contracts.confirmIfPublicDeployment(hre.network)
    let store: OpenAvatarGen0Assets
    const contractName = Deployable.OpenAvatarGen0Assets
    this.console.log(`Using ${contractName}`)
    store = contracts[contractName]
    const paletteUploader = new PaletteUploader(hre, store, gasParams, { logging: this.config.logging })
    const patternUploader = new PatternUploader(hre, store, gasParams, { logging: this.config.logging })

    // check the owner is us
    const owner: string = await store.owner()
    const signerAddress = await hre.ethers.provider.getSigner().getAddress()
    if (owner !== signerAddress) {
      throw new Error(`Owner is ${owner} but signer is: ${signerAddress}`)
    }
    const gasSpentAccumulator = new GasSpentAccumulator()
    paletteUploader.subscribe(gasSpentAccumulator)
    patternUploader.subscribe(gasSpentAccumulator)

    const pose: AvatarPose = AvatarDefinitions.getPose(taskArgs.pose)
    await this.addCanvasIfNotPresent(
      hre,
      new OpenAvatarGen0AssetsCanvasStore(hre, store.contract),
      pose.canvasId,
      gasParams
    )
    this.console.log(`Found ${await store.getNumLayers(pose.canvasId)} layers`)
    await this.addLayersIfNotPresent(hre, store, pose.canvasId, gasParams)

    this.console.log(`Uploading ${taskArgs.oneeach ? 'one each of' : 'all'} patterns`)
    if (taskArgs.oneeach) {
      await paletteUploader.uploadAll()
      await this.uploadOneEach(hre, pose, patternUploader, gasSpentAccumulator)
    } else {
      await paletteUploader.uploadAll()
      await patternUploader.uploadAll(pose)
    }
    this.console.log()
    // accumulator stats
    this.console.log(`Total gas used:  ${fmtCommas(gasSpentAccumulator.getGasUsed())} gas`)
    this.console.log(`Total ETH spent: ${gasSpentAccumulator.getEthSpent()} ETH`)
    this.console.log()
    const afterEthBalance = await hre.ethers.provider.getBalance(hre.ethers.provider.getSigner().getAddress())
    this.console.log(`Account balance         :  ${hre.ethers.utils.formatEther(afterEthBalance)}`)
    this.console.log(`Previous balance        :  ${hre.ethers.utils.formatEther(beforeEthBalance)}`)
    this.console.log(
      `Account balance change  : -${hre.ethers.utils.formatEther(beforeEthBalance.sub(afterEthBalance))}`
    )
  }

  private async addCanvasIfNotPresent(
    hre: HardhatRuntimeEnvironment,
    store: OpenAvatarGen0AssetsCanvasStore,
    canvasId: number,
    gasParams: GasParams
  ): Promise<void> {
    let canvasExists: boolean = await store.hasCanvas(canvasId)
    if (!canvasExists) {
      const width: number = 32
      const height: number = 32
      this.console.log(`Adding canvas ${canvasId} with dimensions ${width}x${height}`)
      await confirmIfPublicDeployment(hre, this.console)
      const tx: providers.TransactionResponse = await store.addCanvas({ id: canvasId, width, height }, gasParams)
      this.console.log(`    tx: ${tx.hash}`)
      await tx.wait()
    }
    // should exist now
    canvasExists = await store.hasCanvas(canvasId)
    if (!canvasExists) {
      throw new Error(`Canvas ${canvasId} does not exist even after adding it`)
    }
  }

  /**
   * Initializes the layers so that we can upload
   * @param uploader the uploader
   * @returns a promise that resolves when the layers are initialized
   */
  private async addLayersIfNotPresent(
    hre: HardhatRuntimeEnvironment,
    store: OpenAvatarGen0Assets,
    canvasId: number,
    gasParams: GasParams
  ): Promise<void> {
    const maxLayerIndex = (await store.getNumLayers(canvasId)) - 1
    const layersToAdd: LayerDescriptor[] = AvatarLayerStack.filter((layer) => layer.index > maxLayerIndex)
    if (layersToAdd.length === 0) {
      return
    }
    this.console.log(
      `Adding ${layersToAdd.length} layers to canvas ${canvasId}: ${layersToAdd.map((l) => l.name).join(', ')}...`
    )
    await confirmIfPublicDeployment(hre, this.console)
    const tx = await store.addLayers(
      canvasId,
      layersToAdd.map((l) => l.index),
      gasParams
    )
    this.console.log(`    tx: ${tx.hash}`)
    await tx.wait()
    // ensure numLayers = 60 + 1 sanity check
    const expected = AvatarLayerStack.topLayer.index + 1
    if ((await store.getNumLayers(canvasId)) !== expected) {
      throw new Error(`Expected ${expected} layers for canvas ${canvasId}, got ${await store.getNumLayers(canvasId)}`)
    }
  }
  private async uploadOneEach(
    hre: HardhatRuntimeEnvironment,
    pose: AvatarPose,
    patternUploader: PatternUploader,
    gasSpentAccumulator: GasSpentAccumulator
  ): Promise<void> {
    for (const layer of AvatarLayerStack.iter()) {
      const patternIndexToUpload = await patternUploader.getNumPatterns(pose.canvasId, layer)
      if (patternIndexToUpload > 1) {
        this.console.log(`Skipping layer ${layer.index} because it already has ${patternIndexToUpload} patterns`)
        continue
      }
      const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, patternIndexToUpload)
      this.console.log(`Uploading pattern ${patternIndexToUpload} for layer ${layer.index}...`)
      const tx = await patternUploader.uploadPattern(pattern, pose)
      const receipt = await tx.wait()

      // wait for the transaction to be mined
      this.console.log(`upload: ${layer.index} ${patternIndexToUpload}`)
      this.console.log(`    tx: ${receipt.transactionHash}`)
      this.console.log(
        `    ETH : ${hre.ethers.utils.formatUnits(receipt.effectiveGasPrice.mul(receipt.gasUsed), 'gwei')} gwei`
      )
      this.console.log(
        `    gas : ${receipt.gasUsed} @ ${hre.ethers.utils.formatUnits(receipt.effectiveGasPrice, 'gwei')} gwei`
      )
    }
    this.console.log(`cumlative:`)
    this.console.log(`    eth_spent: ${gasSpentAccumulator.getEthSpent()} ETH`)
    this.console.log(`    gas_used:  ${gasSpentAccumulator.getGasUsed()}`)
  }
}
