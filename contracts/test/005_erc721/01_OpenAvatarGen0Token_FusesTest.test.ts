import { AvatarLayerStack, AvatarPose, DNA } from '@openavatar/types'
import { expect } from 'chai'
import { Signer } from 'ethers'
import hre, { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { TestHelper } from '../TestHelper'
import { expectEvent, expectOneEvent, mkTestDirs } from '../utils'

describe('OpenAvatarGen0Token Fuses', function () {
  let accounts: Signer[]

  let owner: Signer
  let other: Signer

  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry

  let openAvatarGen0Token: OpenAvatarGen0Token

  before(async function () {
    mkTestDirs()

    accounts = await ethers.getSigners()
    owner = accounts[0]
    other = accounts[1]
  })

  async function initOpenAvatarGen0RendererRegistry() {
    const openAvatarGen0RendererRegistryContractFactory = await ethers.getContractFactory(
      'OpenAvatarGen0RendererRegistry'
    )
    const openAvatarGen0RendererRegistryContract = await openAvatarGen0RendererRegistryContractFactory.deploy(
      openAvatarGen0Assets.address
    )
    await openAvatarGen0RendererRegistryContract.deployed()
    return new OpenAvatarGen0RendererRegistry(hre, openAvatarGen0RendererRegistryContract)
  }

  beforeEach(async function () {
    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    const pose: AvatarPose = AvatarPose.IdleDown0
    await openAvatarGen0Assets.addCanvas({ id: pose.canvasId, width: 32, height: 32 })
    await openAvatarGen0Assets.addLayers(
      pose.canvasId,
      [...AvatarLayerStack.iter()].map((layer) => layer.index)
    )
    openAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    // manually do it without the helper to avoid auto-adding the renderer
    openAvatarGen0RendererRegistry = await initOpenAvatarGen0RendererRegistry()

    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0Token')
    const ownerProxyaddress = openAvatarGen0Renderer.address // for testing we use the renderer contract as owner proxy
    const contract = await contractFactory.deploy(ownerProxyaddress)
    await contract.deployed()
    openAvatarGen0Token = new OpenAvatarGen0Token(hre, contract)

    // set up the renderer registry
    openAvatarGen0Token.initialize(openAvatarGen0RendererRegistry.address)
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuse: Can Increase Supply Soft Cap
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuse: Can Increase Supply Soft Cap', function () {
    it('Should not allow incrasing supply soft cap after burning fuse', async function () {
      expect(await openAvatarGen0Token.isFuseBurnedCanIncreaseSupplySoftCap()).to.be.false
      const tx = await openAvatarGen0Token.burnFuseCanIncreaseSupplySoftCap()
      const receipt = await tx.wait()
      expect(await openAvatarGen0Token.isFuseBurnedCanIncreaseSupplySoftCap()).to.be.true
      expectOneEvent(receipt, 'FuseBurnedCanIncreaseSupplySoftCap')
      const supplySoftCap = await openAvatarGen0Token.supplySoftCap()
      await expect(openAvatarGen0Token.increaseSupplySoftCap(supplySoftCap + 1)).to.be.revertedWith(
        'OperationBlockedByBurnedFuse()'
      )
      // should not emit event second time
      const tx2 = await openAvatarGen0Token.burnFuseCanIncreaseSupplySoftCap()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty
    })

    it('Should not allow burning fuse for increasing supply soft cap if not owner', async function () {
      await expect(openAvatarGen0Token.contract.connect(other).burnFuseCanIncreaseSupplySoftCap()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuse: Can Change Mint State
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuse: Can Change Mint State', function () {
    it('Should not allow changing mint state after burning fuse', async function () {
      expect(await openAvatarGen0Token.isFuseBurnedCanChangeMintState()).to.be.false
      const tx = await openAvatarGen0Token.burnFuseCanChangeMintState()
      const receipt = await tx.wait()
      expect(await openAvatarGen0Token.isFuseBurnedCanChangeMintState()).to.be.true
      expectOneEvent(receipt, 'FuseBurnedCanChangeMintState')
      await expect(openAvatarGen0Token.setMintState(TestHelper.PUBLIC)).to.be.revertedWith(
        'OperationBlockedByBurnedFuse()'
      )
      // should not emit event second time
      const tx2 = await openAvatarGen0Token.burnFuseCanChangeMintState()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty
    })

    it('Should not allow burning fuse for changing mint state if not owner', async function () {
      await expect(openAvatarGen0Token.contract.connect(other).burnFuseCanChangeMintState()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuse: Can Change Public Mint Time
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuse: Can Change Public Mint Time', function () {
    beforeEach(async function () {
      const tx = await openAvatarGen0Token.setMintState(TestHelper.PUBLIC_PENDING_BLOCK_TIMESTAMP)
      await tx.wait()

      // get current block timestamp
      const block = await ethers.provider.getBlock('latest')
      // set to 10min in future
      const mintTime = block.timestamp + 600
      const tx2 = await openAvatarGen0Token.setPublicMintTime(mintTime)
      const receipt = await tx2.wait()
      expectOneEvent(receipt, 'PublicMintTimeChange', { time: mintTime })
    })

    it('Should not allow changing changing public mint time after burning fuse', async function () {
      expect(await openAvatarGen0Token.isFuseBurnedCanChangePublicMintTime()).to.be.false
      const tx = await openAvatarGen0Token.burnFuseCanChangePublicMintTime()
      const receipt = await tx.wait()
      expect(await openAvatarGen0Token.isFuseBurnedCanChangePublicMintTime()).to.be.true
      expectOneEvent(receipt, 'FuseBurnedCanChangePublicMintTime')
      await expect(openAvatarGen0Token.setPublicMintTime(0)).to.be.revertedWith('OperationBlockedByBurnedFuse()')
      // should not emit event second time
      const tx2 = await openAvatarGen0Token.burnFuseCanChangePublicMintTime()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty
    })

    it('Should not be able to modify burn fuse for changing public mint time if not owner', async function () {
      await expect(openAvatarGen0Token.contract.connect(other).burnFuseCanChangePublicMintTime()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuse: Can Lower Public Mint Price
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuse: Can Change Lower Mint Price', function () {
    beforeEach(async function () {
      await (await openAvatarGen0Token.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
    })
    it('Should still be able to raise mint price if lower mint price fuse burned for lowering mint price', async function () {
      expect(await openAvatarGen0Token.isFuseBurnedCanLowerMintPrice()).to.be.false
      const tx = await openAvatarGen0Token.burnFuseCanLowerMintPrice()
      await tx.wait()
      expect(await openAvatarGen0Token.isFuseBurnedCanLowerMintPrice()).to.be.true
      await expect(openAvatarGen0Token.contract.setMintPrice((await openAvatarGen0Token.getMintPrice()).add(1))).to.not
        .be.reverted
    })

    it('Should not be able to lower mint price if fuse burned for lowering mint price', async function () {
      expect(await openAvatarGen0Token.isFuseBurnedCanLowerMintPrice()).to.be.false
      const tx = await openAvatarGen0Token.burnFuseCanLowerMintPrice()
      const receipt = await tx.wait()
      expect(await openAvatarGen0Token.isFuseBurnedCanLowerMintPrice()).to.be.true
      expectOneEvent(receipt, 'FuseBurnedCanLowerMintPrice')

      // should not be able to change mint price
      const oldPrice = await openAvatarGen0Token.getMintPrice()
      const newPrice = oldPrice.sub(1)
      await expect(openAvatarGen0Token.contract.setMintPrice(newPrice)).to.be.revertedWith(
        'OperationBlockedByBurnedFuse()'
      )

      // burning again should not emit event
      const tx2 = await openAvatarGen0Token.burnFuseCanLowerMintPrice()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty

      // should still be able to raise mint price
      await expect(openAvatarGen0Token.contract.setMintPrice((await openAvatarGen0Token.getMintPrice()).add(1))).to.not
        .be.reverted
    })

    it('Should not be able to burn fuse for lowering mint price if not owner', async function () {
      await expect(openAvatarGen0Token.contract.connect(other).burnFuseCanLowerMintPrice()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuse: Can Raise Public Mint Price
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuse: Can Change Raise Mint Price', function () {
    beforeEach(async function () {
      await (await openAvatarGen0Token.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
    })
    it('Should still be able to lower mint price if raise mint price fuse burned for raising mint price', async function () {
      expect(await openAvatarGen0Token.isFuseBurnedCanRaiseMintPrice()).to.be.false
      const tx = await openAvatarGen0Token.burnFuseCanRaiseMintPrice()
      await tx.wait()
      await expect(openAvatarGen0Token.contract.setMintPrice((await openAvatarGen0Token.getMintPrice()).sub(1))).to.not
        .be.reverted
      expect(await openAvatarGen0Token.isFuseBurnedCanRaiseMintPrice()).to.be.true
    })

    it('Should not be able to raise mint price if fuse burned for raising mint price', async function () {
      expect(await openAvatarGen0Token.isFuseBurnedCanRaiseMintPrice()).to.be.false
      const tx = await openAvatarGen0Token.burnFuseCanRaiseMintPrice()
      const receipt = await tx.wait()
      expect(await openAvatarGen0Token.isFuseBurnedCanRaiseMintPrice()).to.be.true
      expectOneEvent(receipt, 'FuseBurnedCanRaiseMintPrice')

      // should not be able to change mint price
      const oldPrice = await openAvatarGen0Token.getMintPrice()
      const newPrice = oldPrice.add(1)
      await expect(openAvatarGen0Token.contract.setMintPrice(newPrice)).to.be.revertedWith(
        'OperationBlockedByBurnedFuse()'
      )

      // burning again should not emit event
      const tx2 = await openAvatarGen0Token.burnFuseCanRaiseMintPrice()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty

      // should still be able to lower mint price
      await expect(openAvatarGen0Token.contract.setMintPrice((await openAvatarGen0Token.getMintPrice()).sub(1))).to.not
        .be.reverted
    })

    it('Should not be able to burn fuse for raising mint price if not owner', async function () {
      await expect(openAvatarGen0Token.contract.connect(other).burnFuseCanRaiseMintPrice()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuse: Can Add Renderer
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuse: Can Add Renderer', function () {
    it('Should not be able to add a renderer after burning fuse for adding renderers', async function () {
      const numExistingRenderers = 0
      expect(await openAvatarGen0RendererRegistry.getNumRenderers()).to.equal(numExistingRenderers)
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.not.equal(openAvatarGen0Renderer.address)
      const tx = await openAvatarGen0RendererRegistry.addRenderer('base', openAvatarGen0Renderer.address)
      const receipt = await tx.wait()
      expectEvent(receipt, 'RendererAdd')
      expectEvent(receipt, 'DefaultRendererChange')
      expect((await openAvatarGen0RendererRegistry.getNumRenderers()) > numExistingRenderers).to.be.true
      expect(await openAvatarGen0RendererRegistry.getNumRenderers()).to.equal(numExistingRenderers + 1)
      expect(await openAvatarGen0RendererRegistry.getRendererByDNA(DNA.ZERO)).to.equal(openAvatarGen0Renderer.address)
      expect(await openAvatarGen0RendererRegistry.getDefaultRenderer()).to.equal(openAvatarGen0Renderer.address)

      // burn fuse
      expect(await openAvatarGen0RendererRegistry.isFuseBurnedCanAddRenderer()).to.be.false
      const tx2 = await openAvatarGen0RendererRegistry.burnFuseCanAddRenderer()
      const receipt2 = await tx2.wait()
      expect(await openAvatarGen0RendererRegistry.isFuseBurnedCanAddRenderer()).to.be.true
      expectOneEvent(receipt2, 'FuseBurnedCanAddRenderer')

      // should not emit event if called a second time
      const tx3 = await openAvatarGen0RendererRegistry.burnFuseCanAddRenderer()
      const receipt3 = await tx3.wait()
      expect((receipt3 as unknown as { events: any }).events).to.be.empty

      // now trying to add another Renderer should fail with OperationBlockedByBurnedFuse
      await expect(
        openAvatarGen0RendererRegistry.addRenderer('shouldFail', openAvatarGen0Renderer.address)
      ).to.be.revertedWith('OperationBlockedByBurnedFuse()')
    })

    it('Should not allow burning fuse for adding renderer if not owner', async function () {
      await expect(openAvatarGen0RendererRegistry.contract.connect(other).burnFuseCanAddRenderer()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
