import { BigNumber, Contract, ContractReceipt, ethers, providers } from 'ethers'
import fs from 'fs'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import path from 'path'
import {
  HARDHAT_DEFAULT_DEPLOYER_ADDRESS,
  HARDHAT_DEFAULT_DEPLOYER_PRIVATE_KEY,
  OWNER_PROXY_MASTER,
} from '../abi/Constants'
import { Deployable } from '../abi/Deployable'
import { DeploymentConfig } from '../abi/DeploymentConfig'
import { GasParams } from '../client/GasParams'
import { OpenAvatarGen0Assets } from '../client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../client/OpenAvatarGen0Token'
import { OpenAvatarGen0ProfilePictureRenderer } from '../client/extensions/OpenAvatarGen0ProfilePictureRenderer'
import { OpenAvatarGen0ExampleMutableCanvasRenderer } from '../client/extensions/example/OpenAvatarGen0ExampleMutableCanvasRenderer'
import { confirmIfPublicDeployment, isPublicNetwork } from '../util/NetworkUtils'
import { fmtCommas } from '../util/StringUtils'
import { Create2SaltInfo, getCreate2Input, searchCreate2Address } from './Create2'

const ORANGE = '\u001b[33m'
const GREEN = '\u001b[32m'
const RED = '\u001b[31m'
const CYAN = '\u001b[36m'
const ENDC = '\u001b[0m'

interface PartialDeployment {
  [Deployable.ImmutableCreate2Factory]?: Contract
  [Deployable.OwnerProxy]?: Contract
  [Deployable.OpenAvatarGen0Assets]?: OpenAvatarGen0Assets
  [Deployable.OpenAvatarGen0RendererRegistry]?: OpenAvatarGen0RendererRegistry
  [Deployable.OpenAvatarGen0Renderer]?: OpenAvatarGen0Renderer
  [Deployable.OpenAvatarGen0Token]?: OpenAvatarGen0Token
  [Deployable.OpenAvatarGen0TextRecords]?: OpenAvatarGen0TextRecords
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]?: OpenAvatarGen0ProfilePictureRenderer
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]?: OpenAvatarGen0ExampleMutableCanvasRenderer
}

export class PartialContracts implements PartialDeployment {
  [Deployable.ImmutableCreate2Factory]?: Contract;
  [Deployable.OwnerProxy]?: Contract;
  [Deployable.OpenAvatarGen0Assets]?: OpenAvatarGen0Assets;
  [Deployable.OpenAvatarGen0RendererRegistry]?: OpenAvatarGen0RendererRegistry;
  [Deployable.OpenAvatarGen0Renderer]?: OpenAvatarGen0Renderer;
  [Deployable.OpenAvatarGen0Token]?: OpenAvatarGen0Token;
  [Deployable.OpenAvatarGen0TextRecords]?: OpenAvatarGen0TextRecords;
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]?: OpenAvatarGen0ProfilePictureRenderer;
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]?: OpenAvatarGen0ExampleMutableCanvasRenderer

  constructor(deployment: PartialDeployment) {
    this[Deployable.ImmutableCreate2Factory] = deployment[Deployable.ImmutableCreate2Factory]
    this[Deployable.OwnerProxy] = deployment[Deployable.OwnerProxy]
    this[Deployable.OpenAvatarGen0Assets] = deployment[Deployable.OpenAvatarGen0Assets]
    this[Deployable.OpenAvatarGen0RendererRegistry] = deployment[Deployable.OpenAvatarGen0RendererRegistry]
    this[Deployable.OpenAvatarGen0Renderer] = deployment[Deployable.OpenAvatarGen0Renderer]
    this[Deployable.OpenAvatarGen0Token] = deployment[Deployable.OpenAvatarGen0Token]
    this[Deployable.OpenAvatarGen0TextRecords] = deployment[Deployable.OpenAvatarGen0TextRecords]
    this[Deployable.OpenAvatarGen0ProfilePictureRenderer] = deployment[Deployable.OpenAvatarGen0ProfilePictureRenderer]
    this[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer] =
      deployment[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]
  }

  log(): void {
    for (const contract of Object.values(Deployable)) {
      console.log(
        `${CYAN}${
          this[contract]?.address || '------------------------------------------'
        }${ENDC} : ${CYAN}${contract}${ENDC}`
      )
    }
  }
}

interface FullDeployment {
  [Deployable.ImmutableCreate2Factory]: Contract
  [Deployable.OwnerProxy]: Contract
  [Deployable.OpenAvatarGen0Assets]: OpenAvatarGen0Assets
  [Deployable.OpenAvatarGen0RendererRegistry]: OpenAvatarGen0RendererRegistry
  [Deployable.OpenAvatarGen0Renderer]: OpenAvatarGen0Renderer
  [Deployable.OpenAvatarGen0Token]: OpenAvatarGen0Token
  [Deployable.OpenAvatarGen0TextRecords]: OpenAvatarGen0TextRecords
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: OpenAvatarGen0ProfilePictureRenderer
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: OpenAvatarGen0ExampleMutableCanvasRenderer
}

interface Config {
  logging: boolean
}
const DEFAULT_ON = true

export class Contracts implements FullDeployment {
  [Deployable.ImmutableCreate2Factory]: Contract;
  [Deployable.OwnerProxy]: Contract;
  [Deployable.OpenAvatarGen0Assets]: OpenAvatarGen0Assets;
  [Deployable.OpenAvatarGen0RendererRegistry]: OpenAvatarGen0RendererRegistry;
  [Deployable.OpenAvatarGen0Renderer]: OpenAvatarGen0Renderer;
  [Deployable.OpenAvatarGen0Token]: OpenAvatarGen0Token;
  [Deployable.OpenAvatarGen0TextRecords]: OpenAvatarGen0TextRecords;
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: OpenAvatarGen0ProfilePictureRenderer;
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: OpenAvatarGen0ExampleMutableCanvasRenderer

  constructor(deployment: FullDeployment) {
    this[Deployable.ImmutableCreate2Factory] = deployment[Deployable.ImmutableCreate2Factory]
    this[Deployable.OwnerProxy] = deployment[Deployable.OwnerProxy]
    this[Deployable.OpenAvatarGen0Assets] = deployment[Deployable.OpenAvatarGen0Assets]
    this[Deployable.OpenAvatarGen0RendererRegistry] = deployment[Deployable.OpenAvatarGen0RendererRegistry]
    this[Deployable.OpenAvatarGen0Renderer] = deployment[Deployable.OpenAvatarGen0Renderer]
    this[Deployable.OpenAvatarGen0Token] = deployment[Deployable.OpenAvatarGen0Token]
    this[Deployable.OpenAvatarGen0TextRecords] = deployment[Deployable.OpenAvatarGen0TextRecords]
    this[Deployable.OpenAvatarGen0ProfilePictureRenderer] = deployment[Deployable.OpenAvatarGen0ProfilePictureRenderer]
    this[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer] =
      deployment[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]
  }

  static async make(
    hre: HardhatRuntimeEnvironment,
    deploymentConfig: DeploymentConfig,
    args: { create2: boolean },
    config: Config = { logging: DEFAULT_ON }
  ): Promise<Contracts> {
    const addrLookup = args.create2 ? 'create2Address' : 'nonCreate2Address'
    const contracts: Contracts = new Contracts({
      [Deployable.ImmutableCreate2Factory]: await hre.ethers.getContractAt(
        deploymentConfig.contractConfigs[Deployable.ImmutableCreate2Factory].abi,
        deploymentConfig.contractConfigs[Deployable.ImmutableCreate2Factory].nonCreate2Address
      ),
      [Deployable.OwnerProxy]: await hre.ethers.getContractAt(
        deploymentConfig.contractConfigs[Deployable.OwnerProxy].abi,
        deploymentConfig.contractConfigs[Deployable.OwnerProxy][addrLookup]
      ),
      [Deployable.OpenAvatarGen0Assets]: new OpenAvatarGen0Assets(
        hre,
        await hre.ethers.getContractAt(
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0Assets].abi,
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0Assets][addrLookup]
        ),
        config
      ),
      [Deployable.OpenAvatarGen0RendererRegistry]: new OpenAvatarGen0RendererRegistry(
        hre,
        await hre.ethers.getContractAt(
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0RendererRegistry].abi,
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0RendererRegistry][addrLookup]
        ),
        config
      ),
      [Deployable.OpenAvatarGen0Renderer]: new OpenAvatarGen0Renderer(
        hre,
        await hre.ethers.getContractAt(
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0Renderer].abi,
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0Renderer][addrLookup]
        ),
        config
      ),
      [Deployable.OpenAvatarGen0Token]: new OpenAvatarGen0Token(
        hre,
        await hre.ethers.getContractAt(
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0Token].abi,
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0Token][addrLookup]
        ),
        config
      ),
      [Deployable.OpenAvatarGen0TextRecords]: new OpenAvatarGen0TextRecords(
        hre,
        await hre.ethers.getContractAt(
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0TextRecords].abi,
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0TextRecords][addrLookup]
        ),
        config
      ),
      [Deployable.OpenAvatarGen0ProfilePictureRenderer]: new OpenAvatarGen0ProfilePictureRenderer(
        hre,
        await hre.ethers.getContractAt(
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0ProfilePictureRenderer].abi,
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0ProfilePictureRenderer][addrLookup]
        ),
        config
      ),
      [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: new OpenAvatarGen0ExampleMutableCanvasRenderer(
        hre,
        await hre.ethers.getContractAt(
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer].abi,
          deploymentConfig.contractConfigs[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer][addrLookup]
        ),
        config
      ),
    })
    // check if the contracts are already deployed or missing
    for (const contract of Object.values(Deployable)) {
      if (contract == Deployable.ImmutableCreate2Factory) continue
      if (contract == Deployable.OwnerProxy) continue
      // call owner() to check if the contract is deployed
      try {
        await contracts[contract].owner()
      } catch (e) {
        const msg: string = `Contract ${contract} is not deployed at ${contracts[contract].address}`
        if (contract === Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer) {
          console.warn(msg)
        } else {
          throw new Error(msg)
        }
      }
    }
    return contracts
  }

  async confirmIfPublicDeployment(network: { name: string; config: { chainId?: number } }): Promise<void> {
    if (isPublicNetwork(network)) {
      // Pause execution and wait for the user to confirm before continuing
      process.stdout.write('Press any key to continue...')
      await new Promise((resolve) => process.stdin.once('data', resolve))
    }
  }

  log(): void {
    for (const contract of Object.values(Deployable)) {
      console.log(
        `${CYAN}${
          this[contract]?.address || '------------------------------------------'
        }${ENDC} : ${CYAN}${contract}${ENDC}`
      )
    }
  }
}

/**
 * Class that retrieves the current Ethereum price in USD
 */
export class Deployer {
  protected readonly _hre: HardhatRuntimeEnvironment
  protected readonly _signer: ethers.Signer
  protected readonly _address: `0x${string}`
  protected readonly _startBalance: BigNumber
  protected readonly _costs: { [key: string]: BigNumber } = {}
  protected readonly console: {
    debug: (...args: any[]) => void
    error: (...args: any[]) => void
    log: (...args: any[]) => void
  }
  protected readonly deploymentConfig: DeploymentConfig
  protected readonly gasParams: GasParams

  constructor(
    hre: HardhatRuntimeEnvironment,
    signer: ethers.Signer,
    address: `0x${string}`,
    startBalance: BigNumber,
    deploymentConfig: DeploymentConfig,
    config: Config = { logging: DEFAULT_ON },
    gasParams: GasParams
  ) {
    this._hre = hre
    this._signer = signer
    this._address = address
    this._startBalance = startBalance
    this.console = config.logging ? console : { debug: () => {}, error: () => {}, log: () => {} }
    this.deploymentConfig = deploymentConfig
    this.gasParams = gasParams
  }

  static async make(
    hre: HardhatRuntimeEnvironment,
    deploymentConfig: DeploymentConfig,
    config: Config = { logging: DEFAULT_ON },
    gasParams: GasParams
  ): Promise<Deployer> {
    const [signer] = await hre.ethers.getSigners()
    const deployerAddress: `0x${string}` = (await signer.getAddress()) as `0x${string}`
    if (deployerAddress !== deploymentConfig.deployer) {
      throw new Error(
        `Deployer address ${deployerAddress} does not match expected deployer address ${deploymentConfig.deployer}`
      )
    }
    const balance: BigNumber = await signer.getBalance()
    return new Deployer(hre, signer, deployerAddress, balance, deploymentConfig, config, gasParams)
  }

  get hre(): HardhatRuntimeEnvironment {
    return this._hre
  }

  get signer(): ethers.Signer {
    return this._signer
  }

  get signerAddress(): `0x${string}` {
    return this._address
  }

  get address(): `0x${string}` {
    return this._address
  }

  get startBalance(): BigNumber {
    return this._startBalance
  }

  /**
   * Confirms with the user if they are deploying to a public network.
   * @returns {Promise<void>}
   */
  async confirmIfPublicDeployment(): Promise<void> {
    return await confirmIfPublicDeployment(this.hre, this.console)
  }

  /**
   * Passthrough to ethers.Signer.getBalance
   * @param blockTag The block number, or the string "latest", "earliest" or "pending"
   * @returns The balance of the account
   */
  async getBalance(blockTag?: any): Promise<BigNumber> {
    return await this._signer.getBalance(blockTag)
  }

  async deployIfNotDeployed(
    contractName: keyof FullDeployment,
    abi: any[],
    address: `0x${string}`,
    args: any[] = [],
    libraries?: { libraries: { [libraryName: string]: string } }
  ): Promise<Contract> {
    // check if already deployed on this network
    let contract: ethers.Contract = new ethers.Contract(address, abi, this._signer)
    try {
      this.console.log(`Checking for ${ORANGE}${contractName}${ENDC} at ${address}...`)
      const code = await contract.provider.getCode(address)
      if (code === '0x') {
        throw new Error('Contract not deployed')
      }
      this.console.log(`Found   ${address}: ${ORANGE}${contractName}${ENDC}`)
    } catch (e) {
      this.console.log(`Not found. Deploying ${ORANGE}${contractName}${ENDC}...`)
      await this.confirmIfPublicDeployment()
      contract = await this.deploy(contractName, args, libraries)
    }
    return contract
  }

  protected logTransaction(tx: providers.TransactionResponse): void {
    this.console.log(`    tx: ${GREEN}${tx.hash}${ENDC}`)

    if (this.hre.network.name === 'localhost' || this.hre.network.name === 'hardhat') {
      return
    }

    // log etherscan url
    const etherscanUrl = this.etherscanUrl(this.hre.network.name, tx)
    if (etherscanUrl === '') {
      this.console.log(`    etherscan: ${RED}unknown network${ENDC}`)
    } else {
      this.console.log(`    etherscan: ${GREEN}${etherscanUrl}${ENDC}`)
    }
  }

  protected etherscanUrl(network: string, tx: providers.TransactionResponse): string {
    if (network === 'mainnet') {
      return `https://etherscan.io/tx/${tx.hash}`
    } else if (network === 'goerli') {
      return `https://${network}.etherscan.io/tx/${tx.hash}`
    } else if (network === 'sepolia') {
      return `https://${network}.etherscan.io/tx/${tx.hash}`
    } else {
      // unknown network
      return ``
    }
  }

  protected logDeployment(contractName: keyof FullDeployment, address: `0x${string}`, receipt: ContractReceipt): void {
    const gasUsed: BigNumber = receipt.gasUsed
    const gasPrice: BigNumber = receipt.effectiveGasPrice
    this._costs[contractName] = gasUsed.mul(gasPrice)
    this.console.log(`Deployed ${ORANGE}${contractName}${ENDC} to ${GREEN}${address}${ENDC}`)
    this.console.log(`    ${address}: ${contractName}`)
    this.console.log(`    Gas used   :         ${fmtCommas(gasUsed.toNumber())} gas`)
    this.console.log(`    Gas price  :         ${fmtCommas(gasPrice.toNumber())} gwei`)
    this.console.log(`    ETH spent  :         ${ethers.utils.formatEther(gasUsed.mul(gasPrice))} ETH`)
    const cumulativeCost = Object.values(this._costs).reduce((a, b) => a.add(b), BigNumber.from(0))
    this.console.log(`    Cumulative :         ${ethers.utils.formatEther(cumulativeCost)} ETH`)
    this.console.log()
  }

  async deploy(
    contractName: keyof FullDeployment,
    args: any[] = [],
    libraries?: { libraries: { [libraryName: string]: string } }
  ): Promise<Contract> {
    try {
      const ContractFactory = await this.hre.ethers.getContractFactory(contractName, libraries)
      const contract: Contract = await ContractFactory.deploy(...args, this.gasParams) // is this a contract or a tx????
      this.console.log(`Deploying ${ORANGE}${contractName}${ENDC}...`)
      await contract.deployed()
      const receipt: providers.TransactionReceipt = await this.hre.ethers.provider.getTransactionReceipt(
        contract.deployTransaction.hash
      )
      this._costs[contractName] = receipt.gasUsed
      this.logDeployment(contractName, receipt.contractAddress as `0x${string}`, receipt)
      return contract
    } catch (e) {
      this.console.error(`Error deploying ${ORANGE}${contractName}${ENDC}: ${e}`)
      throw e
    }
  }

  nameAbiAddress(contractName: keyof FullDeployment): [keyof FullDeployment, any[], `0x${string}`] {
    const abi = this.deploymentConfig.contractConfigs[contractName].abi
    if (abi === undefined || abi === null) {
      throw new Error(`abi is undefined or null for ${ORANGE}${contractName}${ENDC}. Run build to build artifacts.`)
    }
    const address = this.deploymentConfig.contractConfigs[contractName].nonCreate2Address
    if (address === undefined || address === null) {
      throw new Error(
        `nonCreate2Address is undefined or null for ${ORANGE}${contractName}${ENDC}. Run build to build artifacts.`
      )
    }
    return [contractName, abi, address]
  }

  async initializeOpenAvatarGen0ProfilePictureRenderer(
    openAvatarGen0Assets: OpenAvatarGen0Assets,
    openAvatarGen0Renderer: OpenAvatarGen0Renderer,
    openAvatarGen0Token: OpenAvatarGen0Token,
    openAvatarGen0TextRecords: OpenAvatarGen0TextRecords,
    openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer
  ): Promise<void> {
    const isInitialized = await openAvatarGen0ProfilePictureRenderer.isInitialized()
    if (isInitialized) {
      this.console.log(
        `${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC} is already initialized. Skipping...`
      )
      return
    }

    this.console.log(`Initializing ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC}...`)
    let padLength = Deployable.OpenAvatarGen0TextRecords.length
    this.console.log(
      `Initialize ${ORANGE}${
        Deployable.OpenAvatarGen0ProfilePictureRenderer
      }${ENDC} with ${Deployable.OpenAvatarGen0Assets.padEnd(padLength)} as ${GREEN}${
        openAvatarGen0Assets.address
      }${ENDC}...`
    )
    this.console.log(
      `Initialize ${ORANGE}${
        Deployable.OpenAvatarGen0ProfilePictureRenderer
      }${ENDC} with ${Deployable.OpenAvatarGen0Renderer.padEnd(padLength)} as ${GREEN}${
        openAvatarGen0Renderer.address
      }${ENDC}...`
    )
    this.console.log(
      `Initialize ${ORANGE}${
        Deployable.OpenAvatarGen0ProfilePictureRenderer
      }${ENDC} with ${Deployable.OpenAvatarGen0Token.padEnd(padLength)} as ${GREEN}${
        openAvatarGen0Token.address
      }${ENDC}...`
    )
    this.console.log(
      `Initialize ${ORANGE}${
        Deployable.OpenAvatarGen0ProfilePictureRenderer
      }${ENDC} with ${Deployable.OpenAvatarGen0TextRecords.padEnd(padLength)} as ${GREEN}${
        openAvatarGen0TextRecords.address
      }${ENDC}...`
    )
    await this.confirmIfPublicDeployment()
    const tx = await openAvatarGen0ProfilePictureRenderer.initialize(
      openAvatarGen0Assets.address,
      openAvatarGen0Renderer.address,
      openAvatarGen0Token.address,
      openAvatarGen0TextRecords.address,
      this.gasParams
    )
    this.logTransaction(tx)
    await tx.wait()
  }

  async transferOwnerProxyOwnership(ownerProxy: Contract) {
    let ownerProxyOwner: string = await ownerProxy.owner()
    if (ownerProxyOwner === HARDHAT_DEFAULT_DEPLOYER_ADDRESS && this.address !== HARDHAT_DEFAULT_DEPLOYER_ADDRESS) {
      this.console.log()
      this.console.log(
        `Transferring ${ORANGE}${Deployable.OwnerProxy}${ENDC} ownership from ${ownerProxyOwner} to ${GREEN}${this.address}${ENDC}...`
      )
      // this is the default hardhat deployer address
      // use mnemonic: test test test test test test test test test test test junk
      // to sign a transaction to transfer ownership to the deployer

      // Get the provider from the contract
      const provider = ownerProxy.provider

      // Create a new Wallet instance with the default deployer private key and connect it to the provider
      const defaultDeployerWallet = new ethers.Wallet(HARDHAT_DEFAULT_DEPLOYER_PRIVATE_KEY, provider)

      // Connect the contract to the default deployer wallet so that it becomes the signer
      const ownerProxyWithDefaultDeployer = ownerProxy.connect(defaultDeployerWallet)

      // Now you can sign a transaction to transfer ownership to the deployer
      await this.confirmIfPublicDeployment()
      const transactionResponse = await ownerProxyWithDefaultDeployer.transferOwnership(this.address)
      await transactionResponse.wait()

      ownerProxyOwner = await ownerProxy.owner()
      if (ownerProxyOwner !== this.address) {
        throw new Error(`OwnerProxy owner is ${ownerProxyOwner} but signer is: ${this.address}`)
      }
    } else {
      this.console.log(
        `${ORANGE}${Deployable.OwnerProxy}${ENDC} owner is ${GREEN}${ownerProxyOwner}${ENDC}. Skipping transfer...`
      )
    }
  }

  async deploySteps(steps: number): Promise<PartialContracts> {
    if (steps !== 0) {
      throw new Error(`steps must be 0`)
    }
    ///////////////////////////////////////////////////////////////////////////
    // ImmutableCreate2Factory
    ///////////////////////////////////////////////////////////////////////////
    this.console.log(`Deploying ${ORANGE}${Deployable.ImmutableCreate2Factory}${ENDC}...`)
    const immutableCreate2Factory: Contract = await this.deployIfNotDeployed(
      ...this.nameAbiAddress(Deployable.ImmutableCreate2Factory as keyof FullDeployment)
    )

    ///////////////////////////////////////////////////////////////////////////
    // OwnerProxy
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OwnerProxy}${ENDC}...`)
    const ownerProxy: Contract = await this.deployIfNotDeployed(
      ...this.nameAbiAddress(Deployable.OwnerProxy as keyof FullDeployment),
      [OWNER_PROXY_MASTER]
    )

    ///////////////////////////////////////////////////////////////////////////
    // OwnerProxy::transferOwnership
    ///////////////////////////////////////////////////////////////////////////
    await this.transferOwnerProxyOwnership(ownerProxy)

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Assets
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0Assets}${ENDC}...`)
    const openAvatarGen0Assets: OpenAvatarGen0Assets = new OpenAvatarGen0Assets(
      this.hre,
      await this.deployIfNotDeployed(...this.nameAbiAddress(Deployable.OpenAvatarGen0Assets as keyof FullDeployment), [
        ownerProxy.address,
      ])
    )

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC}...`)
    const openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry = new OpenAvatarGen0RendererRegistry(
      this.hre,
      await this.deployIfNotDeployed(
        ...this.nameAbiAddress(Deployable.OpenAvatarGen0RendererRegistry as keyof FullDeployment),
        [ownerProxy.address]
      )
    )

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Renderer
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC}...`)
    const openAvatarGen0Renderer: OpenAvatarGen0Renderer = new OpenAvatarGen0Renderer(
      this.hre,
      await this.deployIfNotDeployed(
        ...this.nameAbiAddress(Deployable.OpenAvatarGen0Renderer as keyof FullDeployment),
        [ownerProxy.address]
      )
    )
    this.console.log(
      `Setting ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC} ${Deployable.OpenAvatarGen0Assets} to ${GREEN}${openAvatarGen0Assets.address}${ENDC}...`
    )
    await openAvatarGen0Renderer.initialize(openAvatarGen0Assets.address)

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Token
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0Token}${ENDC}...`)
    const openAvatarGen0Token: OpenAvatarGen0Token = new OpenAvatarGen0Token(
      this.hre,
      await this.deployIfNotDeployed(...this.nameAbiAddress(Deployable.OpenAvatarGen0Token as keyof FullDeployment), [
        ownerProxy.address,
      ])
    )

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0TextRecords
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0TextRecords}${ENDC}...`)
    const openAvatarGen0TextRecords: OpenAvatarGen0TextRecords = new OpenAvatarGen0TextRecords(
      this.hre,
      await this.deployIfNotDeployed(
        ...this.nameAbiAddress(Deployable.OpenAvatarGen0TextRecords as keyof FullDeployment),
        [ownerProxy.address]
      )
    )

    this.console.log(
      `Setting ${ORANGE}${Deployable.OpenAvatarGen0TextRecords}${ENDC} ${Deployable.OpenAvatarGen0Token}...`
    )
    const tx = await openAvatarGen0TextRecords.initialize(openAvatarGen0Token.address)
    this.logTransaction(tx)
    await tx.wait()

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0ProfilePictureRenderer
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC}...`)
    const openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer =
      new OpenAvatarGen0ProfilePictureRenderer(
        this.hre,
        await this.deployIfNotDeployed(
          ...this.nameAbiAddress(Deployable.OpenAvatarGen0ProfilePictureRenderer as keyof FullDeployment),
          [ownerProxy.address]
        )
      )
    await this.initializeOpenAvatarGen0ProfilePictureRenderer(
      openAvatarGen0Assets,
      openAvatarGen0Renderer,
      openAvatarGen0Token,
      openAvatarGen0TextRecords,
      openAvatarGen0ProfilePictureRenderer
    )

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::initialize
    ///////////////////////////////////////////////////////////////////////////

    this.console.log(
      `Setting ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC} ${Deployable.OpenAvatarGen0TextRecords}...`
    )
    await openAvatarGen0RendererRegistry.initialize(openAvatarGen0TextRecords.address)

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Token::initialize
    ///////////////////////////////////////////////////////////////////////////

    this.console.log(
      `Setting ${ORANGE}${Deployable.OpenAvatarGen0Token}${ENDC} ${Deployable.OpenAvatarGen0RendererRegistry}...`
    )
    await openAvatarGen0Token.initialize(openAvatarGen0RendererRegistry.address)

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::addRenderer('base')
    ///////////////////////////////////////////////////////////////////////////

    this.console.log(
      `Adding ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC} to ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC}...`
    )
    await openAvatarGen0RendererRegistry.addRenderer('base', openAvatarGen0Renderer.address)

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::addRenderer('pfp')
    ///////////////////////////////////////////////////////////////////////////
    this.console.log(
      `Adding ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC} to ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC}...`
    )
    await openAvatarGen0RendererRegistry.addRenderer('pfp', openAvatarGen0ProfilePictureRenderer.address)

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::setDefaultRendererByKey('pfp')
    ///////////////////////////////////////////////////////////////////////////
    await openAvatarGen0RendererRegistry.setDefaultRendererByKey('pfp')

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0ExampleMutableCanvasRenderer
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer}${ENDC}...`)
    const openAvatarGen0ExampleMutableCanvasRenderer: OpenAvatarGen0ExampleMutableCanvasRenderer =
      new OpenAvatarGen0ExampleMutableCanvasRenderer(
        this.hre,
        await this.deployIfNotDeployed(
          ...this.nameAbiAddress(Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer as keyof FullDeployment),
          [ownerProxy.address]
        )
      )
    this.console.log(
      `Setting ${ORANGE}${Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer}${ENDC} ${Deployable.OpenAvatarGen0Assets} to ${GREEN}${openAvatarGen0Assets.address}${ENDC}...`
    )
    await openAvatarGen0ExampleMutableCanvasRenderer.initialize(openAvatarGen0Assets.address)

    return new Contracts({
      [Deployable.ImmutableCreate2Factory]: immutableCreate2Factory,
      [Deployable.OwnerProxy]: ownerProxy,
      [Deployable.OpenAvatarGen0Assets]: openAvatarGen0Assets,
      [Deployable.OpenAvatarGen0RendererRegistry]: openAvatarGen0RendererRegistry,
      [Deployable.OpenAvatarGen0Renderer]: openAvatarGen0Renderer,
      [Deployable.OpenAvatarGen0Token]: openAvatarGen0Token,
      [Deployable.OpenAvatarGen0TextRecords]: openAvatarGen0TextRecords,
      [Deployable.OpenAvatarGen0ProfilePictureRenderer]: openAvatarGen0ProfilePictureRenderer,
      [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: openAvatarGen0ExampleMutableCanvasRenderer,
    })
  }
}

interface Create2Deployment {
  contractName: keyof FullDeployment
  contract: Contract
  expectedAddress: `0x${string}`
}

/**
 * Deployer that uses CREATE2 to deploy contracts
 */
export class Create2Deployer extends Deployer {
  static async make(
    hre: HardhatRuntimeEnvironment,
    deploymentConfig: DeploymentConfig,
    config: Config = { logging: DEFAULT_ON },
    gasParams: GasParams
  ): Promise<Deployer> {
    const [signer] = await hre.ethers.getSigners()
    const deployerAddress: `0x${string}` = (await signer.getAddress()) as `0x${string}`
    if (deployerAddress !== deploymentConfig.deployer) {
      throw new Error(
        `Deployer address ${deployerAddress} does not match expected deployer address ${deploymentConfig.deployer}`
      )
    }
    const balance: BigNumber = await signer.getBalance()
    return new Create2Deployer(hre, signer, deployerAddress, balance, deploymentConfig, config, gasParams)
  }

  /**
   * Deploy a contract using CREATE2
   * @param contractName name of the contract to deploy
   * @param args arguments to pass to the constructor
   */
  async deployWithCreate2(
    immutableCreate2Factory: Contract,
    contractName: keyof FullDeployment,
    args: any[] = []
  ): Promise<Create2Deployment> {
    this.console.log(`Deploying ${ORANGE}${contractName}${ENDC} with CREATE2...`)
    const saltInfo: Create2SaltInfo = {
      args: this.deploymentConfig.contractConfigs[contractName].args,
      bestKnownSalt: this.deploymentConfig.contractConfigs[contractName].bestKnownSalt,
    }
    const abi = this.deploymentConfig.contractConfigs[contractName].abi
    if (abi === undefined || abi === null) {
      throw new Error(`abi is undefined or null for ${contractName}. Run build to build artifacts.`)
    }
    const bytecode = this.deploymentConfig.contractConfigs[contractName].bytecode
    if (bytecode === undefined || bytecode === null) {
      throw new Error(`bytecode is undefined or null for ${contractName}. Run build to build artifacts.`)
    }
    const create2Input = getCreate2Input(this.hre, contractName, args, abi, bytecode)

    const create2AddressSearch = searchCreate2Address(
      {
        hre: this.hre,
        leadingZeros: 0,
        factoryAddress: immutableCreate2Factory.address as `0x${string}`,
        contractName,
        args: saltInfo.args,
        abi,
        bytecode,
        limit: 1,
        first: BigNumber.from(saltInfo.bestKnownSalt),
      },
      this.deploymentConfig.contractConfigs[contractName].create2Address
    )
    const create2Address = create2AddressSearch.found

    // save all this information in a file so we can use it later
    const create2Info = {
      input: create2Input,
      address: create2Address,
      signer: this.address,
    }
    // log to file
    const create2InfoFile = path.join(this._hre.config.paths.artifacts, `${contractName}.create2.json`)
    // this.console.log(`Saving create2 info to ${create2InfoFile}`)
    try {
      fs.writeFileSync(create2InfoFile, JSON.stringify(create2Info, null, 2))
    } catch (e) {
      this.console.error(`Error writing create2 info to ${create2InfoFile}: ${e}`)
    }
    // 32 byte zero
    const checkAddressMatches = await immutableCreate2Factory.findCreate2Address(
      create2Address.saltBytes32,
      create2Input.initCode
    )
    if (checkAddressMatches === '0x0000000000000000000000000000000000000000') {
      // already deployed
    } else {
      if (checkAddressMatches !== create2Address.address) {
        // ansii red
        this.console.error(`\u001b[31m`)
        this.console.error(`searchCreate2Address                        : ${RED}${create2Address.address}${ENDC}`)
        this.console.error(`ImmutableCreate2Factory::findCreate2Address : ${GREEN}${checkAddressMatches}${ENDC}`)
        this.console.error(`\u001b[0m`)
      }

      const txOptions: Record<string, any> = {
        maxFeePerGas: this.gasParams.maxFeePerGas,
        maxPriorityFeePerGas: this.gasParams.maxPriorityFeePerGas,
      }

      // Estimate the gas limit
      const estimatedGasLimit = await this.hre.ethers.provider.estimateGas({
        to: immutableCreate2Factory.address,
        data: immutableCreate2Factory.interface.encodeFunctionData('safeCreate2', [
          create2Address.saltBytes32,
          create2Input.initCode,
        ]),
      })
      txOptions.gasLimit = estimatedGasLimit
      this.console.log(`    gas limit: ${fmtCommas(txOptions.gasLimit)}`)
      const impliedETHCost = estimatedGasLimit.mul(txOptions.maxFeePerGas.add(txOptions.maxPriorityFeePerGas))
      this.console.log(`    gas fees : ${ethers.utils.formatEther(impliedETHCost)} ETH`)

      await this.confirmIfPublicDeployment()

      // Broadcast the transaction
      const tx = await immutableCreate2Factory.safeCreate2(create2Address.saltBytes32, create2Input.initCode, txOptions)
      this.logTransaction(tx)
      const receipt = await tx.wait()
      this._costs[contractName] = receipt.gasUsed
      this.logDeployment(contractName, create2Address.address, receipt)
    }
    // should be zero now
    const confirmSuccessIfThisIsZero = await immutableCreate2Factory.findCreate2Address(
      create2Address.saltBytes32,
      create2Input.initCode
    )
    if (!confirmSuccessIfThisIsZero) {
      throw new Error('findCreate2Address should be zero after deployed with salt')
    }

    const deployedContract = new this.hre.ethers.Contract(create2Address.address, create2Input.abi, this._signer)
    return { contractName, contract: deployedContract, expectedAddress: create2AddressSearch.expected }
  }

  /**
   * Deploy the ImmutableCreate2Factory contract
   */
  async deployFactory(): Promise<Contract> {
    const immutableCreate2Factory: Contract = await this.deployIfNotDeployed(
      ...this.nameAbiAddress(Deployable.ImmutableCreate2Factory as keyof FullDeployment)
    )
    return immutableCreate2Factory
  }

  /**
   * Deploy all contracts
   */
  async deploySteps(steps: number): Promise<PartialContracts> {
    this.console.log(`Deploying ${steps} steps...`)
    // ensure steps is of type number
    if (typeof steps !== 'number') {
      throw new Error(`steps must be of type number but got ${typeof steps}`)
    }
    const deployment: PartialDeployment = {}
    if (steps === 0) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // ImmutableCreate2Factory
    ///////////////////////////////////////////////////////////////////////////
    this.console.log(`STEP 1/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.ImmutableCreate2Factory}${ENDC}...`)
    const immutableCreate2Factory: Contract = await this.deployFactory()
    deployment[Deployable.ImmutableCreate2Factory] = immutableCreate2Factory
    if (steps === 1) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OwnerProxy
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 2/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.OwnerProxy}${ENDC}...`)
    const ownerProxyDeployment: Create2Deployment = await this.deployWithCreate2(
      immutableCreate2Factory,
      Deployable.OwnerProxy as keyof FullDeployment,
      [OWNER_PROXY_MASTER]
    )
    const ownerProxy: Contract = ownerProxyDeployment.contract
    deployment[Deployable.OwnerProxy] = ownerProxy
    if (steps === 2) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OwnerProxy::transferOwnership
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 3/${steps}`)
    await this.transferOwnerProxyOwnership(ownerProxy)
    if (steps === 3) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Assets
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 4/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0Assets}${ENDC}...`)
    const openAvatarGen0AssetsDeployment: Create2Deployment = await this.deployWithCreate2(
      immutableCreate2Factory,
      Deployable.OpenAvatarGen0Assets as keyof FullDeployment,
      [ownerProxy.address]
    )
    const openAvatarGen0Assets: OpenAvatarGen0Assets = new OpenAvatarGen0Assets(
      this.hre,
      openAvatarGen0AssetsDeployment.contract
    )
    deployment[Deployable.OpenAvatarGen0Assets] = openAvatarGen0Assets
    if (steps === 4) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 5/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC}...`)
    const openAvatarGen0RendererRegistryDeployment: Create2Deployment = await this.deployWithCreate2(
      immutableCreate2Factory,
      Deployable.OpenAvatarGen0RendererRegistry as keyof FullDeployment,
      [ownerProxy.address]
    )
    const openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry = new OpenAvatarGen0RendererRegistry(
      this.hre,
      openAvatarGen0RendererRegistryDeployment.contract
    )
    deployment[Deployable.OpenAvatarGen0RendererRegistry] = openAvatarGen0RendererRegistry
    if (steps === 5) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Renderer
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 6/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC}...`)
    const openAvatarGen0RendererDeployment: Create2Deployment = await this.deployWithCreate2(
      immutableCreate2Factory,
      Deployable.OpenAvatarGen0Renderer as keyof FullDeployment,
      [ownerProxy.address]
    )
    const openAvatarGen0Renderer: OpenAvatarGen0Renderer = new OpenAvatarGen0Renderer(
      this.hre,
      openAvatarGen0RendererDeployment.contract
    )
    deployment[Deployable.OpenAvatarGen0Renderer] = openAvatarGen0Renderer
    if (steps === 6) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Token
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 7/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0Token}${ENDC}...`)
    const openAvatarGen0TokenDeployment: Create2Deployment = await this.deployWithCreate2(
      immutableCreate2Factory,
      Deployable.OpenAvatarGen0Token as keyof FullDeployment,
      [ownerProxy.address]
    )
    const openAvatarGen0Token: OpenAvatarGen0Token = new OpenAvatarGen0Token(
      this.hre,
      openAvatarGen0TokenDeployment.contract
    )
    deployment[Deployable.OpenAvatarGen0Token] = openAvatarGen0Token
    if (steps === 7) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0TextRecords
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 8/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0TextRecords}${ENDC}...`)
    const openAvatarGen0TextRecordsDeployment: Create2Deployment = await this.deployWithCreate2(
      immutableCreate2Factory,
      Deployable.OpenAvatarGen0TextRecords as keyof FullDeployment,
      [ownerProxy.address]
    )
    const openAvatarGen0TextRecords: OpenAvatarGen0TextRecords = new OpenAvatarGen0TextRecords(
      this.hre,
      openAvatarGen0TextRecordsDeployment.contract
    )
    deployment[Deployable.OpenAvatarGen0TextRecords] = openAvatarGen0TextRecords
    if (steps === 8) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0ProfilePictureRenderer
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 9/${steps}`)
    this.console.log(`Deploying ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC}...`)
    const openAvatarGen0ProfilePictureRendererDeployment: Create2Deployment = await this.deployWithCreate2(
      immutableCreate2Factory,
      Deployable.OpenAvatarGen0ProfilePictureRenderer as keyof FullDeployment,
      [ownerProxy.address]
    )
    const openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer =
      new OpenAvatarGen0ProfilePictureRenderer(this.hre, openAvatarGen0ProfilePictureRendererDeployment.contract)
    deployment[Deployable.OpenAvatarGen0ProfilePictureRenderer] = openAvatarGen0ProfilePictureRenderer
    if (steps === 9) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Renderer::initialize
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 10/${steps}`)
    // set the asset store
    const existingOpenAvatarGen0Assets = await openAvatarGen0Renderer.getOpenAvatarGen0Assets()
    if (existingOpenAvatarGen0Assets == '0x0000000000000000000000000000000000000000') {
      this.console.log(
        `Initialize ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC} with ${Deployable.OpenAvatarGen0Assets} as ${GREEN}${openAvatarGen0Assets.address}${ENDC}...`
      )
      await this.confirmIfPublicDeployment()
      const tx = await openAvatarGen0Renderer.initialize(openAvatarGen0Assets.address, this.gasParams)
      this.logTransaction(tx)
      await tx.wait()
    } else if (existingOpenAvatarGen0Assets !== openAvatarGen0Assets.address) {
      throw new Error(
        `Existing ${Deployable.OpenAvatarGen0Assets} ${existingOpenAvatarGen0Assets} does not match ${openAvatarGen0Assets.address}`
      )
    } else {
      this.console.log(`Match: ${existingOpenAvatarGen0Assets} ${ORANGE}${Deployable.OpenAvatarGen0Assets}${ENDC}`)
    }
    if (steps === 10) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0TextRecords::initialize
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 11/${steps}`)
    const existingOpenAvatarGen0Token = await openAvatarGen0TextRecords.getOpenAvatarGen0Token()
    if (existingOpenAvatarGen0Token == '0x0000000000000000000000000000000000000000') {
      this.console.log(
        `Initialize ${ORANGE}${Deployable.OpenAvatarGen0TextRecords}${ENDC} with ${Deployable.OpenAvatarGen0Token} as ${GREEN}${openAvatarGen0Token.address}${ENDC}...`
      )
      await this.confirmIfPublicDeployment()
      const tx = await openAvatarGen0TextRecords.initialize(openAvatarGen0Token.address, this.gasParams)
      this.logTransaction(tx)
      await tx.wait()
    } else if (existingOpenAvatarGen0Token !== openAvatarGen0Token.address) {
      throw new Error(
        `Existing ${Deployable.OpenAvatarGen0Token} ${existingOpenAvatarGen0Token} does not match ${openAvatarGen0Token.address}`
      )
    } else {
      this.console.log(`Match: ${existingOpenAvatarGen0Token} ${ORANGE}${Deployable.OpenAvatarGen0Token}${ENDC}`)
    }
    if (steps === 11) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::initialize
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 12/${steps}`)
    // set the text records
    const existingOpenAvatarGen0TextRecordsForOpenAvatarGen0RendererRegistry =
      await openAvatarGen0RendererRegistry.getOpenAvatarGen0TextRecords()
    if (
      existingOpenAvatarGen0TextRecordsForOpenAvatarGen0RendererRegistry == '0x0000000000000000000000000000000000000000'
    ) {
      this.console.log(
        `Initialize ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC} with ${Deployable.OpenAvatarGen0TextRecords} as ${GREEN}${openAvatarGen0TextRecords.address}${ENDC}...`
      )
      await this.confirmIfPublicDeployment()
      const tx = await openAvatarGen0RendererRegistry.initialize(openAvatarGen0TextRecords.address, this.gasParams)
      this.logTransaction(tx)
      await tx.wait()
    } else if (
      existingOpenAvatarGen0TextRecordsForOpenAvatarGen0RendererRegistry !== openAvatarGen0TextRecords.address
    ) {
      throw new Error(
        `Existing ${Deployable.OpenAvatarGen0TextRecords} ${existingOpenAvatarGen0TextRecordsForOpenAvatarGen0RendererRegistry} does not match ${openAvatarGen0TextRecords.address}`
      )
    } else {
      this.console.log(
        `Match: ${existingOpenAvatarGen0TextRecordsForOpenAvatarGen0RendererRegistry} ${ORANGE}${Deployable.OpenAvatarGen0TextRecords}${ENDC}`
      )
    }
    if (steps === 12) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0Token::initialize
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 13/${steps}`)
    const existingOpenAvatarGen0RendererRegistryForOpenAvatarGen0Token =
      await openAvatarGen0Token.getOpenAvatarGen0RendererRegistry()
    if (existingOpenAvatarGen0RendererRegistryForOpenAvatarGen0Token == '0x0000000000000000000000000000000000000000') {
      // set the renderer registry
      this.console.log(
        `Initialize ${ORANGE}${Deployable.OpenAvatarGen0Token}${ENDC} with ${Deployable.OpenAvatarGen0RendererRegistry} as ${GREEN}${openAvatarGen0RendererRegistry.address}${ENDC}...`
      )
      await this.confirmIfPublicDeployment()
      const tx = await openAvatarGen0Token.initialize(openAvatarGen0RendererRegistry.address, this.gasParams)
      this.logTransaction(tx)
      await tx.wait()
    } else if (
      existingOpenAvatarGen0RendererRegistryForOpenAvatarGen0Token !== openAvatarGen0RendererRegistry.address
    ) {
      throw new Error(
        `Existing ${Deployable.OpenAvatarGen0RendererRegistry} ${existingOpenAvatarGen0RendererRegistryForOpenAvatarGen0Token} does not match ${openAvatarGen0RendererRegistry.address}`
      )
    } else {
      this.console.log(
        `Match: ${existingOpenAvatarGen0RendererRegistryForOpenAvatarGen0Token} ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC}`
      )
    }
    if (steps === 13) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0ProfilePictureRenderer::initialize
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 14/${steps}`)
    await this.initializeOpenAvatarGen0ProfilePictureRenderer(
      openAvatarGen0Assets,
      openAvatarGen0Renderer,
      openAvatarGen0Token,
      openAvatarGen0TextRecords,
      openAvatarGen0ProfilePictureRenderer
    )
    if (steps === 14) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::addRenderer('base')
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 15/${steps}`)
    const numRenderersBase = await openAvatarGen0RendererRegistry.getNumRenderers()
    if (numRenderersBase === 0) {
      this.console.log(
        `Adding ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC} to ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC}...`
      )
      await this.confirmIfPublicDeployment()
      const tx = await openAvatarGen0RendererRegistry.addRenderer(
        'base',
        openAvatarGen0Renderer.address,
        this.gasParams
      )
      this.logTransaction(tx)
      await tx.wait()
    } else {
      const existingOpenAvatarGen0Renderer = await openAvatarGen0RendererRegistry.getRendererByKey('base')
      if (existingOpenAvatarGen0Renderer !== openAvatarGen0Renderer.address) {
        throw new Error(
          `Existing ${Deployable.OpenAvatarGen0Renderer} ${existingOpenAvatarGen0Renderer} does not match ${openAvatarGen0Renderer.address}`
        )
      } else {
        this.console.log(
          `Registry match: ${existingOpenAvatarGen0Renderer} ${ORANGE}${Deployable.OpenAvatarGen0Renderer}${ENDC}`
        )
      }
    }
    if (steps === 15) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::addRenderer('pfp')
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 16/${steps}`)
    const numRenderersPfp = await openAvatarGen0RendererRegistry.getNumRenderers()
    if (numRenderersPfp === 1) {
      this.console.log(
        `Adding ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC} to ${ORANGE}${Deployable.OpenAvatarGen0RendererRegistry}${ENDC}...`
      )
      await this.confirmIfPublicDeployment()
      const tx = await openAvatarGen0RendererRegistry.addRenderer(
        'pfp',
        openAvatarGen0ProfilePictureRenderer.address,
        this.gasParams
      )
      this.logTransaction(tx)
      await tx.wait()
    } else {
      const existingOpenAvatarGen0ProfilePictureRenderer = await openAvatarGen0RendererRegistry.getRendererByKey('pfp')
      if (existingOpenAvatarGen0ProfilePictureRenderer !== openAvatarGen0ProfilePictureRenderer.address) {
        throw new Error(
          `Existing ${Deployable.OpenAvatarGen0Renderer} ${existingOpenAvatarGen0ProfilePictureRenderer} does not match ${openAvatarGen0ProfilePictureRenderer.address}`
        )
      } else {
        this.console.log(
          `Registry match: ${existingOpenAvatarGen0ProfilePictureRenderer} ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC}`
        )
      }
    }
    if (steps === 16) {
      return new PartialContracts(deployment)
    }

    ///////////////////////////////////////////////////////////////////////////
    // OpenAvatarGen0RendererRegistry::setDefaultRendererByKey('pfp')
    ///////////////////////////////////////////////////////////////////////////
    this.console.log()
    this.console.log(`STEP 17/${steps}`)
    const existingOpenAvatarDefaultRenderer = await openAvatarGen0RendererRegistry.getDefaultRenderer()
    if (existingOpenAvatarDefaultRenderer !== openAvatarGen0ProfilePictureRenderer.address) {
      this.console.log(
        `Setting ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC} as default renderer (current: ${existingOpenAvatarDefaultRenderer})...`
      )
      await this.confirmIfPublicDeployment()
      const tx = await openAvatarGen0RendererRegistry.setDefaultRendererByKey('pfp', this.gasParams)
      this.logTransaction(tx)
      await tx.wait()
    } else {
      this.console.log(
        `Default renderer match: ${existingOpenAvatarDefaultRenderer} ${ORANGE}${Deployable.OpenAvatarGen0ProfilePictureRenderer}${ENDC}`
      )
    }
    if (steps === 17) {
      return new PartialContracts(deployment)
    }

    const skipExample: boolean = isPublicNetwork(this.hre.network) || this.address !== HARDHAT_DEFAULT_DEPLOYER_ADDRESS

    let openAvatarGen0ExampleMutableCanvasRendererDeployment: Create2Deployment | undefined = undefined
    if (skipExample) {
      console.log('Skip deploying example renderer on public network')
      await this.confirmIfPublicDeployment()
      return new PartialContracts(deployment)
    } else {
      ///////////////////////////////////////////////////////////////////////////
      // OpenAvatarGen0ExampleMutableCanvasRenderer
      ///////////////////////////////////////////////////////////////////////////
      this.console.log()
      this.console.log(`STEP 18/${steps}`)
      this.console.log(`\nDeploying ${ORANGE}${Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer}${ENDC}...`)
      openAvatarGen0ExampleMutableCanvasRendererDeployment = await this.deployWithCreate2(
        immutableCreate2Factory,
        Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer as keyof FullDeployment,
        [ownerProxy.address]
      )
      const openAvatarGen0ExampleMutableCanvasRenderer: OpenAvatarGen0ExampleMutableCanvasRenderer =
        new OpenAvatarGen0ExampleMutableCanvasRenderer(
          this.hre,
          openAvatarGen0ExampleMutableCanvasRendererDeployment.contract
        )
      deployment[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer] = openAvatarGen0ExampleMutableCanvasRenderer
      if (steps === 18) {
        return new PartialContracts(deployment)
      }

      ///////////////////////////////////////////////////////////////////////////
      // OpenAvatarGen0ExampleMutableCanvasRenderer::initialize
      ///////////////////////////////////////////////////////////////////////////
      this.console.log()
      this.console.log(`STEP 19/${steps}`)
      const existingOpenAvatarGen0Assets3 = await openAvatarGen0ExampleMutableCanvasRenderer.getOpenAvatarGen0Assets()
      if (existingOpenAvatarGen0Assets3 == '0x0000000000000000000000000000000000000000') {
        this.console.log(
          `Setting ${ORANGE}${Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer}${ENDC} ${Deployable.OpenAvatarGen0Assets} to ${GREEN}${openAvatarGen0Assets.address}${ENDC}...`
        )
        const tx = await openAvatarGen0ExampleMutableCanvasRenderer.initialize(openAvatarGen0Assets.address)
        this.logTransaction(tx)
        await tx.wait()
      } else if (existingOpenAvatarGen0Assets3 !== openAvatarGen0Assets.address) {
        throw new Error(
          `Existing ${Deployable.OpenAvatarGen0Assets} ${existingOpenAvatarGen0Assets3} does not match ${openAvatarGen0Assets.address}`
        )
      } else {
        this.console.log(`Match: ${existingOpenAvatarGen0Assets3} ${ORANGE}${Deployable.OpenAvatarGen0Assets}${ENDC}`)
      }
      if (steps === 19) {
        return new PartialContracts(deployment)
      }
    }

    ///////////////////////////////////////////////////////////////////////////
    // ERRORS
    ///////////////////////////////////////////////////////////////////////////
    let anyMismatch = false
    let replacers: { before: string; after: string }[] = []
    for (const deployment of [
      ownerProxyDeployment,
      openAvatarGen0AssetsDeployment,
      openAvatarGen0RendererDeployment,
      openAvatarGen0RendererRegistryDeployment,
      openAvatarGen0TokenDeployment,
      openAvatarGen0TextRecordsDeployment,
      openAvatarGen0ProfilePictureRendererDeployment,
      openAvatarGen0ExampleMutableCanvasRendererDeployment,
    ]) {
      if (deployment === undefined) {
        this.console.error()
        continue
      }
      const matches = deployment.contract.address === deployment.expectedAddress
      if (!matches) {
        // log configuredAddress in red ansii
        this.console.error()
        this.console.error(
          `${ORANGE}${deployment.contractName}${ENDC} hard-coded           ${RED}${deployment.expectedAddress}${ENDC}`
        )
        this.console.error(
          `${ORANGE}${deployment.contractName}${ENDC} searchCreate2Address ${GREEN}${deployment.contract.address}${ENDC}`
        )
        anyMismatch = true
        replacers.push({
          before: deployment.expectedAddress,
          after: deployment.contract.address,
        })
      }
    }
    let combined = ''
    if (replacers.length > 0) {
      this.console.error()
    }
    for (const replace of replacers) {
      // log sed command to fix source code
      const sedPattern = `'s/${RED}${replace.before}${ENDC}/${GREEN}${replace.after}${ENDC}/g'`
      this.console.error(`sed -i ${sedPattern} contracts/src/abi/config/*.ts web/abi/ABI.ts`)
      combined += `-e s/${replace.before}/${replace.after}/g `
    }
    if (combined) {
      const cmd = `sed -i ${combined} contracts/src/abi/config/*.ts web/abi/ABI.ts`
      this.console.error()
      this.console.error()
      this.console.error()
      this.console.error(cmd)
      this.console.error()
      this.console.error()
      this.console.error()
      // write cmd to artifacts/fix_abi.sh
      const cwd = process.cwd()
      const fixAbiPath = path.join(cwd, 'artifacts', 'fix_abi.sh')
      const header = `#!/bin/bash\n# This file was generated by ${__filename}\n\nset -e\nset -o pipefail\nset -x\n\n`
      // const debug = 'ls -l\nls -l web\n ls -l web/src\n\nls -l web/abi\n\n'
      try {
        fs.writeFileSync(fixAbiPath, header + cmd)
        fs.chmodSync(fixAbiPath, 0o755)
        this.console.error(`Wrote ${fixAbiPath}`)
        this.console.error()
        this.console.error()
        this.console.error()
      } catch (e) {
        this.console.error(`Failed to write ${fixAbiPath}`)
      }
    }
    if (anyMismatch) {
      throw new Error('Contract address mismatch')
    }

    return deployment[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer] === undefined
      ? new PartialContracts(deployment)
      : new PartialContracts(deployment)
  }
}
