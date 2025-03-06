import { AvatarPose } from '@openavatar/types'
import { expect } from 'chai'
import hre from 'hardhat'
import { OpenAvatarGen0Assets } from '../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../src/client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../src/client/OpenAvatarGen0Token'
import { OpenAvatarGen0AssetsPatternStore } from '../src/client/core/assets/OpenAvatarGen0AssetsPatternStore'
import { OpenAvatarGen0AssetsCanvasLayerCompositor } from '../src/client/core/render/OpenAvatarGen0AssetsCanvasLayerCompositor'
import { OpenAvatarGen0ProfilePictureRenderer } from '../src/client/extensions/OpenAvatarGen0ProfilePictureRenderer'
import { OpenAvatarGen0ExampleMutableCanvasRenderer } from '../src/client/extensions/example/OpenAvatarGen0ExampleMutableCanvasRenderer'

export class TestHelper {
  public static PERMANENTLY_DISABLED: number = 0
  public static DISABLED: number = 1
  public static ONLY_OWNER: number = 2
  public static PUBLIC_PENDING_BLOCK_TIMESTAMP: number = 3
  public static PUBLIC: number = 4

  static async initOwnerProxy(ethers: any) {
    const contractFactory = await ethers.getContractFactory('OwnerProxy')
    const contract = await contractFactory.deploy('0x000000000000000000000000000000000000dEaD')
    await contract.deployed()
    return contract
  }

  static async initOpenAvatarGen0AssetsPaletteStore(ethers: any) {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)

    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0AssetsPaletteStore')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    return contract
  }

  static async initOpenAvatarGen0AssetsCanvasStore(ethers: any) {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)

    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0AssetsCanvasStore')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    return contract
  }

  static async initOpenAvatarGen0AssetsPatternStore(ethers: any): Promise<OpenAvatarGen0AssetsPatternStore> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)

    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0AssetsPatternStore')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    return new OpenAvatarGen0AssetsPatternStore(hre, contract)
  }

  static async initOpenAvatarGen0Assets(ethers: any): Promise<OpenAvatarGen0Assets> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)

    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0Assets')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    return new OpenAvatarGen0Assets(hre, contract)
  }

  static async initOpenAvatarGen0AssetsCanvasLayerCompositor(
    ethers: any,
    openAvatarGen0Assets: OpenAvatarGen0Assets
  ): Promise<OpenAvatarGen0AssetsCanvasLayerCompositor> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0AssetsCanvasLayerCompositor')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    const wrapper: OpenAvatarGen0AssetsCanvasLayerCompositor = new OpenAvatarGen0AssetsCanvasLayerCompositor(
      hre,
      contract
    )
    await wrapper.initialize(openAvatarGen0Assets.address)

    return wrapper
  }

  static async initOpenAvatarGen0CanvasRenderer(
    ethers: any,
    openAvatarGen0Assets: OpenAvatarGen0Assets,
    pose: AvatarPose
  ): Promise<OpenAvatarGen0Renderer> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0CanvasRenderer')
    const contract = await contractFactory.deploy(ownerProxy.address, pose.canvasId)
    await contract.deployed()
    const wrapper: OpenAvatarGen0Renderer = new OpenAvatarGen0Renderer(hre, contract)
    await wrapper.initialize(openAvatarGen0Assets.address)

    return wrapper
  }

  static async initOpenAvatarGen0Renderer(
    ethers: any,
    openAvatarGen0Assets: OpenAvatarGen0Assets
  ): Promise<OpenAvatarGen0Renderer> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0Renderer')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    const wrapper: OpenAvatarGen0Renderer = new OpenAvatarGen0Renderer(hre, contract)
    await wrapper.initialize(openAvatarGen0Assets.address)

    return wrapper
  }

  static async initOpenAvatarGen0RendererRegistry(
    ethers: any,
    openAvatarGen0RendererWithKey?: { key: string; openAvatarGen0Renderer: OpenAvatarGen0Renderer }
  ): Promise<OpenAvatarGen0RendererRegistry> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0RendererRegistry')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    const wrapper: OpenAvatarGen0RendererRegistry = new OpenAvatarGen0RendererRegistry(hre, contract)
    if (openAvatarGen0RendererWithKey !== undefined) {
      await wrapper.addRenderer(
        openAvatarGen0RendererWithKey.key,
        openAvatarGen0RendererWithKey.openAvatarGen0Renderer.address
      )
    }

    return wrapper
  }

  static async initOpenAvatarGen0Token(
    ethers: any,
    openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry
  ): Promise<OpenAvatarGen0Token> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0Token')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    await contract.initialize(openAvatarGen0RendererRegistry.address)

    return new OpenAvatarGen0Token(hre, contract)
  }

  static async initOpenAvatarGen0TextRecords(
    ethers: any,
    openAvatarGen0Token: OpenAvatarGen0Token
  ): Promise<OpenAvatarGen0TextRecords> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0TextRecords')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    await contract.initialize(openAvatarGen0Token.address)

    return new OpenAvatarGen0TextRecords(hre, contract)
  }

  static async initOpenAvatarGen0ExampleMutableCanvasRenderer(
    ethers: any,
    openAvatarGen0Assets: OpenAvatarGen0Assets
  ): Promise<OpenAvatarGen0ExampleMutableCanvasRenderer> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0ExampleMutableCanvasRenderer')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    const wrapper: OpenAvatarGen0ExampleMutableCanvasRenderer = new OpenAvatarGen0ExampleMutableCanvasRenderer(
      hre,
      contract
    )
    await wrapper.initialize(openAvatarGen0Assets.address)

    return wrapper
  }

  static async initOpenAvatarGen0ProfilePictureRenderer(
    ethers: any,
    openAvatarGen0Assets: OpenAvatarGen0Assets,
    openAvatarGen0AssetsCanvasLayerCompositor: OpenAvatarGen0AssetsCanvasLayerCompositor,
    openAvatarGen0Token: OpenAvatarGen0Token,
    openAvatarGen0TextRecords: OpenAvatarGen0TextRecords
  ): Promise<OpenAvatarGen0ProfilePictureRenderer> {
    const ownerProxy = await TestHelper.initOwnerProxy(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0ProfilePictureRenderer')
    const contract = await contractFactory.deploy(ownerProxy.address)
    await contract.deployed()
    const wrapper = new OpenAvatarGen0ProfilePictureRenderer(hre, contract)
    await wrapper.initialize(
      openAvatarGen0Assets.address,
      openAvatarGen0AssetsCanvasLayerCompositor.address,
      openAvatarGen0Token.address,
      openAvatarGen0TextRecords.address
    )

    return wrapper
  }

  static safeParseBase64JSON(uri: string): any {
    const jsonURIPrefix: string = 'data:application/json;base64,'
    expect(uri).to.not.be.empty
    expect(uri.startsWith(jsonURIPrefix), 'Invalid JSON prefix: ' + uri.slice(0, 100)).to.be.true
    const jsonObjectStr: string = Buffer.from(uri.slice(jsonURIPrefix.length), 'base64').toString('utf8')
    expect(jsonObjectStr).to.not.be.empty
    let decoded
    try {
      decoded = JSON.parse(jsonObjectStr)
    } catch (e) {
      console.error(jsonObjectStr)
      throw e
    }
    return decoded
  }

  static testImageURI(imageURI: string) {
    expect(imageURI).to.not.be.empty
    const svgUriPrefix = 'data:image/svg+xml;base64,'
    expect(imageURI.startsWith(svgUriPrefix), 'Invalid SVG prefix: ' + imageURI.slice(0, 100)).to.be.true

    // decode base64 svg
    const svg = Buffer.from(imageURI.slice(svgUriPrefix.length), 'base64').toString('utf8')

    const svgRegex = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 (\d+) (\d+)">[\s\S]*<\/svg>$/
    const svgMatch = svgRegex.exec(svg)
    expect(svgMatch, 'Invalid SVG tag').to.not.be.null

    const foreignObjectRegex = /<foreignObject width="(\d+)" height="(\d+)">[\s\S]*<\/foreignObject>/
    const foreignObjectMatch = foreignObjectRegex.exec(svg)
    expect(foreignObjectMatch, 'Invalid foreignObject tag').to.not.be.null
    expect(foreignObjectMatch![1], 'foreignObject width mismatch').to.equal(svgMatch![1])
    expect(foreignObjectMatch![2], 'foreignObject height mismatch').to.equal(svgMatch![2])
    const svgScale = 10
    expect(foreignObjectMatch![1], 'foreignObject width invalid').to.equal(`${svgScale * 32}`)
    expect(foreignObjectMatch![2], 'foreignObject height invalid').to.equal(`${svgScale * 32}`)

    const imgRegex =
      /<img xmlns="http:\/\/www.w3.org\/1999\/xhtml" width="(\d+)" height="(\d+)" style="image-rendering: pixelated;" src="data:image\/png;base64,([^"]+)"\/>/
    const imgMatch = imgRegex.exec(svg)
    expect(imgMatch, 'Invalid img tag').to.not.be.null
    expect(imgMatch![1], 'img width mismatch').to.equal(svgMatch![1])
    expect(imgMatch![2], 'img height mismatch').to.equal(svgMatch![2])
    expect(imgMatch![1], 'img width invalid').to.equal(`${svgScale * 32}`)
    expect(imgMatch![2], 'img height invalid').to.equal(`${svgScale * 32}`)
  }
}
