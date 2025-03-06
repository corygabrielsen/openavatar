import { AvatarConsoleDrawer, ColorCode } from '@openavatar/assets'
import { Avatar, AvatarLayerStack, AvatarPose, DNA, PatternPaletteDescriptor } from '@openavatar/types'
import { providers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployable } from '../abi/Deployable'
import { DeploymentConfig } from '../abi/DeploymentConfig'
import { chooseDeploymentConfiguration } from '../abi/DeploymentConfigChooser'
import { OpenAvatarGen0Assets } from '../client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../client/OpenAvatarGen0Token'
import { OpenAvatarGen0AssetsCanvasStore } from '../client/core/assets/OpenAvatarGen0AssetsCanvasStore'
import { OptionalPatternHeader } from '../client/core/assets/OpenAvatarGen0AssetsPatternStore'
import { OpenAvatarGen0ProfilePictureRenderer } from '../client/extensions/OpenAvatarGen0ProfilePictureRenderer'
import { Contracts } from '../deploy/Deployer'
import { RenderDecoder } from '../util/RenderDecoder'
import { BaseRunner } from './BaseRunner'

function pad(str: string, length: number): string {
  while (str.length < length) {
    str += ' '
  }
  return str
}

const PADW = 28

async function draw(tokenId: number, renderUri: string): Promise<void> {
  const decoded: { png: Buffer; hex: `0x${string}` } = RenderDecoder.decode(renderUri)

  // save svg string to file for debugging
  // fs.writeFileSync(`./artifacts/${tokenId}.png`, decoded.png)

  AvatarConsoleDrawer.draw(decoded.hex)
}

export class DebugRunner extends BaseRunner {
  public async run(taskArgs: any, hre: HardhatRuntimeEnvironment) {
    await this.waitForNetwork(hre)
    this.logNetwork(hre)

    // deploy the contracts
    const deploymentConfig: DeploymentConfig = await chooseDeploymentConfiguration(taskArgs.deploytype, hre.network)
    const contracts: Contracts = await Contracts.make(
      hre,
      deploymentConfig,
      { create2: taskArgs.create2 },
      { logging: this.config.logging }
    )

    // OpenAvatarGen0Assets
    const openAvatarGen0Assets: OpenAvatarGen0Assets = contracts[Deployable.OpenAvatarGen0Assets]
    this.console.log(`${pad(`${Deployable.OpenAvatarGen0Assets}:`, PADW)}${openAvatarGen0Assets.address}`)
    this.console.log(`${pad('    owner():', PADW)}${await openAvatarGen0Assets.owner()}\n`)

    // OpenAvatarGen0Renderer
    const openAvatarGen0Renderer: OpenAvatarGen0Renderer = contracts[Deployable.OpenAvatarGen0Renderer]
    this.console.log(`${pad(`${Deployable.OpenAvatarGen0Renderer}:`, PADW)}${openAvatarGen0Renderer.address}`)
    this.console.log(`${pad('    owner():', PADW)}${await openAvatarGen0Renderer.owner()}\n`)

    // OpenAvatarGen0RendererRegistry
    const openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry =
      contracts[Deployable.OpenAvatarGen0RendererRegistry]
    this.console.log(
      `${pad(`${Deployable.OpenAvatarGen0RendererRegistry}:`, PADW)}${openAvatarGen0RendererRegistry.address}`
    )
    this.console.log(`${pad('    owner():', PADW)}${await openAvatarGen0RendererRegistry.owner()}\n`)

    // OpenAvatarGen0Token
    const openAvatarGen0Token: OpenAvatarGen0Token = contracts[Deployable.OpenAvatarGen0Token]
    this.console.log(`${pad(`${Deployable.OpenAvatarGen0Token}:`, PADW)}${openAvatarGen0Token.address}`)
    this.console.log(`${pad('    owner():', PADW)}${await openAvatarGen0Token.owner()}\n`)

    // OpenAvatarGen0TextRecords
    const openAvatarGen0TextRecords: OpenAvatarGen0TextRecords = contracts[Deployable.OpenAvatarGen0TextRecords]
    this.console.log(`${pad(`${Deployable.OpenAvatarGen0TextRecords}:`, PADW)}${openAvatarGen0TextRecords.address}`)
    this.console.log(`${pad('    owner():', PADW)}${await openAvatarGen0TextRecords.owner()}\n`)

    // OpenAvatarGen0ProfilePictureRenderer
    const openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer =
      contracts[Deployable.OpenAvatarGen0ProfilePictureRenderer]
    this.console.log(
      `${pad(`${Deployable.OpenAvatarGen0ProfilePictureRenderer}:`, PADW)}${
        openAvatarGen0ProfilePictureRenderer.address
      }`
    )
    this.console.log(`${pad('    owner():', PADW)}${await openAvatarGen0ProfilePictureRenderer.owner()}\n`)

    // OpenAvatarGen0ExampleMutableCanvasRenderer
    const openAvatarGen0ExampleMutableCanvasRenderer: OpenAvatarGen0Renderer =
      contracts[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]
    this.console.log(
      `${pad(`${Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer}:`, PADW)}${
        openAvatarGen0ExampleMutableCanvasRenderer.address
      }`
    )
    this.console.log(`${pad('    owner():', PADW)}${await openAvatarGen0ExampleMutableCanvasRenderer.owner()}\n`)

    // set the canvas id for second renderer if not already set?
    let foundCanvasId = parseInt(await openAvatarGen0ExampleMutableCanvasRenderer.contract.getCanvasId())
    const secondPose = AvatarPose.IdleLeft0
    if (foundCanvasId !== secondPose.canvasId) {
      // see that second pose is uploaded to store
      const canvasIds: number[] = await new OpenAvatarGen0AssetsCanvasStore(
        hre,
        openAvatarGen0Assets.contract
      ).getCanvasIds()
      if (!canvasIds.includes(secondPose.canvasId)) {
        this.console.error('Found canvasIds: ' + canvasIds.join(', '))
        throw new Error(`Canvas ID ${secondPose.canvasId} not found in store`)
      } else {
        this.console.error('Found canvasIds: ' + canvasIds.join(', '))
      }

      this.console.log(
        `Setting ${openAvatarGen0ExampleMutableCanvasRenderer.contract.address} canvasId to ${secondPose.canvasId}`
      )
      const tx: providers.TransactionResponse = await openAvatarGen0ExampleMutableCanvasRenderer.contract.setCanvasId(
        secondPose.canvasId
      )
      await tx.wait()

      // ensure the canvas id was set to the correct value
      foundCanvasId = parseInt(await openAvatarGen0ExampleMutableCanvasRenderer.contract.getCanvasId())
      if (foundCanvasId !== secondPose.canvasId) {
        this.console.error(
          `${openAvatarGen0ExampleMutableCanvasRenderer.contract.address} canvasId is ${foundCanvasId}`
        )
        throw new Error(`Failed to set canvasId to ${secondPose.canvasId}`)
      }
    } else {
      this.console.log(
        `${openAvatarGen0ExampleMutableCanvasRenderer.contract.address} canvasId is already ${secondPose.canvasId}`
      )
    }

    // total supply
    const totalSupply: number = await openAvatarGen0Token.totalSupply()
    this.console.log(`${pad('    totalSupply():', PADW)}${totalSupply}`)

    // log each token
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      const dnaHex: string = await openAvatarGen0Token.getDNAByTokenId(tokenId)
      this.console.log(`${pad(`    getDNA(${tokenId}):`, PADW)}${dnaHex}`)

      const dna: DNA = new DNA(dnaHex)
      const avatar: Avatar = new Avatar(dna)

      for (const layer of AvatarLayerStack.iter()) {
        const patternPalette: PatternPaletteDescriptor = avatar.get(layer)
        this.console.log(
          `${pad(`    ${layer.name}:`, PADW)}${patternPalette.pattern.name}__${patternPalette.palette.name} (${
            dna.get(layer).pattern
          }, ${dna.get(layer).palette})`
        )
        const canvasId: number = 0
        const optionalPatternHeader: OptionalPatternHeader = await openAvatarGen0Assets.getPatternHeader(
          canvasId,
          layer.index,
          dna.get(layer).pattern
        )
        this.console.log(`${pad(`    pattern:`, PADW)}`)
        this.console.log(`${pad(`      width:`, PADW)}${optionalPatternHeader.header.width}`)
        this.console.log(`${pad(`      height:`, PADW)}${optionalPatternHeader.header.height}`)
        this.console.log(`${pad(`      offsetX:`, PADW)}${optionalPatternHeader.header.offsetX}`)
        this.console.log(`${pad(`      offsetY:`, PADW)}${optionalPatternHeader.header.offsetY}`)
        this.console.log(`${pad(`      paletteCode:`, PADW)}${optionalPatternHeader.header.paletteCode}`)
        const patternData: Uint8Array = await openAvatarGen0Assets.getPatternData(
          canvasId,
          layer.index,
          dna.get(layer).pattern
        )
        this.console.log(`${pad(`    patternData:`, PADW)}${patternData.length}`)

        this.console.log(`${pad(`    palette:`, PADW)}`)
        const paletteData: ColorCode[] = (
          await openAvatarGen0Assets.getPalette(optionalPatternHeader.header.paletteCode, dna.get(layer).palette)
        ).map((color: Buffer) => {
          return `#${color.toString('hex').slice(2)}` as ColorCode
        })
        for (let i = 0; i < paletteData.length; i++) {
          this.console.log(`${pad(`      palette[${i}]:`, PADW)}${paletteData[i]}`)
        }
      }

      // draw the avatar rendered to console
      this.console.log(`OpenAvatarGen0Renderer::renderURI(${dna.toString()}):`)
      draw(tokenId, await openAvatarGen0Renderer.renderURI(dna))
      // sleep for for log buffer to clear
      await new Promise((resolve) => setTimeout(resolve, 1000))

      this.console.log('OpenAvatarGen0TextRecords:')
      this.console.log(
        `gen0.renderer.pfp.background-color: "${await openAvatarGen0TextRecords.text(
          dna,
          'gen0.renderer.pfp.background-color'
        )}"`
      )
      this.console.log(
        `gen0.renderer.pfp.mask:             "${await openAvatarGen0TextRecords.text(dna, 'gen0.renderer.pfp.mask')}"`
      )
      this.console.log(`gen0.renderer:             "${await openAvatarGen0TextRecords.text(dna, 'gen0.renderer')}"`)

      // draw the avatar rendered to console
      this.console.log(`OpenAvatarGen0ProfilePictureRenderer::renderURI(${dna.toString()}):`)
      draw(tokenId, await openAvatarGen0ProfilePictureRenderer.renderURI(dna))
      // sleep for for log buffer to clear
      await new Promise((resolve) => setTimeout(resolve, 1000))

      this.console.log(`OpenAvatarGen0ExampleMutableCanvasRenderer::renderURI(${dna.toString()}):`)
      const canvasId2: number = await openAvatarGen0ExampleMutableCanvasRenderer.getCanvasId()
      this.console.log(`${pad(`    canvasId:`, PADW)}${canvasId2}`)
      const svgUri2: string = await openAvatarGen0ExampleMutableCanvasRenderer.renderURI(dna)
      draw(tokenId, svgUri2)
      // sleep for for log buffer to clear
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // tokenURI
      this.console.log(`OpenAvatarGen0Token::tokenURI(${tokenId}):`)
      const tokenURI: string = await openAvatarGen0Token.tokenURI(tokenId)
      // extract render and draw
      const decodedTokenURI: string = tokenURI.slice('data:application/json;base64,'.length)
      const decodedTokenURIJson: string = Buffer.from(decodedTokenURI, 'base64').toString('utf8')
      const decodedTokenURIObject: any = JSON.parse(decodedTokenURIJson)
      const decodedTokenURIObjectImage: string = decodedTokenURIObject.image
      draw(tokenId, decodedTokenURIObjectImage)
      // sleep for for log buffer to clear
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
