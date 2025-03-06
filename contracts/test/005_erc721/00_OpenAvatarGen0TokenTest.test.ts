import { AvatarLayerStack, AvatarPose, DNA } from '@openavatar/types'
import { expect } from 'chai'
import { BigNumber, Contract, ContractReceipt, Signer, providers } from 'ethers'
import hre, { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { TestHelper } from '../TestHelper'
import { expectEvent, expectOneEvent, mkTestDirs } from '../utils'

const PERMANENTLY_DISABLED = TestHelper.PERMANENTLY_DISABLED
const DISABLED = TestHelper.DISABLED
const ONLY_OWNER = TestHelper.ONLY_OWNER
const PUBLIC_PENDING_BLOCK_TIMESTAMP = TestHelper.PUBLIC_PENDING_BLOCK_TIMESTAMP
const PUBLIC = TestHelper.PUBLIC

const DNA_0: DNA = DNA.ZERO
const DNA_1: DNA = DNA.ZERO.replace({
  body: {
    pattern: 1,
  },
})
const DNA_2: DNA = DNA.ZERO.replace({
  bottomwear: {
    pattern: 1,
  },
})
const DNA_3: DNA = DNA.ZERO.replace({
  topwear: {
    pattern: 1,
  },
})

describe('OpenAvatarGen0Token', function () {
  let accounts: Signer[]

  let owner: Signer
  let other: Signer

  let ownerAddress: string
  let otherAddress: string

  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry

  let wrapper: OpenAvatarGen0Token
  let contract: Contract

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
    openAvatarGen0RendererRegistry = await TestHelper.initOpenAvatarGen0RendererRegistry(ethers, {
      key: 'base',
      openAvatarGen0Renderer,
    })
    const contractFactory = await ethers.getContractFactory('OpenAvatarGen0Token')
    const ownerProxyaddress = openAvatarGen0Renderer.address // for testing we use the renderer contract as owner proxy
    contract = await contractFactory.deploy(ownerProxyaddress)
    await contract.deployed()
    wrapper = new OpenAvatarGen0Token(hre, contract)
    await wrapper.initialize(openAvatarGen0RendererRegistry.address)
  })

  it(`Should be able to deploy using test helper`, async function () {
    const openAvatarGen0Assets_: OpenAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    const openAvatarGen0Renderer_: OpenAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(
      ethers,
      openAvatarGen0Assets_
    )
    const openAvatarGen0RendererRegistry_ = await TestHelper.initOpenAvatarGen0RendererRegistry(ethers, {
      key: 'base',
      openAvatarGen0Renderer: openAvatarGen0Renderer_,
    })
    const openAvatarGen0Token_ = await TestHelper.initOpenAvatarGen0Token(ethers, openAvatarGen0RendererRegistry_)
    expect(await openAvatarGen0Token_.getOpenAvatarGen0RendererRegistry()).to.equal(
      openAvatarGen0RendererRegistry_.address
    )
    // sanity check numRenderers should be >= 1
    expect(await openAvatarGen0RendererRegistry_.getNumRenderers()).to.be.gte(1)
  })

  it('Should have 0 supply after deployment', async function () {
    expect(await wrapper.totalSupply()).to.equal(0)
    expect(await wrapper.balanceOf(ownerAddress)).to.equal(0)
    expect(await wrapper.balanceOf(otherAddress)).to.equal(0)
    expect(await wrapper.isMinted(DNA_0)).to.equal(false)
    expect(await wrapper.isMinted(DNA_1)).to.equal(false)
    expect(await wrapper.isMinted(DNA_2)).to.equal(false)
    expect(await wrapper.isMinted(DNA_3)).to.equal(false)
    await expect(wrapper.getTokenIdByDNA(DNA_0)).to.be.revertedWith('call revert exception')
    await expect(wrapper.getTokenIdsByDNAs([DNA_0])).to.be.revertedWith('call revert exception')
    await expect(wrapper.getDNAByTokenId(0)).to.be.revertedWith('call revert exception')
    await expect(wrapper.getDNAsByTokenIds([0])).to.be.revertedWith('call revert exception')
  })

  /////////////////////////////////////////////////////////////////////////////
  // Helpers
  /////////////////////////////////////////////////////////////////////////////
  async function expectState(state: number) {
    expect(await wrapper.getMintState()).to.equal(state)
    expect(await wrapper.isMintPublic()).to.equal(state === PUBLIC)
    expect(await wrapper.isMintPublicPendingBlockTimestamp()).to.equal(state === PUBLIC_PENDING_BLOCK_TIMESTAMP)
    expect(await wrapper.isMintOnlyOwner()).to.equal(state === ONLY_OWNER)
    expect(await wrapper.isMintDisabled()).to.equal(state === DISABLED || state === PERMANENTLY_DISABLED)
    expect(await wrapper.isMintPermanentlyDisabled()).to.equal(state === PERMANENTLY_DISABLED)
  }

  async function transitionStateAndExpect(state: number, expectEvent: boolean) {
    const tx = await contract.setMintState(state)
    const receipt: ContractReceipt = await tx.wait()
    if (expectEvent) {
      expectOneEvent(receipt, 'MintStateChange', {
        state: state,
      })
    } else {
      expect((receipt as unknown as { events: any }).events).to.be.empty
    }
    await expectState(state)
  }

  async function expectIsMinted(zero: boolean, one: boolean, two: boolean, three: boolean) {
    expect(await wrapper.isMinted(DNA_0)).to.equal(zero)
    expect(await wrapper.isMinted(DNA_1)).to.equal(one)
    expect(await wrapper.isMinted(DNA_2)).to.equal(two)
    expect(await wrapper.isMinted(DNA_3)).to.equal(three)
  }

  async function testOwnerMint(dna: DNA, tokenId: number) {
    if (!(await wrapper.isMintOnlyOwner())) {
      await wrapper.setMintState(ONLY_OWNER)
    }
    const supply = await wrapper.totalSupply()

    const tx = await wrapper.mint(dna)
    const receipt: providers.TransactionReceipt = await tx.wait()
    expect((receipt as unknown as { events: any }).events).to.not.be.empty
    expect((receipt as unknown as { events: any }).events).to.have.lengthOf(2)
    expectEvent(receipt, 'Transfer', {
      from: '0x0000000000000000000000000000000000000000',
      to: ownerAddress,
      tokenId: tokenId.toString(),
    })
    expectEvent(receipt, 'Mint', {
      to: ownerAddress,
      dna: '0x' + dna.buffer.toString('hex'),
      tokenId: tokenId.toString(),
    })

    expect(await wrapper.totalSupply()).to.equal(supply + 1)
    expect(await wrapper.isMinted(dna))
    expect(await wrapper.getTokenIdByDNA(dna)).to.be.equal(tokenId)
    expect(await wrapper.getTokenIdsByDNAs([dna])).to.be.deep.equal([tokenId])
    expect(await wrapper.getDNAByTokenId(tokenId)).to.equal(dna.toString())
    expect(await wrapper.getDNAsByTokenIds([tokenId])).to.be.deep.equal([dna.toString()])
  }

  /////////////////////////////////////////////////////////////////////////////
  // Mint Admin
  /////////////////////////////////////////////////////////////////////////////

  describe('Mint Admin', function () {
    it('Should start in the mint disabled state', async function () {
      await expectState(DISABLED)
      // expect(await wrapper.canMint(ownerAddress, DNA_1)).to.equal(false)
    })

    it('Should not allow minting in disabled state', async function () {
      await expectState(DISABLED)
      await expect(wrapper.mint(DNA_0)).to.be.revertedWith('MintDisabled()')
    })

    it('Should be able to toggle mint disabled/onlyOwner/public', async function () {
      await expectState(DISABLED)

      // disabled event should not fire even if we try to disable it
      await transitionStateAndExpect(DISABLED, false)
      // enable only owner mint
      await transitionStateAndExpect(ONLY_OWNER, true)
      // now set it on even though it's already on
      await transitionStateAndExpect(ONLY_OWNER, false)
      // enable public mint pending timestamp
      await transitionStateAndExpect(PUBLIC_PENDING_BLOCK_TIMESTAMP, true)
      // enable public mint pending timestamp
      await transitionStateAndExpect(PUBLIC_PENDING_BLOCK_TIMESTAMP, false)
      // enable public mint
      await transitionStateAndExpect(PUBLIC, true)
      // now set it on even though it's already on
      await transitionStateAndExpect(PUBLIC, false)
      // turning back off should throw disabled event
      await transitionStateAndExpect(DISABLED, true)
      // but the second time it should not
      await transitionStateAndExpect(DISABLED, false)
      // back to public
      await transitionStateAndExpect(PUBLIC, true)
      // back to only owner
      await transitionStateAndExpect(ONLY_OWNER, true)
      // back to disabled
      await transitionStateAndExpect(DISABLED, true)
    })

    it('Should not allow non-owner to toggle mint active/inactive', async function () {
      await expect(wrapper.contract.connect(other).setMintState(PUBLIC)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should not allow changing mint state after burning fuse', async function () {
      const tx = await wrapper.burnFuseCanChangeMintState()
      const receipt = await tx.wait()
      expectOneEvent(receipt, 'FuseBurnedCanChangeMintState')
      await expect(wrapper.setMintState(PUBLIC)).to.be.revertedWith('OperationBlockedByBurnedFuse()')
      // should not emit event second time
      const tx2 = await wrapper.burnFuseCanChangeMintState()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty
    })

    it('Should not allow burning fuse for changing mint state if not owner', async function () {
      await expect(wrapper.contract.connect(other).burnFuseCanChangeMintState()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should not allow changing state after permanently disabling mint', async function () {
      await transitionStateAndExpect(PERMANENTLY_DISABLED, true)
      await expect(wrapper.setMintState(PUBLIC)).to.be.revertedWith('MintPermanentlyDisabled()')
      await expect(wrapper.setMintState(ONLY_OWNER)).to.be.revertedWith('MintPermanentlyDisabled()')
      await expect(wrapper.setMintState(DISABLED)).to.be.revertedWith('MintPermanentlyDisabled()')
      await transitionStateAndExpect(PERMANENTLY_DISABLED, false)
    })

    it('Should not allow minting in permanently disabled state', async function () {
      await transitionStateAndExpect(PERMANENTLY_DISABLED, true)
      await expect(wrapper.mint(DNA_0)).to.be.revertedWith('MintPermanentlyDisabled()')
    })

    it('Should report disabled when permanently disabled', async function () {
      await transitionStateAndExpect(PERMANENTLY_DISABLED, true)
      // duplicates of the helper function but to be explicit / self documenting
      expect(await wrapper.isMintDisabled()).to.equal(true)
      expect(await wrapper.isMintPermanentlyDisabled()).to.equal(true)
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Owner Mint
  /////////////////////////////////////////////////////////////////////////////

  describe('Owner mints', function () {
    beforeEach(async function () {
      await (await contract.increaseSupplySoftCap(2 ** 14)).wait()
      await (await contract.setMintState(ONLY_OWNER)).wait()
    })

    /////////////////////////////////////////////////////////////////////////////
    // Owner mint to caller address
    /////////////////////////////////////////////////////////////////////////////

    describe('Owner mint to caller address', function () {
      it('Should be able to owner mint NFT #0', async function () {
        await testOwnerMint(DNA_0, 0)
        await expectIsMinted(true, false, false, false)
      })

      it('Should be able to owner mint NFT #0, #1, #2, #3 in sequence', async function () {
        await testOwnerMint(DNA_0, 0)
        await expectIsMinted(true, false, false, false)
        await testOwnerMint(DNA_1, 1)
        await expectIsMinted(true, true, false, false)
        await testOwnerMint(DNA_2, 2)
        await expectIsMinted(true, true, true, false)
        await testOwnerMint(DNA_3, 3)
        await expectIsMinted(true, true, true, true)
      })

      it('Should not be able to owner mint same DNA twice', async function () {
        await testOwnerMint(DNA_0, 0)
        await expectIsMinted(true, false, false, false)
        await expect(wrapper.mint(DNA_0)).to.be.revertedWith(`DNAAlreadyMinted("${DNA_0.toString()}")`)
      })

      it('Should not be able to public mint during only owner mint state', async function () {
        const mintState = await contract.getMintState()
        expect(mintState).to.equal(ONLY_OWNER)
        // but should not be abl to mint from other accounts
        await expect(contract.connect(other).mint(DNA_0.buffer)).to.be.revertedWith('MintNotAuthorized()')
        await expect(contract.connect(other).mint(DNA_1.buffer)).to.be.revertedWith('MintNotAuthorized()')
        await expect(contract.connect(other).mint(DNA_2.buffer)).to.be.revertedWith('MintNotAuthorized()')
        await expect(contract.connect(other).mint(DNA_3.buffer)).to.be.revertedWith('MintNotAuthorized()')
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Owner mint to provided address
    /////////////////////////////////////////////////////////////////////////////

    describe('Owner mint to provided address', function () {
      it('Should be able to owner mint to another address', async function () {
        const supply = await wrapper.totalSupply()

        const tx: providers.TransactionResponse = await wrapper.mintTo(otherAddress, DNA_0)
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(2)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: otherAddress,
          tokenId: '0',
        })
        expectEvent(receipt, 'Mint', {
          to: otherAddress,
          dna: '0x' + DNA_0.buffer.toString('hex'),
          tokenId: '0',
        })

        expect(await wrapper.totalSupply()).to.equal(supply + 1)
        expect(await wrapper.isMinted(DNA_0))
        expect(await wrapper.getTokenIdByDNA(DNA_0)).to.be.equal(0)
        expect(await wrapper.getTokenIdsByDNAs([DNA_0])).to.deep.equal([0])
        expect(await wrapper.getDNAByTokenId(0)).to.equal(DNA_0.toString())
        expect(await wrapper.getDNAsByTokenIds([0])).to.deep.equal([DNA_0.toString()])
        await expectIsMinted(true, false, false, false)
      })

      it('Should not be able to owner mint another address from non-owner', async function () {
        // but should not be abl to mint from other accounts
        await expect(contract.connect(other).mintTo(ownerAddress, DNA_0.buffer)).to.be.revertedWith(
          'MintNotAuthorized()'
        )
        await expect(contract.connect(other).mintTo(ownerAddress, DNA_1.buffer)).to.be.revertedWith(
          'MintNotAuthorized()'
        )
        await expect(contract.connect(other).mintTo(ownerAddress, DNA_2.buffer)).to.be.revertedWith(
          'MintNotAuthorized()'
        )
        await expect(contract.connect(other).mintTo(ownerAddress, DNA_3.buffer)).to.be.revertedWith(
          'MintNotAuthorized()'
        )
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Owner batch mint to caller address
    /////////////////////////////////////////////////////////////////////////////

    describe('Owner batch mint to caller address', function () {
      beforeEach(async function () {
        // mint the 0 token to owner
        await (await wrapper.mint(DNA_0)).wait()
      })

      it('Should be able to owner batch mint a single token', async function () {
        await expectIsMinted(true, false, false, false)
        const originalSupply = await wrapper.totalSupply()
        const dna: DNA = DNA_1

        const tx = await wrapper.mintBatch([dna])
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(2)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: await owner.getAddress(),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna.buffer.toString('hex'),
          tokenId: originalSupply,
        })

        expect(await wrapper.totalSupply()).to.equal(originalSupply + 1)
        // Check first NFT
        expect(await wrapper.isMinted(dna))
        expect(await wrapper.getTokenIdByDNA(dna)).to.be.equal(originalSupply)
        expect(await wrapper.getTokenIdsByDNAs([dna])).to.deep.equal([originalSupply])
        expect(await wrapper.getDNAByTokenId(originalSupply)).to.equal(dna.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply])).to.deep.equal([dna.toString()])
        await expectIsMinted(true, true, false, false)
      })

      it('Should be able to owner batch mint multiple tokens at once', async function () {
        await expectIsMinted(true, false, false, false)

        const originalSupply = await wrapper.totalSupply()
        const dna1: DNA = DNA_1
        const dna2: DNA = DNA_2

        const tx = await wrapper.mintBatch([dna1, dna2])
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(4)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: await owner.getAddress(),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: await owner.getAddress(),
          tokenId: originalSupply + 1,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna1.buffer.toString('hex'),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna2.buffer.toString('hex'),
          tokenId: originalSupply + 1,
        })

        expect(await wrapper.totalSupply()).to.equal(originalSupply + 2)
        await expectIsMinted(true, true, true, false)
        // Check first NFT
        expect(await wrapper.isMinted(dna1))
        expect(await wrapper.getTokenIdByDNA(dna1)).to.be.equal(originalSupply)
        expect(await wrapper.getTokenIdsByDNAs([dna1])).to.deep.equal([originalSupply])
        expect(await wrapper.getDNAByTokenId(originalSupply)).to.equal(dna1.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply])).to.deep.equal([dna1.toString()])
        // Check second NFT
        expect(await wrapper.isMinted(dna2))
        expect(await wrapper.getTokenIdByDNA(dna2)).to.be.equal(originalSupply + 1)
        expect(await wrapper.getTokenIdsByDNAs([dna1, dna2])).to.deep.equal([originalSupply, originalSupply + 1])
        expect(await wrapper.getDNAByTokenId(originalSupply + 1)).to.equal(dna2.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply, originalSupply + 1])).to.deep.equal([
          dna1.toString(),
          dna2.toString(),
        ])
      })

      it('Should not able to owner batch mint the zero DNA', async function () {
        await expect(wrapper.mintBatch([DNA_0])).to.be.revertedWith(
          `NullDNARestrictedFromBatchMint("${DNA_0.toString()}")`
        )
      })

      it('Should not be able to owner batch mint an already minted DNA', async function () {
        // mint DNA 1
        const dna: DNA = DNA_1
        await wrapper.mint(dna)
        expect(await wrapper.isMinted(dna)).to.equal(true)
        await expect(wrapper.mintBatch([dna])).to.be.revertedWith(`DNAAlreadyMinted("${dna.toString()}")`)
      })

      it('Should not able to owner batch mint same input twice', async function () {
        await expectIsMinted(true, false, false, false)

        const supply = await wrapper.totalSupply()
        const tx = await wrapper.mintBatch([DNA_1, DNA_2])
        await tx.wait()
        const afterSupply = await contract.totalSupply()
        expect(afterSupply).to.equal(supply + 2)
        await expectIsMinted(true, true, true, false)
        // second time should fail because already minted
        const revertDNA_1 = `DNAAlreadyMinted("${DNA_1.toString()}")`
        await expect(wrapper.mintBatch([DNA_1])).to.be.revertedWith(revertDNA_1)
        await expect(wrapper.mintBatch([DNA_1, DNA_1])).to.be.revertedWith(revertDNA_1)
        await expect(wrapper.mintBatch([DNA_1, DNA_2])).to.be.revertedWith(revertDNA_1)
        const revertDNA_2 = `DNAAlreadyMinted("${DNA_2.toString()}")`
        await expect(wrapper.mintBatch([DNA_2, DNA_1])).to.be.revertedWith(revertDNA_2)
        await expect(wrapper.mintBatch([DNA_2])).to.be.revertedWith(revertDNA_2)
        await expect(wrapper.mintBatch([DNA_2, DNA_2])).to.be.revertedWith(revertDNA_2)
        await expect(wrapper.mintBatch([DNA_2, DNA_3])).to.be.revertedWith(revertDNA_2)
        // no silly business with reverts/refactoring tests
        const afterSupply2 = await wrapper.totalSupply()
        expect(afterSupply2).to.equal(supply + 2)
        // should be able to mint the DNA 3
        const tx2 = await wrapper.mintBatch([DNA_3])
        await tx2.wait()
        const afterSupply3 = await wrapper.totalSupply()
        expect(afterSupply3).to.equal(supply + 3)
        await expectIsMinted(true, true, true, true)
      })

      // this test is tricky because we use the batch mint ERC721A functionality
      // which means that our "isMinted" check needs to be smart enough to check
      // if the DNA is minted from our own data structures managing the
      // DNA <-> token id relationships
      // which itself is further complicated by the fact that solidity treats
      // missing elements in a uint/bytes32 map as 0
      it('Should not be able to owner batch mint duplicate DNA', async function () {
        const dnas: DNA[] = [DNA_1, DNA_2, DNA_3]
        for (const dna of dnas) {
          await expect(wrapper.mintBatch([dna, dna])).to.be.revertedWith(`DNAAlreadyMinted("${dna.toString()}")`)
        }
      })

      it('Should not be able to owner batch mint from non-owner', async function () {
        await expect(wrapper.contract.connect(other).mintBatch([DNA_1.buffer])).to.be.revertedWith(
          'MintNotAuthorized()'
        )
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Owner batch mint to provided address
    /////////////////////////////////////////////////////////////////////////////

    describe('Owner batch mint to provided address', function () {
      beforeEach(async function () {
        // mint the 0 token to owner
        await wrapper.mint(DNA_0)
      })

      it('Should be able to mint multiple NFTs at once to another address', async function () {
        await expectIsMinted(true, false, false, false)

        const originalSupply = await wrapper.totalSupply()
        const dna1: DNA = DNA_1
        const dna2: DNA = DNA_2

        const tx = await wrapper.mintBatchTo(otherAddress, [dna1, dna2])
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(4)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: otherAddress,
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: otherAddress,
          tokenId: originalSupply + 1,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna1.buffer.toString('hex'),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna2.buffer.toString('hex'),
          tokenId: originalSupply + 1,
        })

        expect(await wrapper.totalSupply()).to.equal(originalSupply + 2)
        await expectIsMinted(true, true, true, false)
        // Check first NFT
        expect(await wrapper.isMinted(dna1))
        expect(await wrapper.getTokenIdByDNA(dna1)).to.be.equal(originalSupply)
        expect(await wrapper.getTokenIdsByDNAs([dna1])).to.deep.equal([originalSupply])
        expect(await wrapper.getDNAByTokenId(originalSupply)).to.equal(dna1.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply])).to.deep.equal([dna1.toString()])
        // Check second NFT
        expect(await wrapper.isMinted(dna2))
        expect(await wrapper.getTokenIdByDNA(dna2)).to.be.equal(originalSupply + 1)
        expect(await wrapper.getTokenIdsByDNAs([dna1, dna2])).to.deep.equal([originalSupply, originalSupply + 1])
        expect(await wrapper.getDNAByTokenId(originalSupply + 1)).to.equal(dna2.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply, originalSupply + 1])).to.deep.equal([
          dna1.toString(),
          dna2.toString(),
        ])

        expect(await wrapper.balanceOf(otherAddress)).to.equal(2)
        // first NFT
        expect(await wrapper.ownerOf(originalSupply)).to.equal(otherAddress)
        expect(await wrapper.ownerOfDNA(dna1)).to.equal(otherAddress)
        expect(await wrapper.creatorOf(originalSupply)).to.equal(otherAddress)
        expect(await wrapper.creatorOfDNA(dna1)).to.equal(otherAddress)
        // second NFT
        expect(await wrapper.ownerOf(originalSupply + 1)).to.equal(otherAddress)
        expect(await wrapper.ownerOfDNA(dna2)).to.equal(otherAddress)
        expect(await wrapper.creatorOf(originalSupply + 1)).to.equal(otherAddress)
        expect(await wrapper.creatorOfDNA(dna2)).to.equal(otherAddress)
        // both
        expect(await wrapper.ownerOfDNAs([dna1, dna2])).to.deep.equal([otherAddress, otherAddress])
      })

      it('Should not be able to owner batch mint to another address from non-owner', async function () {
        await expect(wrapper.contract.connect(other).mintBatchTo(otherAddress, [DNA_1.buffer])).to.be.revertedWith(
          'MintNotAuthorized()'
        )
      })
    })
  })

  describe('Public mints', function () {
    beforeEach(async function () {
      await (await wrapper.increaseSupplySoftCap(2 ** 14)).wait()
      await (await wrapper.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
      await (await wrapper.setMintState(PUBLIC)).wait()
    })

    /////////////////////////////////////////////////////////////////////////////
    // Mint to caller address
    /////////////////////////////////////////////////////////////////////////////

    describe('Mint to caller address', function () {
      async function testMint(signer: Signer, dna: DNA, tokenId: number) {
        const supply = await wrapper.totalSupply()

        const tx = await wrapper.contract.connect(signer).mint(dna.buffer, {
          value: await wrapper.getMintPrice(),
        })
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(2)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: await signer.getAddress(),
          tokenId: tokenId.toString(),
        })
        expectEvent(receipt, 'Mint', {
          to: await signer.getAddress(),
          dna: '0x' + dna.buffer.toString('hex'),
          tokenId: tokenId.toString(),
        })

        let i = 0
        expect(await wrapper.totalSupply()).to.equal(supply + 1)
        expect(await wrapper.isMinted(dna))
        expect(await wrapper.getTokenIdByDNA(dna)).to.be.equal(tokenId)
        expect(await wrapper.getTokenIdsByDNAs([dna])).to.deep.equal([tokenId])
        expect(await wrapper.getDNAByTokenId(tokenId)).to.equal(dna.toString())
        expect(await wrapper.getDNAsByTokenIds([tokenId])).to.deep.equal([dna.toString()])
        // ensure renderer is correct
        const rendererByDNA = await openAvatarGen0RendererRegistry.getRendererByDNA(dna)
        expect(rendererByDNA).to.equal(openAvatarGen0Renderer.address)
      }

      it('Should be able to mint NFT #0 as null DNA', async function () {
        await testMint(owner, DNA_0, 0)
        await expectIsMinted(true, false, false, false)
      })

      it('Should be able to mint NFT #0 as non-null DNA', async function () {
        // basically the same as above, but with a non-null DNA
        // this is included to explicitly assert that there is no cheat check for null DNA
        await testMint(owner, DNA_1, 0)
        await expectIsMinted(false, true, false, false)
      })

      // allowed based on contract to avoid gas tests preventing it
      // can facilitate ownership of token #0 during launch
      it('Should be able to mint NFT #0 from non-owner address', async function () {
        await testMint(other, DNA_0, 0)
        await expectIsMinted(true, false, false, false)
      })

      it('Should be able to mint NFT #0, #1', async function () {
        await testMint(owner, DNA_0, 0)
        await expectIsMinted(true, false, false, false)
        await testMint(other, DNA_1, 1)
        await expectIsMinted(true, true, false, false)
      })

      it('Should be able to mint from same address multiple times', async function () {
        await testMint(owner, DNA_0, 0)
        await expectIsMinted(true, false, false, false)
        await testMint(owner, DNA_1, 1)
        await expectIsMinted(true, true, false, false)
        await testMint(other, DNA_2, 2)
        await expectIsMinted(true, true, true, false)
        await testMint(other, DNA_3, 3)
        await expectIsMinted(true, true, true, true)
      })

      it('Should not be able to mint same DNA twice', async function () {
        await testMint(owner, DNA_0, 0)
        await expectIsMinted(true, false, false, false)
        await expect(
          wrapper.contract.connect(other).mint(DNA_0.buffer, {
            value: await contract.getMintPrice(),
          })
        ).to.be.revertedWith(`DNAAlreadyMinted("${DNA_0.toString()}")`)
      })

      it('Should not be able to mint without paying public mint price', async function () {
        const price: BigNumber = await wrapper.getMintPrice()
        if (!price.gt(0)) {
          expect(true, 'Public mint price must be greater than 0').to.be.false
        }
        await expect(wrapper.contract.mint(DNA_1.buffer, { value: price.sub(1) })).to.be.revertedWith('MintUnderpaid()')
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Mint to provided address
    /////////////////////////////////////////////////////////////////////////////

    describe('Mint to provided address', function () {
      it('Should be able to mint to another address', async function () {
        const supply = await wrapper.totalSupply()

        const tx = await wrapper.contract
          .connect(owner)
          .mintTo(otherAddress, DNA_0.buffer, { value: await contract.getMintPrice() })
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(2)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: otherAddress,
          tokenId: '0',
        })
        expectEvent(receipt, 'Mint', {
          to: otherAddress,
          dna: '0x' + DNA_0.buffer.toString('hex'),
          tokenId: '0',
        })

        expect(await wrapper.totalSupply()).to.equal(supply + 1)
        expect(await wrapper.isMinted(DNA_0))
        expect(await wrapper.getTokenIdByDNA(DNA_0)).to.be.equal(0)
        expect(await wrapper.getTokenIdsByDNAs([DNA_0])).to.deep.equal([0])
        expect(await wrapper.getDNAByTokenId(0)).to.equal(DNA_0.toString())
        expect(await wrapper.getDNAsByTokenIds([0])).to.deep.equal([DNA_0.toString()])
        await expectIsMinted(true, false, false, false)
      })

      it('Should not be able to mint to another address without paying public mint price', async function () {
        const price = await contract.getMintPrice()
        if (!price.gt(0)) {
          expect(true, 'Public mint price must be greater than 0').to.be.false
        }
        await expect(
          contract.connect(other).mintTo(ownerAddress, DNA_1.buffer, { value: price.sub(1) })
        ).to.be.revertedWith('MintUnderpaid()')
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Batch mint to caller address
    /////////////////////////////////////////////////////////////////////////////

    describe('Batch mint to caller address', function () {
      beforeEach(async function () {
        // mint the 0 token to owner
        await (await wrapper.mint(DNA_0)).wait()
      })

      it('Should be able to batch mint a single token', async function () {
        await expectIsMinted(true, false, false, false)
        const originalSupply = await wrapper.totalSupply()
        const dna: DNA = DNA_1

        const tx = await wrapper.mintBatch([dna])
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(2)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: await owner.getAddress(),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna.buffer.toString('hex'),
          tokenId: originalSupply,
        })

        expect(await wrapper.totalSupply()).to.equal(originalSupply + 1)
        // Check first NFT
        expect(await wrapper.isMinted(dna))
        expect(await wrapper.getTokenIdByDNA(dna)).to.be.equal(originalSupply)
        expect(await wrapper.getTokenIdsByDNAs([dna])).to.deep.equal([originalSupply])
        expect(await wrapper.getDNAByTokenId(originalSupply)).to.equal(dna.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply])).to.deep.equal([dna.toString()])
        await expectIsMinted(true, true, false, false)
      })

      it('Should be able to mint multiple tokens at once via batch mint', async function () {
        await expectIsMinted(true, false, false, false)

        const originalSupply = await wrapper.totalSupply()
        const dna1: DNA = DNA_1
        const dna2: DNA = DNA_2

        const input = [dna1.buffer, dna2.buffer]
        const tx = await contract.mintBatch(input, {
          value: (await contract.getMintPrice()).mul(input.length),
        })
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(4)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: await owner.getAddress(),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: await owner.getAddress(),
          tokenId: originalSupply + 1,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna1.buffer.toString('hex'),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna2.buffer.toString('hex'),
          tokenId: originalSupply + 1,
        })

        expect(await wrapper.totalSupply()).to.equal(originalSupply + 2)
        await expectIsMinted(true, true, true, false)
        // Check first NFT
        expect(await wrapper.isMinted(dna1))
        expect(await wrapper.getTokenIdByDNA(dna1)).to.be.equal(originalSupply)
        expect(await wrapper.getTokenIdsByDNAs([dna1])).to.deep.equal([originalSupply])
        expect(await wrapper.getDNAByTokenId(originalSupply)).to.equal(dna1.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply])).to.deep.equal([dna1.toString()])
        // Check second NFT
        expect(await wrapper.isMinted(dna2))
        expect(await wrapper.getTokenIdByDNA(dna2)).to.be.equal(originalSupply + 1)
        expect(await wrapper.getTokenIdsByDNAs([dna1, dna2])).to.deep.equal([originalSupply, originalSupply + 1])
        expect(await wrapper.getDNAByTokenId(originalSupply + 1)).to.equal(dna2.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply, originalSupply + 1])).to.deep.equal([
          dna1.toString(),
          dna2.toString(),
        ])
      })

      it('Should not able to batch mint the zero DNA', async function () {
        await expect(contract.mintBatch([DNA_0.buffer], { value: await contract.getMintPrice() })).to.be.revertedWith(
          `NullDNARestrictedFromBatchMint("${DNA_0.toString()}")`
        )
      })

      it('Should not be able to batch mint an already minted DNA', async function () {
        // mint DNA 1
        const dna: DNA = DNA_1
        await contract.mint(dna.buffer, { value: await contract.getMintPrice() })
        expect(await wrapper.isMinted(dna)).to.equal(true)
        await expect(contract.mintBatch([dna.buffer], { value: await contract.getMintPrice() })).to.be.revertedWith(
          `DNAAlreadyMinted("${dna.toString()}")`
        )
      })

      it('Should not able to batch mint same input twice', async function () {
        await expectIsMinted(true, false, false, false)

        const supply = await wrapper.totalSupply()
        const tx = await wrapper.mintBatch([DNA_1, DNA_2])
        await tx.wait()
        const afterSupply = await wrapper.totalSupply()
        expect(afterSupply).to.equal(supply + 2)
        await expectIsMinted(true, true, true, false)
        // second time should fail because already minted
        const revertDNA_1 = `DNAAlreadyMinted("${DNA_1.toString()}")`
        const revertDNA_2 = `DNAAlreadyMinted("${DNA_2.toString()}")`
        await expect(wrapper.mintBatch([DNA_1])).to.be.revertedWith(revertDNA_1)
        await expect(wrapper.mintBatch([DNA_2])).to.be.revertedWith(revertDNA_2)
        await expect(wrapper.mintBatch([DNA_1, DNA_2])).to.be.revertedWith(revertDNA_1)
        await expect(wrapper.mintBatch([DNA_2, DNA_1])).to.be.revertedWith(revertDNA_2)
        await expect(wrapper.mintBatch([DNA_2, DNA_2])).to.be.revertedWith(revertDNA_2)
        await expect(wrapper.mintBatch([DNA_2, DNA_3])).to.be.revertedWith(revertDNA_2)
        // no silly business with reverts/refactoring tests
        const afterSupply2 = await wrapper.totalSupply()
        expect(afterSupply2).to.equal(supply + 2)
        // should be able to mint the DNA 3
        const tx2 = await wrapper.mintBatch([DNA_3])
        await tx2.wait()
        const afterSupply3 = await wrapper.totalSupply()
        expect(afterSupply3).to.equal(supply + 3)
        await expectIsMinted(true, true, true, true)
      })

      // this test is tricky because we use the batch mint ERC721A functionality
      // which means that our "isMinted" check needs to be smart enough to check
      // if the DNA is minted from our own data structures managing the
      // DNA <-> token id relationships
      // which itself is further complicated by the fact that solidity treats
      // missing elements in a uint/bytes32 map as 0
      it('Should not be able to batch mint duplicate DNA', async function () {
        const dnas: DNA[] = [DNA_1, DNA_2, DNA_3]
        for (const dna of dnas) {
          await expect(wrapper.mintBatch([dna, dna])).to.be.revertedWith(`DNAAlreadyMinted("${dna.toString()}")`)
        }
      })

      it('Should not be able to batch mint without paying public mint price', async function () {
        const price = await wrapper.getMintPrice()
        if (!price.gt(0)) {
          expect(true, 'Public mint price must be greater than 0').to.be.false
        }
        // test underpaying with 1 wei for minting one
        await expect(wrapper.contract.mintBatch([DNA_1.buffer], { value: price.sub(1) })).to.be.revertedWith(
          'MintUnderpaid()'
        )
        // test underpaying with 1 wei for minting two
        const priceForTwo = price.mul(2)
        await expect(
          wrapper.contract.mintBatch([DNA_1.buffer, DNA_2.buffer], { value: priceForTwo.sub(1) })
        ).to.be.revertedWith('MintUnderpaid()')

        // test underpaying with 1 wei for minting three
        const priceForThree = price.mul(3)
        await expect(
          wrapper.contract.mintBatch([DNA_1.buffer, DNA_2.buffer, DNA_3.buffer], { value: priceForThree.sub(1) })
        ).to.be.revertedWith('MintUnderpaid()')
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Batch mint to provided address
    /////////////////////////////////////////////////////////////////////////////

    describe('Batch mint to provided address', function () {
      beforeEach(async function () {
        // mint the 0 token to owner
        await (await wrapper.mint(DNA_0)).wait()
      })

      it('Should be able to mint multiple NFTs at once to another address', async function () {
        await expectIsMinted(true, false, false, false)

        const originalSupply = await wrapper.totalSupply()
        const dna1: DNA = DNA_1
        const dna2: DNA = DNA_2
        const input = [dna1.buffer, dna2.buffer]
        const tx = await wrapper.contract.connect(owner).mintBatchTo(otherAddress, input, {
          value: (await wrapper.getMintPrice()).mul(input.length),
        })
        const receipt = await tx.wait()
        expect((receipt as unknown as { events: any }).events).to.not.be.empty
        expect((receipt as unknown as { events: any }).events).to.have.lengthOf(4)
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: otherAddress,
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Transfer', {
          from: '0x0000000000000000000000000000000000000000',
          to: otherAddress,
          tokenId: originalSupply + 1,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna1.buffer.toString('hex'),
          tokenId: originalSupply,
        })
        expectEvent(receipt, 'Mint', {
          dna: '0x' + dna2.buffer.toString('hex'),
          tokenId: originalSupply + 1,
        })

        expect(await contract.totalSupply()).to.equal(originalSupply + 2)
        await expectIsMinted(true, true, true, false)
        // Check first NFT
        expect(await wrapper.isMinted(dna1))
        expect(await wrapper.getTokenIdByDNA(dna1)).to.be.equal(originalSupply)
        expect(await wrapper.getTokenIdsByDNAs([dna1])).to.deep.equal([originalSupply])
        expect(await wrapper.getDNAByTokenId(originalSupply)).to.equal(dna1.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply])).to.deep.equal([dna1.toString()])
        // Check second NFT
        expect(await wrapper.isMinted(dna2))
        expect(await wrapper.getTokenIdByDNA(dna2)).to.be.equal(originalSupply + 1)
        expect(await wrapper.getTokenIdsByDNAs([dna1, dna2])).to.deep.equal([originalSupply, originalSupply + 1])
        expect(await wrapper.getDNAByTokenId(originalSupply + 1)).to.equal(dna2.toString())
        expect(await wrapper.getDNAsByTokenIds([originalSupply, originalSupply + 1])).to.deep.equal([
          dna1.toString(),
          dna2.toString(),
        ])

        expect(await wrapper.balanceOf(otherAddress)).to.equal(2)
        // first NFT
        expect(await wrapper.ownerOf(originalSupply)).to.equal(otherAddress)
        expect(await wrapper.ownerOfDNA(dna1)).to.equal(otherAddress)
        expect(await wrapper.ownerOfDNAs([dna1])).to.deep.equal([otherAddress])
        expect(await wrapper.creatorOf(originalSupply)).to.equal(otherAddress)
        expect(await wrapper.creatorOfDNA(dna1)).to.equal(otherAddress)
        // second NFT
        expect(await wrapper.ownerOf(originalSupply + 1)).to.equal(otherAddress)
        expect(await wrapper.ownerOfDNA(dna2)).to.equal(otherAddress)
        expect(await wrapper.ownerOfDNAs([dna2])).to.deep.equal([otherAddress])
        expect(await wrapper.creatorOf(originalSupply + 1)).to.equal(otherAddress)
        expect(await wrapper.creatorOfDNA(dna2)).to.equal(otherAddress)
        // both
        expect(await wrapper.ownerOfDNAs([dna1, dna2])).to.deep.equal([otherAddress, otherAddress])
      })
    })

    it('Should not be able to batch mint to another address without paying public mint price', async function () {
      const price = await wrapper.getMintPrice()
      if (!price.gt(0)) {
        expect(true, 'Public mint price must be greater than 0').to.be.false
      }
      // test underpaying with 1 wei for minting one
      await expect(
        contract.connect(owner).mintBatchTo(otherAddress, [DNA_1.buffer], { value: price.sub(1) })
      ).to.be.revertedWith('MintUnderpaid()')

      // test underpaying with 1 wei for minting two
      const input2 = [DNA_1.buffer, DNA_2.buffer]
      await expect(
        contract.connect(owner).mintBatchTo(otherAddress, input2, { value: price.mul(input2.length).sub(1) })
      ).to.be.revertedWith('MintUnderpaid()')

      // test underpaying with 1 wei for minting three
      const input3 = [DNA_1.buffer, DNA_2.buffer, DNA_3.buffer]
      await expect(
        contract.connect(owner).mintBatchTo(otherAddress, input3, { value: price.mul(input3.length).sub(1) })
      ).to.be.revertedWith('MintUnderpaid()')
    })

    describe('Can modify mint price', function () {
      it('Should be able to modify mint price if owner', async function () {
        const oldPrice = await wrapper.getMintPrice()
        // should be able to mint #9 with old price
        await expect(wrapper.contract.mint(DNA_0.buffer, { value: oldPrice })).to.not.be.reverted

        const newPrice = oldPrice.add(1)
        const tx = await wrapper.setMintPrice(newPrice)
        const receipt = await tx.wait()
        expectOneEvent(receipt, 'MintPriceChange', {
          oldPrice: oldPrice,
          newPrice: newPrice,
        })
        expect(await wrapper.getMintPrice()).to.equal(newPrice)

        // now minting should fail for #1, #2 if we use the old price
        await expect(wrapper.contract.mint(DNA_1.buffer, { value: oldPrice })).to.be.revertedWith('MintUnderpaid()')
        await expect(wrapper.contract.mintTo(otherAddress, DNA_2.buffer, { value: oldPrice })).to.be.revertedWith(
          'MintUnderpaid()'
        )
        // but should succeed for #1, #2 if we use the new price
        await wrapper.contract.mint(DNA_1.buffer, { value: newPrice })
        await wrapper.contract.mintTo(otherAddress, DNA_2.buffer, { value: newPrice })
        // supply should be 3 now for 0,1,2
        expect(await wrapper.totalSupply()).to.equal(3)

        // setting the price again should not emit an event
        const tx2 = await wrapper.setMintPrice(newPrice)
        const receipt2 = await tx2.wait()
        expect((receipt2 as unknown as { events: any }).events).to.be.empty
      })

      it('Should not be able to modify mint price if not owner', async function () {
        await expect(wrapper.contract.connect(other).setMintPrice(1)).to.be.revertedWith(
          'Ownable: caller is not the owner'
        )
      })

      it('Should still be able to raise mint price if lower mint price fuse burned', async function () {
        await wrapper.burnFuseCanLowerMintPrice()
        await expect(wrapper.contract.setMintPrice((await wrapper.getMintPrice()).add(1))).to.not.be.reverted
      })

      it('Should not be able to lower mint price if fuse burned', async function () {
        const tx = await wrapper.burnFuseCanLowerMintPrice()
        const receipt = await tx.wait()
        expectOneEvent(receipt, 'FuseBurnedCanLowerMintPrice')

        // should not be able to change mint price
        const oldPrice = await wrapper.getMintPrice()
        const newPrice = oldPrice.sub(1)
        await expect(wrapper.contract.setMintPrice(newPrice)).to.be.revertedWith('OperationBlockedByBurnedFuse()')

        // burning again should not emit event
        const tx2 = await wrapper.burnFuseCanLowerMintPrice()
        const receipt2 = await tx2.wait()
        expect((receipt2 as unknown as { events: any }).events).to.be.empty

        // should still be able to raise mint price
        await expect(wrapper.contract.setMintPrice((await wrapper.getMintPrice()).add(1))).to.not.be.reverted
      })

      it('Should still be able to lower mint price if raise mint price fuse burned', async function () {
        await wrapper.burnFuseCanRaiseMintPrice()
        await expect(wrapper.contract.setMintPrice((await wrapper.getMintPrice()).sub(1))).to.not.be.reverted
      })

      it('Should not be able to raise mint price if fuse burned', async function () {
        const tx = await wrapper.burnFuseCanRaiseMintPrice()
        const receipt = await tx.wait()
        expectOneEvent(receipt, 'FuseBurnedCanRaiseMintPrice')

        // should not be able to change mint price
        const oldPrice = await wrapper.getMintPrice()
        const newPrice = oldPrice.add(1)
        await expect(wrapper.contract.setMintPrice(newPrice)).to.be.revertedWith('OperationBlockedByBurnedFuse()')

        // burning again should not emit event
        const tx2 = await wrapper.burnFuseCanRaiseMintPrice()
        const receipt2 = await tx2.wait()
        expect((receipt2 as unknown as { events: any }).events).to.be.empty

        // should still be able to lower mint price
        await expect(wrapper.contract.setMintPrice((await wrapper.getMintPrice()).sub(1))).to.not.be.reverted
      })
    })
  })

  describe('Public mints, pending block timestamp', function () {
    beforeEach(async function () {
      await (await wrapper.increaseSupplySoftCap(2 ** 14)).wait()
      await (await wrapper.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
      await (await wrapper.setMintState(PUBLIC_PENDING_BLOCK_TIMESTAMP)).wait()

      // get current block timestamp
      const block = await ethers.provider.getBlock('latest')
      // set to 10min in future
      const mintTime = block.timestamp + 600
      const tx2 = await wrapper.setPublicMintTime(mintTime)
      const receipt = await tx2.wait()
      expectOneEvent(receipt, 'PublicMintTimeChange', { time: mintTime })
    })

    it('Should not be able to public mint if time is not reached', async function () {
      await expect(wrapper.mint(DNA_1)).to.be.revertedWith('PublicMintNotStarted()')
    })

    it('Should be able to mint if time is reached', async function () {
      // get current block timestamp
      let block = await ethers.provider.getBlock('latest')
      // set to 10min in past
      const mintTime = block.timestamp - 600
      const tx = await wrapper.setPublicMintTime(mintTime)
      const receipt = await tx.wait()
      expectOneEvent(receipt, 'PublicMintTimeChange', { time: mintTime })

      const mintTx = await wrapper.mint(DNA_1)
      const mintReceipt = await mintTx.wait()

      // mint state should automatically update to public after first mint now
      expectEvent(mintReceipt, 'MintStateChange', { state: PUBLIC })
      const mintState = await wrapper.getMintState()
      expect(mintState).to.equal(PUBLIC)

      // and we should be able to mint again
      await wrapper.mint(DNA_2)

      // and even if the publicMintTime gets changed again, it shouldn't matter since Mint is public now
      block = await ethers.provider.getBlock('latest')
      const changePublicMintTimeTx = await wrapper.setPublicMintTime(block.timestamp + 600)
      await changePublicMintTimeTx.wait()

      // no error
      await wrapper.mint(DNA_3)
    })

    it('Should not allow changing changing public mint time after burning fuse', async function () {
      const tx = await wrapper.burnFuseCanChangePublicMintTime()
      const receipt = await tx.wait()
      expectOneEvent(receipt, 'FuseBurnedCanChangePublicMintTime')
      await expect(wrapper.setPublicMintTime(0)).to.be.revertedWith('OperationBlockedByBurnedFuse()')
      // should not emit event second time
      const tx2 = await wrapper.burnFuseCanChangePublicMintTime()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty
    })

    it('Should not be able to modify burn fuse for changing public mint time if not owner', async function () {
      await expect(wrapper.contract.connect(other).burnFuseCanChangePublicMintTime()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Token URI
  /////////////////////////////////////////////////////////////////////////////

  async function doInitWithMint() {
    // should be at least one renderer
    await (await wrapper.increaseSupplySoftCap(2 ** 14)).wait()
    await (await wrapper.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
    await (await wrapper.setMintState(PUBLIC)).wait()
    await (await wrapper.mint(DNA.ZERO)).wait()
  }

  /////////////////////////////////////////////////////////////////////////////
  // OpenAvatar Metadata
  /////////////////////////////////////////////////////////////////////////////

  describe('OpenAvatarGen0TokenMetadata', function () {
    beforeEach(doInitWithMint)

    it('Should be able to retrieve OpenAvatar metadata by DNA', async function () {
      await wrapper.mintBatch([DNA_1, DNA_2, DNA_3])
      const tokenId = 3
      const dna = DNA_3

      const result: any[] = await wrapper.getOpenAvatarGen0TokenMetadataByDNA(DNA_3)
      expect(result.length).to.be.equal(5)

      // struct OpenAvatarGen0TokenMetadata {
      //   uint generation;
      //   uint tokenId;
      //   bytes32 dna;
      //   address creator;
      //   address renderer;
      // }
      expect(result[0]).to.be.equal(BigNumber.from(0))
      expect(result[1]).to.be.equal(BigNumber.from(tokenId))
      expect(result[2]).to.be.equal(dna.toString())
      expect(result[3]).to.be.equal(ownerAddress)
      expect(result[4]).to.be.equal(openAvatarGen0Renderer.address)
    })

    it('Should be able to retrieve OpenAvatar metadata by token id', async function () {
      await wrapper.mintBatch([DNA_1, DNA_2, DNA_3])
      const tokenId = 3
      const dna = DNA_3

      const result: any[] = await wrapper.getOpenAvatarGen0TokenMetadataByTokenId(tokenId)
      expect(result.length).to.be.equal(5)

      // struct OpenAvatarGen0TokenMetadata {
      //   uint generation;
      //   uint tokenId;
      //   bytes32 dna;
      //   address creator;
      //   address renderer;
      // }
      expect(result[0]).to.be.equal(BigNumber.from(0))
      expect(result[1]).to.be.equal(BigNumber.from(tokenId))
      expect(result[2]).to.be.equal(dna.toString())
      expect(result[3]).to.be.equal(ownerAddress)
      expect(result[4]).to.be.equal(openAvatarGen0Renderer.address)
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // OpenAvatar URI
  /////////////////////////////////////////////////////////////////////////////

  describe('OpenAvatar URI', function () {
    beforeEach(doInitWithMint)

    it('Should be able to retrieve OpenAvatar URI by DNA', async function () {
      const dna = DNA.ZERO
      const openAvatarURI = await wrapper.openAvatarURI(dna)
      const decoded: any = TestHelper.safeParseBase64JSON(openAvatarURI)
      expect(decoded).to.not.be.empty
      expect(decoded.generation).to.equal(0)
      expect(decoded.dna).to.equal(dna.toString())
      expect(decoded.token_id).to.equal(0)
      expect(decoded.creator).to.equal(ownerAddress.toLowerCase())
      expect(decoded.renderer).to.equal(openAvatarGen0Renderer.address.toLowerCase())
      expect(decoded.renderer_abi).to.equal('renderURI(bytes32)')
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Token URI
  /////////////////////////////////////////////////////////////////////////////

  describe('Token URI', function () {
    beforeEach(doInitWithMint)

    it('Should be able to retrieve token URI', async function () {
      const tokenId = 0
      const dna: DNA = DNA.ZERO
      const tokenURI = await wrapper.tokenURI(tokenId)

      // parse JSON
      const decoded = TestHelper.safeParseBase64JSON(tokenURI)

      // console.log(JSON.stringify(decoded, null, 2))
      expect(decoded.generation).to.equal(0)
      expect(decoded.dna).to.equal(dna.toString())
      const rendererAddr = await openAvatarGen0RendererRegistry.getRendererByDNA(dna)
      expect(decoded.creator).to.equal(ownerAddress.toLowerCase())
      expect(decoded.renderer).to.equal(rendererAddr.toLowerCase())
      expect(decoded.renderer_abi).to.equal('renderURI(bytes32)')
      expect(decoded.name).to.equal(`OpenAvatar #${tokenId}`)
      expect(decoded.description).to.equal('OpenAvatar is an onchain protocol for Avatars.')

      // parse image
      expect(decoded.image).to.not.be.empty
      TestHelper.testImageURI(decoded.image)

      // should be a superset of the OpenAvatar URI
      const openAvatarURI = await wrapper.openAvatarURI(dna)
      const openAvatarDecoded: any = TestHelper.safeParseBase64JSON(openAvatarURI)
      for (const key of Object.keys(openAvatarDecoded)) {
        expect(
          decoded[key],
          `tokenURI[${key}] = ${decoded[key]} != openAvatarURI[${key}] = ${openAvatarDecoded[key]}`
        ).to.equal(openAvatarDecoded[key])
      }
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Treasury Admin
  /////////////////////////////////////////////////////////////////////////////

  describe('Treasury Admin', function () {
    beforeEach(async function () {
      // enable mint
      await (await wrapper.increaseSupplySoftCap(2 ** 14)).wait()
      await (await wrapper.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
      await (await contract.setMintState(PUBLIC)).wait()
    })

    it('Should not be able to receive ETH transfers', async function () {
      await expect(owner.sendTransaction({ to: contract.address, value: 1 })).to.be.reverted
    })

    it('Should be able to withdraw treasury to owner address', async function () {
      // get the balance stored in the contract
      const originalAmount = await ethers.provider.getBalance(contract.address)
      // now send some ETH to the contract by calling the mint function and sending ETH
      const publicMintPrice = await contract.getMintPrice()
      if (publicMintPrice.lte(0)) {
        // defensive programming against refactor bugs
        throw new Error('Public mint price must be non-zero for this test')
      }
      const tx1 = await contract.connect(other).mint(DNA.ZERO.buffer, {
        value: publicMintPrice,
      })
      await tx1.wait()
      // check the balance
      const amount = await ethers.provider.getBalance(contract.address)
      expect(amount).to.equal(originalAmount.add(publicMintPrice))
      // withdraw full balance
      const ownerBalance = await ethers.provider.getBalance(ownerAddress)
      const tx = await contract.withdraw(amount)
      const receipt = await tx.wait()
      const gasUsed = receipt.gasUsed.mul(tx.gasPrice)
      expect((receipt as unknown as { events: any }).events).to.not.be.empty
      expect((receipt as unknown as { events: any }).events).to.have.lengthOf(1)
      expectEvent(receipt, 'TreasuryWithdrawal', {
        to: await owner.getAddress(),
        amount: amount.toString(),
      })
      // check the balance of the contract
      const afterAmount = await ethers.provider.getBalance(contract.address)
      expect(afterAmount).to.equal(0)

      const newOwnerBalance = await ethers.provider.getBalance(ownerAddress)
      const expectedOwnerBalance = ownerBalance.sub(gasUsed).add(amount)
      expect(newOwnerBalance).to.equal(expectedOwnerBalance)
    })

    it('Should not allow non-owner to call withdraw', async function () {
      await expect(contract.connect(other).withdraw(0)).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
