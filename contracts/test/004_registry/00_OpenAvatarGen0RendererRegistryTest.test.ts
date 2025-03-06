import { AvatarLayerStack, AvatarPose } from '@openavatar/types'
import { expect } from 'chai'
import { Signer } from 'ethers'
import hre, { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { TestHelper } from '../TestHelper'
import { expectEvent, mkTestDirs } from '../utils'

describe('OpenAvatarGen0RendererRegistry', function () {
  let accounts: Signer[]

  let owner: Signer
  let other: Signer

  let ownerAddress: string
  let otherAddress: string

  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry

  before(async function () {
    mkTestDirs()

    accounts = await ethers.getSigners()
    owner = accounts[0]
    other = accounts[1]
    ownerAddress = await owner.getAddress()
    otherAddress = await other.getAddress()
  })

  beforeEach(async function () {
    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    const pose: AvatarPose = AvatarPose.IdleDown0
    await openAvatarGen0Assets.addCanvas({ id: pose.canvasId, width: 32, height: 32 })
    await openAvatarGen0Assets.addLayers(
      pose.canvasId,
      [...AvatarLayerStack.iter()].map((layer) => layer.index)
    )
    await openAvatarGen0Assets.uploadPalette(pose.canvasId, 0, [Buffer.from('00000000', 'hex')])
    openAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0RendererRegistry')
    const contract = await contractFactory.deploy(openAvatarGen0Assets.address)
    await contract.deployed()
    openAvatarGen0RendererRegistry = new OpenAvatarGen0RendererRegistry(hre, contract)
  })

  /////////////////////////////////////////////////////////////////////////////
  // Initialization
  /////////////////////////////////////////////////////////////////////////////

  describe('Initialization', function () {
    it('Should initialize with the correct state', async function () {
      expect(await openAvatarGen0RendererRegistry.getNumRenderers()).to.equal(0)
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(
        '0x0000000000000000000000000000000000000000'
      )
    })
  })

  describe('addRenderer', function () {
    it('Should be able to add a renderer', async function () {
      const key = 'base'
      expect(await openAvatarGen0RendererRegistry.getNumRenderers()).to.equal(0)
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.not.equal(openAvatarGen0Renderer.address)
      const tx = await openAvatarGen0RendererRegistry.addRenderer(key, openAvatarGen0Renderer.address)
      const receipt = await tx.wait()
      expectEvent(receipt, 'RendererAdd')
      expectEvent(receipt, 'DefaultRendererChange')
      expect((await openAvatarGen0RendererRegistry.getNumRenderers()) > 0).to.be.true
      expect(await openAvatarGen0RendererRegistry.getNumRenderers()).to.equal(1)
      expect(await openAvatarGen0RendererRegistry.getRendererByKey(key)).to.equal(openAvatarGen0Renderer.address)

      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(openAvatarGen0Renderer.address)
    })

    it('Should not be able to add a renderer which lacks ERC-165 supportsInterface for IOpenAvatarGen0Renderer', async function () {
      const notAnOpenAvatarGen0RendererAddress = openAvatarGen0Assets.address
      await expect(
        openAvatarGen0RendererRegistry.addRenderer('foo', notAnOpenAvatarGen0RendererAddress)
      ).to.be.revertedWith(`InterfaceUnsupported("${notAnOpenAvatarGen0RendererAddress}", "0xb93e4881")`)
    })
  })
})
