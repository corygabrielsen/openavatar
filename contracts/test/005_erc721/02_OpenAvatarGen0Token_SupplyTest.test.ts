import { AvatarLayerStack, AvatarPose, DNA } from '@openavatar/types'
import { expect } from 'chai'
import { Signer } from 'ethers'
import hre, { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { fmtCommas } from '../../src/util/StringUtils'
import { TestHelper } from '../TestHelper'
import { mkTestDirs } from '../utils'

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

const TEST_SUPPLY_SOFT_CAP = 8192

describe('OpenAvatarGen0Token', function () {
  let accounts: Signer[]

  let owner: Signer
  let other: Signer

  let ownerAddress: string

  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry

  let openAvatarGen0Token: OpenAvatarGen0Token

  before(async function () {
    mkTestDirs()

    accounts = await ethers.getSigners()
    owner = accounts[0]
    other = accounts[1]

    ownerAddress = await owner.getAddress()
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
    await openAvatarGen0Token.initialize(openAvatarGen0RendererRegistry.address)
  })

  describe('Max mints', function () {
    let supplySoftCap: number = 0
    let supplyHardCap: number = 0

    beforeEach(async function () {
      await openAvatarGen0Token.setMintState(PUBLIC)
      supplySoftCap = await openAvatarGen0Token.supplySoftCap()
      supplyHardCap = await openAvatarGen0Token.supplyHardCap()
    })

    /////////////////////////////////////////////////////////////////////////////
    // Initial state
    /////////////////////////////////////////////////////////////////////////////

    describe('Initial state', function () {
      it('should be initialize with 0 supply soft cap', async function () {
        expect(await openAvatarGen0Token.supplySoftCap()).to.equal(0)
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Changing supply soft cap
    /////////////////////////////////////////////////////////////////////////////

    describe('Soft cap supply monotonically increasing', function () {
      beforeEach(async function () {
        await (await openAvatarGen0Token.increaseSupplySoftCap(TEST_SUPPLY_SOFT_CAP)).wait()
        supplySoftCap = await openAvatarGen0Token.supplySoftCap()
      })

      it('should be able to increase supply soft cap', async function () {
        await openAvatarGen0Token.increaseSupplySoftCap(supplySoftCap + 1)
        expect(await openAvatarGen0Token.supplySoftCap()).to.equal(supplySoftCap + 1)
      })

      it('Should not allow increasing supply soft cap if not owner', async function () {
        await expect(
          openAvatarGen0Token.contract.connect(other).increaseSupplySoftCap(supplySoftCap + 1)
        ).to.be.revertedWith('Ownable: caller is not the owner')
      })

      it('should not be able to increase supply soft cap after burning fuse', async function () {
        await openAvatarGen0Token.increaseSupplySoftCap(supplySoftCap + 1)
        expect(await openAvatarGen0Token.supplySoftCap()).to.equal(supplySoftCap + 1)
      })

      it('should fail to set supply soft cap to less than current supply soft cap', async function () {
        await expect(openAvatarGen0Token.increaseSupplySoftCap(supplySoftCap - 1)).to.be.revertedWith(
          'SupplySoftCapChangeIsNotAnIncrease()'
        )
      })

      it('should fail to set supply soft cap same value', async function () {
        await expect(openAvatarGen0Token.increaseSupplySoftCap(supplySoftCap)).to.be.revertedWith(
          'SupplySoftCapChangeIsNotAnIncrease()'
        )
      })

      it('should fail to set supply soft cap higher than supply hard cap', async function () {
        await expect(openAvatarGen0Token.increaseSupplySoftCap(supplyHardCap + 1)).to.be.revertedWith(
          `SupplySoftCapWouldExceedHardCap(${supplyHardCap + 1})`
        )
      })
    })

    /////////////////////////////////////////////////////////////////////////////
    // Minting
    /////////////////////////////////////////////////////////////////////////////

    describe('Mint supply soft cap', function () {
      beforeEach(async function () {
        await (await openAvatarGen0Token.increaseSupplySoftCap(TEST_SUPPLY_SOFT_CAP)).wait()
        supplySoftCap = await openAvatarGen0Token.supplySoftCap()
        // mint the 0 token to owner
        await (await openAvatarGen0Token.mint(DNA_0)).wait()
      })

      function makeBatch(offset: number, size: number): Buffer[] {
        const buffers: Buffer[] = []
        for (let i = offset; i < offset + size; i++) {
          const buffer: Buffer = Buffer.alloc(32)
          buffer.writeUInt32BE(i)
          buffers.push(buffer)
        }
        return buffers
      }

      async function testCannotMintAnyMore() {
        const mintPrice = await openAvatarGen0Token.getMintPrice()
        const totalSupply = await openAvatarGen0Token.totalSupply()
        // now should fail to mint more
        const nextBatch = makeBatch(totalSupply, 1)
        await expect(
          openAvatarGen0Token.contract.mint(nextBatch[0], {
            value: mintPrice,
          })
        ).to.be.revertedWith('SupplyCapExceeded()')
        await expect(
          openAvatarGen0Token.contract.mintTo(ownerAddress, nextBatch[0], {
            value: mintPrice,
          })
        ).to.be.revertedWith('SupplyCapExceeded()')
        await expect(
          openAvatarGen0Token.contract.mintBatch(nextBatch, {
            value: mintPrice,
          })
        ).to.be.revertedWith('SupplyCapExceeded()')
        await expect(
          openAvatarGen0Token.contract.mintBatchTo(ownerAddress, nextBatch, {
            value: mintPrice,
          })
        ).to.be.revertedWith('SupplyCapExceeded()')
      }

      async function mintUpTo(limit: number) {
        const mintPrice = await openAvatarGen0Token.getMintPrice()

        let totalSupply = await openAvatarGen0Token.totalSupply()
        while (totalSupply < limit) {
          const size = Math.min(20, limit - totalSupply)
          await openAvatarGen0Token.contract.mintBatch(makeBatch(totalSupply, size), {
            value: mintPrice.mul(size),
          })

          totalSupply += size
        }
        expect(await openAvatarGen0Token.totalSupply()).to.equal(totalSupply)

        const remainder = limit - totalSupply
        if (remainder > 0) {
          await openAvatarGen0Token.contract.mintBatch(makeBatch(totalSupply, remainder), {
            value: mintPrice.mul(remainder),
          })

          totalSupply += remainder
        }
        expect(await openAvatarGen0Token.totalSupply()).to.equal(limit)
      }

      async function testMintUpTo(limit: number) {
        await mintUpTo(limit)
        await testCannotMintAnyMore()
        expect(await openAvatarGen0Token.totalSupply()).to.equal(limit)
      }

      it(`Should be able to mint up to soft cap ${fmtCommas(
        TEST_SUPPLY_SOFT_CAP
      )} tokens and no more`, async function () {
        await testMintUpTo(supplySoftCap)
      })

      it(`Should be able to mint up to ${fmtCommas(
        TEST_SUPPLY_SOFT_CAP
      )}, then increase soft cap to equal hard cap, then mint up to hard cap`, async function () {
        await testMintUpTo(supplySoftCap)
        await openAvatarGen0Token.increaseSupplySoftCap(supplyHardCap)
        await testMintUpTo(supplyHardCap)
      })
    })
  })
})
