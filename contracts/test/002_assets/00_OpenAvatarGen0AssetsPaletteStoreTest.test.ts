import { expect } from 'chai'
import { Contract } from 'ethers'
import hre, { ethers } from 'hardhat'
import { expectOneEvent, mkTestDirs } from '../utils'

import { AvatarDefinitions, PaletteDescriptor } from '@openavatar/types'
import { GasParams } from '../../src/client/GasParams'
import { OpenAvatarGen0AssetsPaletteStore } from '../../src/client/core/assets/OpenAvatarGen0AssetsPaletteStore'
import { PaletteUploader } from '../../src/upload/PaletteUploader'
import { TestHelper } from '../TestHelper'
import { TestImageData } from '../TestImageData'

describe('OpenAvatarGen0AssetsPaletteStore', function () {
  let contract: Contract

  let wrapper: OpenAvatarGen0AssetsPaletteStore

  async function doInit() {
    mkTestDirs()

    contract = await TestHelper.initOpenAvatarGen0AssetsPaletteStore(ethers)

    wrapper = new OpenAvatarGen0AssetsPaletteStore(hre, contract)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Initialization tests
  /////////////////////////////////////////////////////////////////////////////
  describe('Should init with proper state', function () {
    beforeEach(doInit)
    it('Should start with 0 palettes', async function () {
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(0)
      expect(parseInt(await contract.getNumPalettes(0))).to.equal(0)
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(await contract.getPalette(i, j)).to.deep.equal([])
        }
      }
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Error handling tests
  /////////////////////////////////////////////////////////////////////////////

  describe('Should handle palette upload errors', function () {
    beforeEach(doInit)

    // in solidity a pallete is an array of bytes4 where a bytes4 is a 4-byte array
    // so we need to construct 4-byte hexstrings, convert to Buffers, then wrap that in an array
    const fakePalette = [
      Buffer.from('00000000', 'hex'),
      Buffer.from('000000FF', 'hex'),
      Buffer.from('22222222', 'hex'),
      Buffer.from('33333333', 'hex'),
      Buffer.from('44444444', 'hex'),
    ]

    it('Should not be able to upload palette at wrong palette code', async function () {
      const oobCode = 123
      const index = 0
      await expect(contract.uploadPalette({ code: oobCode, index, palette: fakePalette })).to.be.revertedWith(
        `InvalidPaletteCode(${oobCode})`
      )
    })

    it('Should not be able to upload palette at wrong (code,index) index', async function () {
      const code = 0
      const oobIndex = 123
      await expect(contract.uploadPalette({ code, index: oobIndex, palette: fakePalette })).to.be.revertedWith(
        `PaletteIndexOutOfBounds(${code}, ${oobIndex})`
      )
    })

    it('Should not be able to upload empty palette', async function () {
      const code = 0
      const index = 0
      await expect(contract.uploadPalette({ code, index, palette: [] })).to.be.revertedWith('InvalidPaletteLength(0)')
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Upload tests
  /////////////////////////////////////////////////////////////////////////////

  describe('Should upload palettes', function () {
    beforeEach(doInit)

    it('Should upload a palette', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      await contract.uploadPalette({ code, index, palette: TestImageData.PALETTE_ONE_COLOR_TRANSPARENT })
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      const palette: string[] = await contract.getPalette(code, index)
      expect(palette.length).to.equal(1)
      expect(palette[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))
    })

    it('Should upload multiple palettes', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      await contract.uploadPalette({ code, index, palette: TestImageData.PALETTE_ONE_COLOR_TRANSPARENT })
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      const palette: string[] = await contract.getPalette(code, index)
      expect(palette.length).to.equal(1)
      expect(palette[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))

      await contract.uploadPalette({
        code,
        index: index + 1,
        palette: TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK,
      })
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(2)
      const palette2: string[] = await contract.getPalette(code, index + 1)
      expect(palette2.length).to.equal(2)
      expect(palette2[0].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[0].toString('hex'))
      expect(palette2[1].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[1].toString('hex'))

      await contract.uploadPalette({
        code: code,
        index: index + 2,
        palette: TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
      })
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(3)
      const palette3: string[] = await contract.getPalette(code, index + 2)
      expect(palette3.length).to.equal(1)
      expect(palette3[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))
    })

    it('Should upload multiple palettes via batch upload', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      const palettes = [
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
        TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK,
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
      ]
      await contract.uploadPaletteBatch({ code, fromIndex: index, palettes })
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(3)
      const palette: string[] = await contract.getPalette(code, index)
      expect(palette.length).to.equal(1)
      expect(palette[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))

      const palette2: string[] = await contract.getPalette(code, index + 1)
      expect(palette2.length).to.equal(2)
      expect(palette2[0].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[0].toString('hex'))
      expect(palette2[1].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[1].toString('hex'))

      const palette3: string[] = await contract.getPalette(code, index + 2)
      expect(palette3.length).to.equal(1)
      expect(palette3[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))
    })

    it('Should upload multiple palettes via multi-batch upload', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      const palettes = [
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
        TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK,
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
      ]
      // the first 2 for code 0
      const batch1 = { code, fromIndex: index, palettes: palettes.slice(0, 2) }
      // the last 1 for code 1
      const batch2 = { code, fromIndex: index + 2, palettes: palettes.slice(2) }
      const batches = [batch1, batch2]
      await contract.uploadPaletteBatches(batches)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(3)
      const palette: string[] = await contract.getPalette(code, index)
      expect(palette.length).to.equal(1)
      expect(palette[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))

      const palette2: string[] = await contract.getPalette(code, index + 1)
      expect(palette2.length).to.equal(2)
      expect(palette2[0].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[0].toString('hex'))
      expect(palette2[1].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[1].toString('hex'))

      const palette3: string[] = await contract.getPalette(code, index + 2)
      expect(palette3.length).to.equal(1)
      expect(palette3[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))
    })

    it('Should upload multiple palettes across multiple palette codes via multi-batch upload', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      const palettes = [
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
        TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK,
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
      ]
      // the first 2 for code 0
      const batch1 = { code, fromIndex: index, palettes: palettes.slice(0, 2) }
      // the last 1 for code 1
      const batch2 = { code, fromIndex: index + 2, palettes: palettes.slice(2) }
      const batch3 = { code: code + 1, fromIndex: index, palettes: palettes.slice(0, 1) }
      const batches = [batch1, batch2, batch3]
      await contract.uploadPaletteBatches(batches)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(2)
      expect(await contract.getNumPalettes(code)).to.equal(3)
      expect(await contract.getNumPalettes(code + 1)).to.equal(1)
      const palette: string[] = await contract.getPalette(code, index)
      expect(palette.length).to.equal(1)
      expect(palette[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))

      const palette2: string[] = await contract.getPalette(code, index + 1)
      expect(palette2.length).to.equal(2)
      expect(palette2[0].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[0].toString('hex'))
      expect(palette2[1].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[1].toString('hex'))

      const palette3: string[] = await contract.getPalette(code, index + 2)
      expect(palette3.length).to.equal(1)
      expect(palette3[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))

      const palette4: string[] = await contract.getPalette(code + 1, index)
      expect(palette4.length).to.equal(1)
      expect(palette4[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))
    })

    it('Should upload multiple palettes via batch upload at offset', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      await contract.uploadPalette({ code, index, palette: TestImageData.PALETTE_ONE_COLOR_TRANSPARENT })
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      const palette: string[] = await contract.getPalette(code, index)
      expect(palette.length).to.equal(1)
      expect(palette[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))

      const palettes = [
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
        TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK,
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT,
      ]
      await contract.uploadPaletteBatch({ code, fromIndex: index + 1, palettes })
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(4)

      const palette2: string[] = await contract.getPalette(code, index + 1)
      expect(palette2.length).to.equal(1)
      expect(palette2[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))

      const palette3: string[] = await contract.getPalette(code, index + 2)
      expect(palette3.length).to.equal(2)
      expect(palette3[0].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[0].toString('hex'))
      expect(palette3[1].slice(2)).to.equal(TestImageData.PALETTE_TWO_COLOR_TRANSPARENT_BLACK[1].toString('hex'))

      const palette4: string[] = await contract.getPalette(code, index + 3)
      expect(palette4.length).to.equal(1)
      expect(palette4[0].slice(2)).to.equal(TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0].toString('hex'))
    })

    it('Should upload multiple palettes at different codes', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      await wrapper.uploadPalette(code, index, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(1)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      expect(await contract.getNumPalettes(code + 1)).to.equal(0)
      expect(await contract.getNumPalettes(code + 2)).to.equal(0)
      expect(await contract.getPalette(code + 1, 0)).to.deep.equal([])
      expect(await contract.getPalette(code + 2, 0)).to.deep.equal([])

      await wrapper.uploadPalette(code + 1, index, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(2)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      expect(await contract.getNumPalettes(code + 1)).to.equal(1)
      expect(await contract.getNumPalettes(code + 2)).to.equal(0)
      expect(await contract.getPalette(code + 2, 0)).to.deep.equal([])

      await wrapper.uploadPalette(code + 2, index, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(3)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      expect(await contract.getNumPalettes(code + 1)).to.equal(1)
      expect(await contract.getNumPalettes(code + 2)).to.equal(1)
      expect(await contract.getPalette(code + 3, 0)).to.deep.equal([])
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuses
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuses', function () {
    beforeEach(doInit)

    async function burnFuseAndTest() {
      const tx = await wrapper.burnFuseCanUploadPalette()
      const receipt = await tx.wait()
      expectOneEvent(receipt, 'FuseBurnedCanUploadPalette')
      expect(await wrapper.isFuseBurnedCanUploadPalette()).to.equal(true)
      // calling again should not emit event
      const tx2 = await wrapper.burnFuseCanUploadPalette()
      const receipt2 = await tx2.wait()
      expect((receipt2 as unknown as { events: any }).events).to.be.empty
    }

    it('Should not be able to upload a palette after burning the fuse', async function () {
      expect(await wrapper.isFuseBurnedCanUploadPalette()).to.equal(false)

      // should succeed
      const code = 0
      const index = 0
      await wrapper.uploadPalette(code, index, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)

      await burnFuseAndTest()

      // should revert with OperationBlockedByBurnedFuse when trying to add another canvas
      await expect(
        wrapper.uploadPalette(code, index + 1, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
      ).to.be.revertedWith('OperationBlockedByBurnedFuse()')
    })

    it('Should not be able to upload a palette batch after burning the fuse', async function () {
      expect(await wrapper.isFuseBurnedCanUploadPalette()).to.equal(false)

      // should succeed
      const code = 0
      const index = 0
      await wrapper.uploadPaletteBatch(code, index, [TestImageData.PALETTE_ONE_COLOR_TRANSPARENT])

      await burnFuseAndTest()

      // should revert with OperationBlockedByBurnedFuse when trying to add another canvas
      await expect(
        wrapper.uploadPaletteBatch(code, index + 1, [TestImageData.PALETTE_ONE_COLOR_TRANSPARENT])
      ).to.be.revertedWith('OperationBlockedByBurnedFuse()')
    })
  })

  describe('Should upload palettes via uploader', function () {
    beforeEach(doInit)

    it('Should be able to upload single palette via uploader', async function () {
      const code = 0
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalette(code, index)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(code + 1)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      expect(await contract.getNumPalettes(code + 1)).to.equal(0)
      expect(await contract.getPalette(code + 1, index)).to.deep.equal([])
    })

    it('Should be able to upload all palettes for a palette code in a single batch upload via uploader', async function () {
      const code = 0
      await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalettes(code)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(code + 1)
      expect(await contract.getNumPalettes(code)).to.equal(AvatarDefinitions.getPalettesByCode(code).length)
      expect(await contract.getNumPalettes(code + 1)).to.equal(0)
    })

    it('Should be able to upload single palette, then batch upload remaining palettes for same palette code via uploader', async function () {
      // first upload a single palette for code 0
      await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalette(0, 0)

      // now we'll test against code 1 which has > 1 palettes
      const code = 1
      const index = 0
      expect(await contract.getPalette(code, index)).to.deep.equal([])
      await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalette(code, index)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(code + 1)
      expect(await contract.getNumPalettes(code)).to.equal(1)
      expect(await contract.getNumPalettes(code + 1)).to.equal(0)

      await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalettes(code, index + 1)
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(code + 1)
      expect(await contract.getNumPalettes(code)).to.equal(AvatarDefinitions.getPalettesByCode(code).length)
      expect(await contract.getNumPalettes(code + 1)).to.equal(0)
    })

    it('Should be able to upload all palettes for each palette code, in a single batch per palette code, via uploader', async function () {
      for (let i = 0; i < AvatarDefinitions.getNumPaletteCodes(); i++) {
        await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalettes(i)
        expect(await contract.getNumPalettes(i)).to.equal(AvatarDefinitions.getPalettesByCode(i).length)
        expect(await contract.getNumPalettes(i + 1)).to.equal(0)
        expect(parseInt(await contract.getNumPaletteCodes())).to.equal(i + 1)
      }
    })

    it('Should be able to upload all nicely via uploader', async function () {
      await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadAll(15_000_000)

      for (let i = 0; i < AvatarDefinitions.getNumPaletteCodes(); i++) {
        expect(await contract.getNumPalettes(i)).to.equal(AvatarDefinitions.getPalettesByCode(i).length)
      }
      expect(parseInt(await contract.getNumPaletteCodes())).to.equal(AvatarDefinitions.getNumPaletteCodes())
    })

    it('Should be able to upload all palettes individually in sequence via uploader', async function () {
      for (let i = 0; i < AvatarDefinitions.getNumPaletteCodes(); i++) {
        const palettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(i)
        for (let j = 0; j < palettes.length; j++) {
          // double check that index == j
          expect(palettes[j].index).to.equal(j)
          await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalette(i, j)
          expect(await contract.getNumPalettes(i)).to.equal(j + 1)
          expect(await contract.getNumPalettes(i + 1)).to.equal(0)
        }
        expect(parseInt(await contract.getNumPaletteCodes())).to.equal(i + 1)
      }
    })
  })
})
