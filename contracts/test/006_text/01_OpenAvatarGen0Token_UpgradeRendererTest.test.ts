import { AvatarLayerStack, AvatarPose, DNA } from '@openavatar/types'
import { expect } from 'chai'
import { Signer } from 'ethers'
import hre, { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../../src/client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { TestHelper } from '../TestHelper'
import { expectEvent, expectOneEvent, mkTestDirs } from '../utils'

const KEY1 = 'key1'
const KEY2 = 'key2'

describe('OpenAvatarGen0Token Upgradable Renderer', function () {
  let accounts: Signer[]

  let owner: Signer
  let other: Signer

  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0Renderer2: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry
  let openAvatarGen0TextRecords: OpenAvatarGen0TextRecords

  let openAvatarGen0Token: OpenAvatarGen0Token

  before(async function () {
    mkTestDirs()

    accounts = await ethers.getSigners()
    owner = accounts[0]
    other = accounts[1]
  })

  beforeEach(async function () {
    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    const pose: AvatarPose = AvatarPose.IdleDown0
    await openAvatarGen0Assets.addCanvas({ id: pose.canvasId, width: 32, height: 32 })
    await openAvatarGen0Assets.addLayers(
      pose.canvasId,
      [...AvatarLayerStack.iter()].map((layer) => layer.index)
    )
    openAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    openAvatarGen0RendererRegistry = await TestHelper.initOpenAvatarGen0RendererRegistry(ethers)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0Token')
    const ownerProxyaddress = openAvatarGen0Renderer.address // for testing we use the renderer contract as owner proxy
    const contract = await contractFactory.deploy(ownerProxyaddress)
    await contract.deployed()
    openAvatarGen0Token = new OpenAvatarGen0Token(hre, contract)
    await openAvatarGen0Token.initialize(openAvatarGen0RendererRegistry.address)
    openAvatarGen0Renderer2 = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    openAvatarGen0TextRecords = await TestHelper.initOpenAvatarGen0TextRecords(ethers, openAvatarGen0Token)
    await openAvatarGen0RendererRegistry.initialize(openAvatarGen0TextRecords.address)
  })

  /////////////////////////////////////////////////////////////////////////////
  // Renderers
  /////////////////////////////////////////////////////////////////////////////

  async function testAddRenderer(key: string, renderer: OpenAvatarGen0Renderer, expectDefaultChange: boolean) {
    const curDefaultRenderer = await openAvatarGen0RendererRegistry.getDefaultRenderer()
    const curNumRenderers = await openAvatarGen0RendererRegistry.getNumRenderers()

    if (curNumRenderers == 0) {
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(
        '0x0000000000000000000000000000000000000000'
      )
    }
    const tx = await openAvatarGen0RendererRegistry.addRenderer(key, renderer.address)
    const receipt = await tx.wait()
    if (expectDefaultChange) {
      expectEvent(receipt, 'RendererAdd')
      expectEvent(receipt, 'DefaultRendererChange')
    } else {
      expectOneEvent(receipt, 'RendererAdd')
    }
    expect((await openAvatarGen0RendererRegistry.getNumRenderers()) == curNumRenderers + 1).to.be.true
    expect(await openAvatarGen0RendererRegistry.getNumRenderers()).to.equal(curNumRenderers + 1)
    expect(await openAvatarGen0RendererRegistry.getRendererByKey(key)).to.equal(renderer.address)

    // check defaults
    const newDefaultRenderer = await openAvatarGen0RendererRegistry.getDefaultRenderer()
    if (curNumRenderers > 0) {
      expect(newDefaultRenderer).to.equal(curDefaultRenderer)
    } else {
      expect(newDefaultRenderer).to.equal(renderer.address)
    }

    // should be the default renderer
    expect(await openAvatarGen0RendererRegistry.getRendererByDNA(DNA.ZERO)).to.equal(newDefaultRenderer)
  }

  describe('Renderers', function () {
    it('Should be able to add a renderer', async function () {
      await testAddRenderer(KEY1, openAvatarGen0Renderer, true)
    })

    it('Should be able to add multiple renderers', async function () {
      await testAddRenderer(KEY1, openAvatarGen0Renderer, true)
      await testAddRenderer(KEY2, openAvatarGen0Renderer2, false)
    })

    it('Should not be able to add a renderer address twice under different key', async function () {
      await testAddRenderer(KEY1, openAvatarGen0Renderer, true)
      await expect(openAvatarGen0RendererRegistry.addRenderer(KEY2, openAvatarGen0Renderer.address)).to.be.revertedWith(
        `RendererAlreadyExists("${openAvatarGen0Renderer.address}")`
      )
    })

    it('Should be able to add multiple renderers and update default renderer', async function () {
      await testAddRenderer(KEY1, openAvatarGen0Renderer, true)
      await testAddRenderer(KEY2, openAvatarGen0Renderer2, false)

      await (await openAvatarGen0Token.increaseSupplySoftCap(8192)).wait()
      await (await openAvatarGen0Token.setMintState(TestHelper.ONLY_OWNER)).wait()
      await (await openAvatarGen0Token.mint(DNA.ZERO)).wait()

      // check preliminary
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(openAvatarGen0Renderer.address)
      expect(await openAvatarGen0RendererRegistry.getRendererByDNA(DNA.ZERO)).to.equal(openAvatarGen0Renderer.address)
      const openAvatarURI = await openAvatarGen0Token.openAvatarURI(DNA.ZERO)
      const openAvatarDecoded: any = TestHelper.safeParseBase64JSON(openAvatarURI)
      expect(openAvatarDecoded.renderer).to.equal(openAvatarGen0Renderer.address.toLowerCase())

      // now update the default renderer
      await openAvatarGen0RendererRegistry.setDefaultRendererByKey(KEY2)

      // should be the new default renderer
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(openAvatarGen0Renderer2.address)
      expect(await openAvatarGen0RendererRegistry.getRendererByDNA(DNA.ZERO)).to.equal(openAvatarGen0Renderer2.address)
      const openAvatarURI2 = await openAvatarGen0Token.openAvatarURI(DNA.ZERO)
      const openAvatarDecoded2: any = TestHelper.safeParseBase64JSON(openAvatarURI2)
      expect(openAvatarDecoded2.renderer).to.equal(openAvatarGen0Renderer2.address.toLowerCase())
    })

    it('Should be able to override the default renderer as token owner', async function () {
      await testAddRenderer(KEY1, openAvatarGen0Renderer, true)
      await testAddRenderer(KEY2, openAvatarGen0Renderer2, false)

      await (await openAvatarGen0Token.increaseSupplySoftCap(8192)).wait()
      await (await openAvatarGen0Token.setMintState(TestHelper.ONLY_OWNER)).wait()
      await (await openAvatarGen0Token.mint(DNA.ZERO)).wait()

      // check preliminary
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(openAvatarGen0Renderer.address)
      expect(await openAvatarGen0RendererRegistry.getRendererByDNA(DNA.ZERO)).to.equal(openAvatarGen0Renderer.address)
      const openAvatarURI = await openAvatarGen0Token.openAvatarURI(DNA.ZERO)
      const openAvatarDecoded: any = TestHelper.safeParseBase64JSON(openAvatarURI)
      expect(openAvatarDecoded.renderer).to.equal(openAvatarGen0Renderer.address.toLowerCase())

      // now update the default renderer
      await openAvatarGen0RendererRegistry.setDefaultRendererByKey(KEY2)

      // should be the new default renderer
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(openAvatarGen0Renderer2.address)
      expect(await openAvatarGen0RendererRegistry.getRendererByDNA(DNA.ZERO)).to.equal(openAvatarGen0Renderer2.address)
      const openAvatarURI2 = await openAvatarGen0Token.openAvatarURI(DNA.ZERO)
      const openAvatarDecoded2: any = TestHelper.safeParseBase64JSON(openAvatarURI2)
      expect(openAvatarDecoded2.renderer).to.equal(openAvatarGen0Renderer2.address.toLowerCase())

      // now override the token back to the original renderer
      await openAvatarGen0TextRecords.setText(DNA.ZERO, 'gen0.renderer', KEY1)
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(openAvatarGen0Renderer2.address)
      expect(await openAvatarGen0RendererRegistry.getRendererByDNA(DNA.ZERO)).to.equal(openAvatarGen0Renderer.address)
      const openAvatarURI3 = await openAvatarGen0Token.openAvatarURI(DNA.ZERO)
      const openAvatarDecoded3: any = TestHelper.safeParseBase64JSON(openAvatarURI3)
      expect(openAvatarDecoded3.renderer).to.equal(openAvatarGen0Renderer.address.toLowerCase())
    })

    it('Should not to set default renderer to non-existent renderer key', async function () {
      const missingKey = 'missing'
      await expect(openAvatarGen0RendererRegistry.setDefaultRendererByKey(missingKey)).to.be.revertedWith(
        `RendererDoesNotExist("${missingKey}")`
      )
    })

    it('Should not be able to add a renderer which lacks ERC-165 supportsInterface for IOpenAvatarGen0Renderer', async function () {
      const notAnOpenAvatarGen0RendererAddress = openAvatarGen0Assets.address
      await expect(
        openAvatarGen0RendererRegistry.addRenderer('erc-165 fail', notAnOpenAvatarGen0RendererAddress)
      ).to.be.revertedWith(`InterfaceUnsupported("${notAnOpenAvatarGen0RendererAddress}", "0xb93e4881")`)
    })
  })
})
