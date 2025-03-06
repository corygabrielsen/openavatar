import { AvatarConsoleDrawer } from '@openavatar/assets'
import { Avatar, AvatarLayerStack, AvatarPose, DNA } from '@openavatar/types'
import { expect } from 'chai'
import { Signer } from 'ethers'
import hre, { ethers } from 'hardhat'
import { GasParams } from '../../src/client/GasParams'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../../src/client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { OpenAvatarGen0ProfilePictureRenderer } from '../../src/client/extensions/OpenAvatarGen0ProfilePictureRenderer'
import { PaletteUploader } from '../../src/upload/PaletteUploader'
import { PatternUploader } from '../../src/upload/PatternUploader'
import { RenderDecoder } from '../../src/util/RenderDecoder'
import { TestHelper } from '../TestHelper'
import { TestImageData } from '../TestImageData'

const WIDTH = 32
const HEIGHT = 32
const POSE = AvatarPose.IdleDown0

const TEST_AVATAR: Avatar = new Avatar({
  body: ['bare_chest', 'human005'],
  eyes: ['square', 'black'],
  bottomwear: ['pants_speckled1', /__marine_blue$/],
  eyewear: ['ar_vr_visor', 'transluscent_cyan'],
  hair: ['dreads', /__marine_blue$/],
})

describe('OpenAvatarGen0ProfilePictureRenderer', function () {
  let accounts: Signer[]

  let owner: Signer
  let signer1: Signer

  let ownerAddress: string
  let addr1: string

  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry
  let openAvatarGen0Token: OpenAvatarGen0Token
  let openAvatarGen0TextRecords: OpenAvatarGen0TextRecords
  let openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer

  before(async function () {
    accounts = await ethers.getSigners()
    owner = accounts[0]
    signer1 = accounts[1]
    ownerAddress = await owner.getAddress()
    addr1 = await signer1.getAddress()
  })

  async function doInit() {
    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    await openAvatarGen0Assets.addCanvas({ id: POSE.canvasId, width: WIDTH, height: HEIGHT })
    await openAvatarGen0Assets.uploadPalette(POSE.canvasId, 0, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
    openAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    openAvatarGen0RendererRegistry = await TestHelper.initOpenAvatarGen0RendererRegistry(ethers, {
      key: 'base',
      openAvatarGen0Renderer,
    })
    openAvatarGen0Token = await TestHelper.initOpenAvatarGen0Token(ethers, openAvatarGen0RendererRegistry)
    openAvatarGen0TextRecords = await TestHelper.initOpenAvatarGen0TextRecords(ethers, openAvatarGen0Token)
  }

  async function doInitWithRenderer() {
    await doInit()
    await openAvatarGen0Assets.addLayers(
      POSE.canvasId,
      [...AvatarLayerStack.iter()].map((layer) => layer.index)
    )
    await new PaletteUploader(hre, openAvatarGen0Assets, {} as GasParams, { logging: false }).uploadAllTestOnly()
    await new PatternUploader(hre, openAvatarGen0Assets, {} as GasParams, { logging: false }).uploadAllTestOnly(POSE)
    openAvatarGen0ProfilePictureRenderer = await TestHelper.initOpenAvatarGen0ProfilePictureRenderer(
      ethers,
      openAvatarGen0Assets,
      openAvatarGen0Renderer,
      openAvatarGen0Token,
      openAvatarGen0TextRecords
    )
  }

  async function doInitWithRendererAndTokenMint() {
    await doInitWithRenderer()
    await (await openAvatarGen0Token.increaseSupplySoftCap(8192)).wait()
    await (await openAvatarGen0Token.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
    await (await openAvatarGen0Token.setMintState(TestHelper.PUBLIC)).wait()
    await (await openAvatarGen0Token.mint(DNA.ZERO)).wait()
    await (await openAvatarGen0Token.mint(TEST_AVATAR.dna)).wait()
  }

  describe('renderURI', function () {
    before(doInitWithRendererAndTokenMint)
    let decoded: { png: Buffer; hex: string }
    it(`Should be able to renderURI`, async function () {
      const renderURI: string = await openAvatarGen0ProfilePictureRenderer.renderURI(TEST_AVATAR.dna)
      TestHelper.testImageURI(renderURI)
      decoded = RenderDecoder.decode(renderURI)
      AvatarConsoleDrawer.draw(decoded.hex)
    })

    it(`Should be able to render different background image color based on token owner settings`, async function () {
      // Setting background color and re-rendering should change the image rendered
      const cyan: `#${string}` = '#00ffff'
      await openAvatarGen0TextRecords.setText2(
        TEST_AVATAR.dna,
        'gen0.renderer.pfp.background-color',
        cyan,
        'gen0.renderer.pfp.mask',
        'below-the-neck'
      )
      const bgSettings = await openAvatarGen0ProfilePictureRenderer.getProfilePictureSettings(TEST_AVATAR.dna)
      expect(bgSettings.overrideBackground).to.equal(true)
      expect(bgSettings.backgroundColor).to.equal(cyan)
      expect(bgSettings.maskBelowTheNeck).to.equal(true)

      const renderURI2: string = await openAvatarGen0ProfilePictureRenderer.renderURI(TEST_AVATAR.dna)
      TestHelper.testImageURI(renderURI2)
      const decodedOverrideBackground = RenderDecoder.decode(renderURI2)
      expect(decoded).to.not.equal(undefined) // sanity check
      expect(decodedOverrideBackground.hex).to.not.equal(undefined) // sanity check
      AvatarConsoleDrawer.draw(decodedOverrideBackground.hex)
      expect(decoded.hex).to.not.equal(decodedOverrideBackground.hex)
      expect(decodedOverrideBackground.png).to.not.equal(undefined) // sanity check
      expect(decoded.png.equals(decodedOverrideBackground.png)).to.equal(false)
    })
  })
})
