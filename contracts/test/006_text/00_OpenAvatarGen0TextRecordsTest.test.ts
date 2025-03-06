import { DNA } from '@openavatar/types'
import { expect } from 'chai'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../../src/client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { TestHelper } from '../TestHelper'
import { mkTestDirs } from '../utils'

const DNA_0: DNA = DNA.ZERO
const DNA_1: DNA = DNA.ZERO.replace({
  body: {
    pattern: 1,
  },
})
describe('OpenAvatarGen0TextRecords', function () {
  let accounts: Signer[]

  let owner: Signer
  let other: Signer

  let ownerAddress: string
  let otherAddress: string

  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry
  let openAvatarGen0Token: OpenAvatarGen0Token
  let openAvatarGen0TextRecords: OpenAvatarGen0TextRecords

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
    openAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    openAvatarGen0RendererRegistry = await TestHelper.initOpenAvatarGen0RendererRegistry(ethers, {
      key: 'base',
      openAvatarGen0Renderer,
    })
    openAvatarGen0Token = await TestHelper.initOpenAvatarGen0Token(ethers, openAvatarGen0RendererRegistry)
    openAvatarGen0TextRecords = await TestHelper.initOpenAvatarGen0TextRecords(ethers, openAvatarGen0Token)
    await openAvatarGen0RendererRegistry.initialize(openAvatarGen0TextRecords.address)
  })

  describe('text', function () {
    beforeEach(async function () {
      await (await openAvatarGen0Token.increaseSupplySoftCap(8192)).wait()
      await (await openAvatarGen0Token.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
      await (await openAvatarGen0Token.setMintState(TestHelper.PUBLIC)).wait()
      await (await openAvatarGen0Token.mint(DNA_0)).wait()
      await (await openAvatarGen0Token.mint(DNA_1)).wait()
    })

    it('Should return empty string for non-existent key', async function () {
      expect(await openAvatarGen0TextRecords.text(DNA_0, 'foo')).to.equal('')
    })

    describe('setText', function () {
      describe('Permissions', function () {
        it('Should not be able to set text if not owner of DNA', async function () {
          const dna = DNA_0
          const key = 'foo'
          const value = 'bar'
          await expect(
            openAvatarGen0TextRecords.contract.connect(other).setText(dna.buffer, key, value)
          ).to.be.revertedWith('NotTokenOwner()')
        })
        it('Should be able to set text if owner of DNA', async function () {
          const dna = DNA_0
          const key = 'foo'
          const value = 'bar'
          await openAvatarGen0TextRecords.contract.connect(owner).setText(dna.buffer, key, value)
          expect(await openAvatarGen0TextRecords.text(dna, key)).to.equal(value)
        })
      })

      it('Should be able to set and retrieve a text record', async function () {
        const dna = DNA_0
        const key = 'foo'
        const value = 'bar'
        await openAvatarGen0TextRecords.setText(dna, key, value)
        const text = await openAvatarGen0TextRecords.text(dna, key)
        expect(text).to.equal(value)
      })

      it('Should be able to set and retrieve multiple different text records across multiple calls', async function () {
        const dna = DNA_0
        const key1 = 'foo'
        const value1 = 'bar'
        const key2 = 'baz'
        const value2 = 'qux'
        await openAvatarGen0TextRecords.setText(dna, key1, value1)
        await openAvatarGen0TextRecords.setText(dna, key2, value2)
        const text1 = await openAvatarGen0TextRecords.text(dna, key1)
        expect(text1).to.equal(value1)
        const text2 = await openAvatarGen0TextRecords.text(dna, key2)
        expect(text2).to.equal(value2)
      })

      it('Should return previously set text for multiple DNAs', async function () {
        const dna1 = DNA_0
        const dna2 = DNA_1
        const key = 'foo'
        const value1 = 'bar'
        const value2 = 'baz'
        await openAvatarGen0TextRecords.setText(dna1, key, value1)
        await openAvatarGen0TextRecords.setText(dna2, key, value2)
        const text1 = await openAvatarGen0TextRecords.text(dna1, key)
        expect(text1).to.equal(value1)
        const text2 = await openAvatarGen0TextRecords.text(dna2, key)
        expect(text2).to.equal(value2)
      })
    })

    describe('setText2', function () {
      it('Should be able to set 2 different key/values at once with setText2', async function () {
        const dna = DNA_0
        const key1 = 'foo1'
        const value1 = 'bar1'
        const key2 = 'foo2'
        const value2 = 'bar2'
        await openAvatarGen0TextRecords.setText2(dna, key1, value1, key2, value2)
        expect(await openAvatarGen0TextRecords.text(dna, key1)).to.equal(value1)
        expect(await openAvatarGen0TextRecords.text(dna, key2)).to.equal(value2)
      })
    })

    describe('setText3', function () {
      it('Should be able to set 3 different key/values at once with setText3', async function () {
        const dna = DNA_0
        const key1 = 'foo1'
        const value1 = 'bar1'
        const key2 = 'foo2'
        const value2 = 'bar2'
        const key3 = 'foo3'
        const value3 = 'bar3'
        await openAvatarGen0TextRecords.setText3(dna, key1, value1, key2, value2, key3, value3)
        expect(await openAvatarGen0TextRecords.text(dna, key1)).to.equal(value1)
        expect(await openAvatarGen0TextRecords.text(dna, key2)).to.equal(value2)
        expect(await openAvatarGen0TextRecords.text(dna, key3)).to.equal(value3)
      })
    })

    describe('setText4', function () {
      it('Should be able to set 4 different key/values at once with setText4', async function () {
        const dna = DNA_0
        const key1 = 'foo1'
        const value1 = 'bar1'
        const key2 = 'foo2'
        const value2 = 'bar2'
        const key3 = 'foo3'
        const value3 = 'bar3'
        const key4 = 'foo4'
        const value4 = 'bar4'
        await openAvatarGen0TextRecords.setText4(dna, key1, value1, key2, value2, key3, value3, key4, value4)
        expect(await openAvatarGen0TextRecords.text(dna, key1)).to.equal(value1)
        expect(await openAvatarGen0TextRecords.text(dna, key2)).to.equal(value2)
        expect(await openAvatarGen0TextRecords.text(dna, key3)).to.equal(value3)
        expect(await openAvatarGen0TextRecords.text(dna, key4)).to.equal(value4)
      })
    })

    describe('setTexts', function () {
      it('Should be able to set multiple key/values with setTexts', async function () {
        const dna = DNA_0
        const key1 = 'foo1'
        const value1 = 'bar1'
        const key2 = 'foo2'
        const value2 = 'bar2'
        const key3 = 'foo3'
        const value3 = 'bar3'
        await openAvatarGen0TextRecords.setTexts(dna, [
          { key: key1, value: value1 },
          { key: key2, value: value2 },
          { key: key3, value: value3 },
        ])
        expect(await openAvatarGen0TextRecords.text(dna, key1)).to.equal(value1)
        expect(await openAvatarGen0TextRecords.text(dna, key2)).to.equal(value2)
        expect(await openAvatarGen0TextRecords.text(dna, key3)).to.equal(value3)
      })
    })
  })
})
