import { AvatarDefinitions, AvatarLayerStack, DNA, PatternDescriptor } from '@openavatar/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployable } from '../abi/Deployable'
import { OpenAvatarGen0Assets } from '../client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Token } from '../client/OpenAvatarGen0Token'
import {
  OpenAvatarGen0ProfilePictureRenderer,
  OpenAvatarProfilePictureSettings,
} from '../client/extensions/OpenAvatarGen0ProfilePictureRenderer'
import { Contracts } from '../deploy/Deployer'
import { BaseRunner } from './BaseRunner'

import { AvatarConsoleDrawer } from '@openavatar/assets'
import { DeploymentConfig } from '../abi/DeploymentConfig'
import { chooseDeploymentConfiguration } from '../abi/DeploymentConfigChooser'
import { NPC, NPCAvatar } from '../avatars/NPC'
import { GasParams } from '../client/GasParams'
import { OpenAvatarGen0TextRecords } from '../client/OpenAvatarGen0TextRecords'
import { confirmIfPublicDeployment } from '../util/NetworkUtils'
import { RenderDecoder } from '../util/RenderDecoder'
import { fmtCommas } from '../util/StringUtils'

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const ENDC = '\x1b[0m'

type PatternLimitWithPaletteLimits = {
  n: number
  palettesN: number[]
}

type PatternPaletteLimitsByLayerName = Record<string, PatternLimitWithPaletteLimits>

const npcMints: NPCAvatar[] = [...NPC.FIRST_100]

export class MintRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment): Promise<void> {
    await this.waitForNetwork(hre)
    this.logNetwork(hre)

    const beforeEthBalance = await hre.ethers.provider.getBalance(hre.ethers.provider.getSigner().getAddress())
    this.console.log(`ETH balance: ${hre.ethers.utils.formatEther(beforeEthBalance)}`)

    const gasParams = {
      maxFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxfeepergas, 'gwei'),
      maxPriorityFeePerGas: hre.ethers.utils.parseUnits(taskArgs.maxpriorityfeepergas, 'gwei'),
    }
    const gasParamsAsStringsForLogging = {
      maxFeePerGas: fmtCommas(gasParams.maxFeePerGas.toNumber() / 10 ** 9),
      maxPriorityFeePerGas: fmtCommas(gasParams.maxPriorityFeePerGas.toNumber() / 10 ** 9),
    }
    this.console.log(`Minting with gas params:`)
    this.console.log(`    maxFeePerGas         : ${gasParamsAsStringsForLogging.maxFeePerGas} gwei`)
    this.console.log(`    maxPriorityFeePerGas : ${gasParamsAsStringsForLogging.maxPriorityFeePerGas} gwei`)

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

    const openAvatarGen0Token: OpenAvatarGen0Token = contracts[Deployable.OpenAvatarGen0Token]
    const owner = await contracts[Deployable.OpenAvatarGen0Token].owner()
    this.console.log(`${Deployable.OpenAvatarGen0Token} owner: ${owner}`)
    const openAvatarGen0Assets: OpenAvatarGen0Assets = contracts[Deployable.OpenAvatarGen0Assets]
    const openAvatarGen0TextRecords: OpenAvatarGen0TextRecords = contracts[Deployable.OpenAvatarGen0TextRecords]
    // const openAvatarGen0Renderer: OpenAvatarGen0Renderer = contracts[Deployable.OpenAvatarGen0Renderer]
    const openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer =
      contracts[Deployable.OpenAvatarGen0ProfilePictureRenderer]

    if (taskArgs.onlyowner && taskArgs.public) {
      throw new Error('Cannot enable both ONLY_OWNER and PUBLIC')
    }
    if (taskArgs.npcs && taskArgs.dna) {
      throw new Error('Cannot mint npcs and specific DNA at once. Do separately for now.')
    }
    if (taskArgs.onlyowner) {
      const NUM_OWNER_MINTS: number = 1 + (taskArgs.npcs ? npcMints.length : 0) + (taskArgs.dna ? 1 : 0)
      ///////////////////////////////////////////////////////////////
      // Owner mint
      ///////////////////////////////////////////////////////////////
      let supplySoftCapExceedsOnlyOwnerAllotment = false
      const supplySoftCap = await openAvatarGen0Token.supplySoftCap()
      if (supplySoftCap === NUM_OWNER_MINTS) {
        this.console.log(
          `${Deployable.OpenAvatarGen0Token} supply soft cap is already ${CYAN}${NUM_OWNER_MINTS}${ENDC}`
        )
      } else if (supplySoftCap > NUM_OWNER_MINTS) {
        supplySoftCapExceedsOnlyOwnerAllotment = true
      } else {
        this.console.log(
          `Setting ${Deployable.OpenAvatarGen0Token} supply soft cap to ${GREEN}${NUM_OWNER_MINTS}${ENDC}`
        )
        await confirmIfPublicDeployment(hre, this.console)
        const tx = await openAvatarGen0Token.increaseSupplySoftCap(NUM_OWNER_MINTS, gasParams)
        this.console.log('    tx:', tx.hash)
        await tx.wait()
        this.console.log(`${Deployable.OpenAvatarGen0Token} supply soft cap is now ${CYAN}${NUM_OWNER_MINTS}${ENDC}`)
      }

      const isMintOnlyOwner = await openAvatarGen0Token.isMintOnlyOwner()
      const isMintPublic = await openAvatarGen0Token.isMintPublic()
      if (isMintOnlyOwner) {
        this.console.log(`${Deployable.OpenAvatarGen0Token} minting is already ${CYAN}ONLY_OWNER${ENDC}`)
      } else if (supplySoftCapExceedsOnlyOwnerAllotment && isMintPublic) {
        this.console.log(
          `${Deployable.OpenAvatarGen0Token} is ${CYAN}ONLY_OWNER${ENDC} and supply soft cap exceeds ${YELLOW}ONLY_OWNER${ENDC} allotment.` +
            ` Cannot set mint state to ${YELLOW}ONLY_OWNER${ENDC}.`
        )
      } else {
        this.console.log(`Setting ${Deployable.OpenAvatarGen0Token} mint state to ${GREEN}ONLY_OWNER${ENDC}`)
        await confirmIfPublicDeployment(hre, this.console)
        const tx = await openAvatarGen0Token.setMintState(OpenAvatarGen0Token.ONLY_OWNER, gasParams)
        this.console.log('    tx:', tx.hash)
        await tx.wait()
        this.console.log(`${Deployable.OpenAvatarGen0Token} minting is now ${CYAN}ONLY_OWNER${ENDC}`)
      }
    }

    if (taskArgs.public) {
      const NUM_PUBLIC_MINTS: number = 8192
      ///////////////////////////////////////////////////////////////
      // Public Mint
      ///////////////////////////////////////////////////////////////

      // 1. set mint price to 0.1 ETH
      const mintPrice = await openAvatarGen0Token.getMintPrice()
      const expectedMintPrice = hre.ethers.utils.parseEther('0.1')

      if (mintPrice.eq(expectedMintPrice)) {
        this.console.log(
          `${Deployable.OpenAvatarGen0Token} mint price is already ${CYAN}${hre.ethers.utils.formatEther(
            expectedMintPrice
          )} ETH${ENDC}`
        )
      } else {
        this.console.log(
          `Setting ${Deployable.OpenAvatarGen0Token} mint price to ${GREEN}${hre.ethers.utils.formatEther(
            expectedMintPrice
          )} ETH${ENDC}`
        )
        await confirmIfPublicDeployment(hre, this.console)
        const tx = await openAvatarGen0Token.setMintPrice(expectedMintPrice, gasParams)
        this.console.log('    tx:', tx.hash)
        await tx.wait()
        this.console.log(
          `${Deployable.OpenAvatarGen0Token} mint price is now ${CYAN}${hre.ethers.utils.formatEther(
            expectedMintPrice
          )} ETH${ENDC}`
        )
      }

      // 2. set supply soft cap to 8192
      const supplySoftCap = await openAvatarGen0Token.supplySoftCap()
      if (supplySoftCap === NUM_PUBLIC_MINTS) {
        this.console.log(
          `${Deployable.OpenAvatarGen0Token} supply soft cap is already ${CYAN}${NUM_PUBLIC_MINTS}${ENDC}`
        )
      } else if (supplySoftCap > NUM_PUBLIC_MINTS) {
        throw new Error(
          `${Deployable.OpenAvatarGen0Token} supply soft cap is ${supplySoftCap} which is greater than ${NUM_PUBLIC_MINTS}`
        )
      } else {
        this.console.log(
          `Setting ${Deployable.OpenAvatarGen0Token} supply soft cap to ${GREEN}${NUM_PUBLIC_MINTS}${ENDC}`
        )
        await confirmIfPublicDeployment(hre, this.console)
        const tx = await openAvatarGen0Token.increaseSupplySoftCap(NUM_PUBLIC_MINTS, gasParams)
        this.console.log('    tx:', tx.hash)
        await tx.wait()
        this.console.log(`${Deployable.OpenAvatarGen0Token} supply soft cap is now ${CYAN}${NUM_PUBLIC_MINTS}${ENDC}`)
      }

      // 3. set mint state to PUBLIC
      const isMintPublic = await openAvatarGen0Token.isMintPublic()
      if (isMintPublic) {
        this.console.log(`${Deployable.OpenAvatarGen0Token} minting is already ${CYAN}PUBLIC${ENDC}`)
      } else {
        this.console.log(`Setting ${Deployable.OpenAvatarGen0Token} mint state to ${GREEN}PUBLIC${ENDC}`)
        await confirmIfPublicDeployment(hre, this.console)
        const tx = await openAvatarGen0Token.setMintState(OpenAvatarGen0Token.PUBLIC, gasParams)
        this.console.log('    tx:', tx.hash)
        await tx.wait()
        this.console.log(`${Deployable.OpenAvatarGen0Token} minting is now ${CYAN}PUBLIC${ENDC}`)
      }
    }
    let totalSupply = await openAvatarGen0Token.totalSupply()
    this.console.log(`${Deployable.OpenAvatarGen0Token} Total supply: ${totalSupply}`)

    // mint zero avatar
    if (taskArgs.zero) {
      if (totalSupply !== 0) {
        this.console.log(`Already minted zero avatar. Skipping...`)
      } else {
        this.console.log(`Minting zero avatar...`)
        await this.mintAndRender(hre, openAvatarGen0Token, openAvatarGen0ProfilePictureRenderer, DNA.ZERO, gasParams)
        totalSupply = await openAvatarGen0Token.totalSupply()
      }
      this.console.log(`${Deployable.OpenAvatarGen0Token} Total supply: ${totalSupply}`)
    }

    if (taskArgs.npcs) {
      this.console.log(`Minting ${npcMints.length} NPC avatars...`)

      const unmintedNpcMints = []
      for (const npcMint of npcMints) {
        const isMinted = await openAvatarGen0Token.isMinted(npcMint.dna)
        this.console.log(`${npcMint.dna} is minted: ${isMinted}`)
        if (!isMinted) {
          unmintedNpcMints.push(npcMint)
        }
      }
      this.console.log(`Unminted NPC avatars: ${unmintedNpcMints.length}`)

      const batchSize = 20
      const offsetFromZeroIndex = 1
      let firstNPCIndex = totalSupply - offsetFromZeroIndex - (npcMints.length - unmintedNpcMints.length)

      while (firstNPCIndex < unmintedNpcMints.length) {
        // get a batch of up to 20 NPCs
        const batch: NPCAvatar[] = unmintedNpcMints.slice(firstNPCIndex, firstNPCIndex + batchSize)
        if (batch.length === 0) {
          this.console.log(`Already minted all ${unmintedNpcMints.length} NPC avatars. Skipping...`)
          break
        } else {
          await confirmIfPublicDeployment(hre, this.console)
          const tx = await openAvatarGen0Token.mintBatch__withGasParams(
            batch.map((a) => a.dna),
            gasParams
          )
          this.console.log('    tx:', tx.hash)
          await tx.wait()

          totalSupply = await openAvatarGen0Token.totalSupply()
          this.console.log(`${Deployable.OpenAvatarGen0Token} Total supply: ${totalSupply}`)
          this.console.log(`${Deployable.OpenAvatarGen0Token} NPC mint complete.`)

          // render the avatars
          for (const avatar of batch) {
            // print out avatar's info
            this.console.log(avatar.toString())
            const renderURI: string = await openAvatarGen0ProfilePictureRenderer.renderURI(avatar.dna)
            const decoded = RenderDecoder.decode(renderURI)
            AvatarConsoleDrawer.draw(decoded.hex)
          }

          // move to the next batch
          firstNPCIndex += batchSize
        }
      }
    }

    if (taskArgs.npcbackgrounds) {
      // batch set all the NPC background colors
      const key = 'gen0.renderer.pfp.background-color'

      interface Job {
        tokenId: number
        dna: DNA
        value: string
      }

      const pad3 = (n: number) => {
        return n.toString().padStart(3, ' ')
      }

      const jobs: Job[] = []
      for (let i = 0; i < npcMints.length; i++) {
        const tokenId = i + 1
        const npcMint = npcMints[i]
        // retrieve existing record to see if it needs to be updated
        const onchainValue: string = await openAvatarGen0TextRecords.text(npcMint.dna, key)
        const onchainValueNotEmpty = onchainValue !== ''
        const overrideMatches = onchainValueNotEmpty === npcMint.pfpSettings.overrideBackground

        if (overrideMatches) {
          // if both are empty, then we don't need to do anything
          if (!onchainValueNotEmpty) {
            this.console.log(`${CYAN}#${pad3(tokenId)}${ENDC} ${key} is already empty`)
            continue
          }

          // else that means both are not empty, so we need to check if they match
          const onchainMatchesConfig = onchainValue === npcMint.pfpSettings.backgroundColor
          if (onchainMatchesConfig) {
            this.console.log(`${CYAN}#${pad3(tokenId)}${ENDC} ${key} ${CYAN}${onchainValue}${ENDC}`)
            continue
          }

          // else that means they don't match, so we need to update
          if (!npcMint.pfpSettings.backgroundColor) {
            throw new Error(`NPC #${tokenId} ${npcMint.dna} has overrideBackground but no backgroundColor`)
          }
          jobs.push({
            tokenId,
            dna: npcMint.dna,
            value: npcMint.pfpSettings.backgroundColor,
          })
        } else {
          // else if the overrides don't match, then we need to update

          // there are 2 cases:

          // 1. if the onchain value is empty, then we need to set it because the override is set
          if (!onchainValueNotEmpty) {
            if (!npcMint.pfpSettings.backgroundColor) {
              throw new Error(`NPC #${tokenId} ${npcMint.dna} has overrideBackground but no backgroundColor`)
            }
            jobs.push({
              tokenId,
              dna: npcMint.dna,
              value: npcMint.pfpSettings.backgroundColor,
            })
          } else {
            // 2. if the onchain value is not empty, then we need to clear it because the override is not set
            jobs.push({
              tokenId,
              dna: npcMint.dna,
              value: '',
            })
          }
        }
      }

      // const batch jobs in groups of 20
      const batchSize = 20
      const batches: Job[][] = []
      for (let i = 0; i < jobs.length; i += batchSize) {
        batches.push(jobs.slice(i, i + batchSize))
      }

      for (const batch of batches) {
        this.console.log(`Setting ${key} for ${batch.length} NPC avatars`)
        // loop through and log the updates
        for (const job of batch) {
          this.console.log(`    ${CYAN}#${pad3(job.tokenId)} ${key}${ENDC} ${GREEN}${job.value}${ENDC}`)
        }
        await confirmIfPublicDeployment(hre, this.console)
        const tx = await openAvatarGen0TextRecords.setTextBatch(
          batch.map((job) => {
            return {
              dna: job.dna,
              key,
              value: job.value,
            }
          })
        )
        this.console.log('    tx:', tx.hash)
        await tx.wait()
      }
    }

    if (taskArgs.dna) {
      this.console.log(`Minting received DNA arg: ${taskArgs.dna}...`)
      let dna: DNA
      if (taskArgs.dna === 'random') {
        const limits = await this.getLimits(openAvatarGen0Assets)
        dna = DNA.random(limits)
      } else {
        dna = new DNA(taskArgs.dna)
      }
      await this.mintAndRender(hre, openAvatarGen0Token, openAvatarGen0ProfilePictureRenderer, dna, gasParams)
    }

    if (taskArgs.infinite) {
      this.console.log('Minting in infinite loop...')
      await this.mintInfiniteInLoop(
        hre,
        openAvatarGen0Token,
        openAvatarGen0Assets,
        openAvatarGen0ProfilePictureRenderer,
        gasParams
      )
    }

    const afterEthBalance = await hre.ethers.provider.getBalance(hre.ethers.provider.getSigner().getAddress())
    this.console.log(`Account balance         :  ${hre.ethers.utils.formatEther(afterEthBalance)}`)
    this.console.log(`Previous balance        :  ${hre.ethers.utils.formatEther(beforeEthBalance)}`)
    this.console.log(
      `Account balance change  : -${hre.ethers.utils.formatEther(beforeEthBalance.sub(afterEthBalance))}`
    )
  }

  async setProfilePictureSettings(
    hre: HardhatRuntimeEnvironment,
    dna: DNA,
    contracts: Contracts,
    pfpSettings: OpenAvatarProfilePictureSettings
  ): Promise<void> {
    const openAvatarGen0TextRecords = contracts[Deployable.OpenAvatarGen0TextRecords]
    this.console.log(`Checking background color for DNA: ${dna}`)
    const existingBackground: string = await openAvatarGen0TextRecords.text(dna, 'gen0.renderer.pfp.background-color')
    if (existingBackground !== pfpSettings.backgroundColor) {
      const key1: string = 'gen0.renderer.pfp.background-color'
      const value1: string = pfpSettings.overrideBackground ? pfpSettings.backgroundColor : ''
      const key2: string = 'gen0.renderer.pfp.mask'
      const value2: string = pfpSettings.maskBelowTheNeck ? 'below-the-neck' : ''

      this.console.log(`Setting ${key1} to "${value1}" for DNA: ${dna}`)
      this.console.log(`Setting ${key2} to "${value2}" for DNA: ${dna}`)
      await confirmIfPublicDeployment(hre, this.console)
      const tx = await openAvatarGen0TextRecords.setText2(dna, key1, value1, key2, value2)
      this.console.log('    tx:', tx.hash)
      await tx.wait()
    } else {
      this.console.log(`Background color is already set to ${pfpSettings.backgroundColor} for DNA: ${dna}`)
    }
  }

  private async mintInfiniteInLoop(
    hre: HardhatRuntimeEnvironment,
    NFT: OpenAvatarGen0Token,
    openAvatarGen0Assets: OpenAvatarGen0Assets,
    openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer,
    gasParams: GasParams
  ) {
    let dna = DNA.ZERO
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // find unminted random
      let limits: PatternPaletteLimitsByLayerName = await this.getLimits(openAvatarGen0Assets)
      dna = DNA.random(limits)
      while (await NFT.isMinted(dna)) {
        this.console.log(`\x1b[33m\x1b[1mAlready minted: ${dna.toString()}\x1b[0m`)
        limits = await this.getLimits(openAvatarGen0Assets)
        dna = DNA.random(limits)
        // rate limit checking
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      await this.mintAndRender(hre, NFT, openAvatarGen0ProfilePictureRenderer, dna, gasParams)
    }
  }

  private async getLimits(store: OpenAvatarGen0Assets): Promise<PatternPaletteLimitsByLayerName> {
    const limits: PatternPaletteLimitsByLayerName = {}
    for (const layer of AvatarLayerStack.iter()) {
      const numPatterns = await store.getNumPatterns(0, layer.index)
      const paletteCountsByPatternIndex = []
      for (let i = 0; i < numPatterns; i++) {
        // get the pattern descriptor from AvatarDefinitions to determin the palette code
        const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, i)
        const ct: number = AvatarDefinitions.getPaletteCount(pattern)
        paletteCountsByPatternIndex.push(ct)

        // this.console.log(`Layer ${layer.index} pattern ${i} has ${ct} palettes`)
      }
      limits[layer.name] = { n: numPatterns, palettesN: paletteCountsByPatternIndex }
    }
    return limits
  }

  private async mintAndRender(
    hre: HardhatRuntimeEnvironment,
    openAvatar: OpenAvatarGen0Token,
    openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer,
    dna: DNA,
    gasParams: GasParams
  ): Promise<void> {
    await confirmIfPublicDeployment(hre, this.console)
    let tx
    try {
      tx = await openAvatar.mint__withGasParams(dna, gasParams)
    } catch (e) {
      const message = `${e}`
      if (message.includes('already minted')) {
        this.console.log(`\x1b[33m\x1b[1mAlready minted: ${dna.toString()}\x1b[0m`)
        const tokenId = await openAvatar.getTokenIdByDNA(dna)
        this.console.log(`Token Id : ${tokenId}`)
        const owner = await openAvatar.ownerOf(tokenId)
        this.console.log(`Owner    : ${owner}`)
        return
      }
      this.console.error('Minting failed', e)

      // look for `transaction={...}` in the error message
      const transaction = message.match(/transaction=\{.*\}, error/)
      if (transaction !== null) {
        // Parse the transaction object as json
        const jsonStr: string = transaction[0].replace('transaction=', '').replace(', error', '')
        const tx = JSON.parse(jsonStr)
        this.console.log(tx)
      }

      const error = message.match(/error=\{.*\}/)
      if (error !== null) {
        // Parse the error object as json
        const jsonStr: string = error[0].replace('error=', '')
        const err = JSON.parse(jsonStr)
        this.console.error(err)
      }

      const revertReason = message.match(/reason="execution reverted: (.*)", [a-z]{0,20}="/)
      if (revertReason !== null) {
        // log in bold red
        const reasonStr = revertReason[1].replace(/\\x([0-9a-fA-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16))
        })
        this.console.error(`\x1b[31m\x1b[1mMinting failed: ${reasonStr}\x1b[0m`)
      }
      throw e
    }
    if (tx === undefined) {
      throw new Error('Minting failed')
    }
    console.log('    tx:', tx.hash)
    await (tx as any).wait()
    const tokenId = await openAvatar.getTokenIdByDNA(dna)
    this.console.log(`Minted OpenAvatar #${tokenId} with dna: ${dna.toString()}`)

    // render
    if (this.config.logging) {
      this.console.log('Rendering...')
      const renderURI: string = await openAvatarGen0ProfilePictureRenderer.renderURI(dna)
      this.console.log(`Decoding...`)
      const decoded = RenderDecoder.decode(renderURI)
      AvatarConsoleDrawer.draw(decoded.hex)
    }

    await this.logUrl(hre, openAvatar, tokenId)
  }

  private async logUrl(
    hre: HardhatRuntimeEnvironment,
    openAvatar: OpenAvatarGen0Token,
    tokenId: number
  ): Promise<void> {
    // log URL
    if (this.config.logging) {
      const MAINNET = 'mainnet'
      const GOERLI = 'goerli'
      const LOCALHOST = 'localhost'

      const network: string = hre.network.name

      // https://testnets.opensea.io/assets/<chain name>>/<OpenAvatarGen0Token address>/<tokenId>
      const url = `https://${
        network === MAINNET ? '' : network === GOERLI ? 'testnets.' : network === LOCALHOST ? 'localhost.' : ''
      }opensea.io/assets/${
        network === MAINNET ? 'ethereum/' : network === GOERLI ? 'goerli/' : network === LOCALHOST ? 'localhost/' : ''
      }${openAvatar.address}/${tokenId}`
      this.console.log(url)
    }
  }
}
