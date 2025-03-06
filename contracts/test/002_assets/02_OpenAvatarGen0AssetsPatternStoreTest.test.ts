import { AvatarAssets, PatternMaster } from '@openavatar/assets'
import { AvatarDefinitions, AvatarLayerStack, AvatarPose, LayerDescriptor, PatternDescriptor } from '@openavatar/types'
import { expect } from 'chai'
import { Contract, ContractReceipt } from 'ethers'
import hre, { ethers } from 'hardhat'
import {
  OpenAvatarGen0AssetsPatternStore,
  OptionalPatternHeader,
} from '../../src/client/core/assets/OpenAvatarGen0AssetsPatternStore'
import { PatternUploader } from '../../src/upload/PatternUploader'
import { expectEvent, expectOneEvent, mkTestDirs } from '../utils'

import { GasParams } from '../../src/client/GasParams'
import { PaletteUploader } from '../../src/upload/PaletteUploader'
import { TestHelper } from '../TestHelper'

describe('OpenAvatarGen0AssetsPatternStore', function () {
  let contract: Contract
  let wrapper: OpenAvatarGen0AssetsPatternStore
  let uploader: PatternUploader

  const PATTERN_32_BY_32_ZEROS: Buffer = Buffer.from('0'.repeat(32 * 32 * 2), 'hex')

  async function doInit() {
    mkTestDirs()

    wrapper = await TestHelper.initOpenAvatarGen0AssetsPatternStore(ethers)
    contract = wrapper.contract
    uploader = new PatternUploader(hre, wrapper, {} as GasParams, { logging: false })
  }

  async function doInitWithCanvas(): Promise<void> {
    await doInit()
    await contract.addCanvas({ id: 0, width: 32, height: 32 })
  }

  async function doInitWithLayersAndPaletteCode(): Promise<void> {
    await doInitWithCanvas()
    const canvasId: number = 0
    for (const layer of AvatarLayerStack.iter()) {
      await contract.addLayer(canvasId, layer.index)
    }
    await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadPalettes(0)
  }

  async function doInitWithLayersAndPalettes(): Promise<void> {
    await doInitWithCanvas()
    const canvasId: number = 0
    for (const layer of AvatarLayerStack.iter()) {
      await contract.addLayer(canvasId, layer.index)
    }
    await new PaletteUploader(hre, contract, {} as GasParams, { logging: false }).uploadAllTestOnly()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Basic tests
  /////////////////////////////////////////////////////////////////////////////
  describe('Should init with proper state', function () {
    beforeEach(doInit)
    it('Should start with 0 palettes', async function () {
      expect(parseInt(await contract.getNumPalettes(0))).to.equal(0)
    })

    it('Should start with 0 layers', async function () {
      for (let canvasId: number = 0; canvasId < 3; canvasId++) {
        expect(parseInt(await contract.getNumLayers(canvasId))).to.equal(0)
      }
    })

    it('Should start with 0 patterns', async function () {
      for (let canvasId: number = 0; canvasId < 3; canvasId++) {
        for (const layer of AvatarLayerStack.iter()) {
          expect(parseInt(await contract.getNumPatterns(canvasId, layer.index))).to.equal(0)
          for (let i = 0; i < 3; i++) {
            const optionalPatternHeader: OptionalPatternHeader = await wrapper.getPatternHeader(
              canvasId,
              layer.index,
              i
            )
            expect(optionalPatternHeader.exists).to.equal(false)
            expect(optionalPatternHeader.header).to.deep.equal({
              width: 0,
              height: 0,
              offsetX: 0,
              offsetY: 0,
              paletteCode: 0,
            })
            expect(await contract.getPatternData(canvasId, layer.index, i)).to.equal('0x')
          }
        }
      }
    })

    it('Should have 0 patterns when checking number of patterns for a layer after init', async function () {
      const canvasId: number = 0
      for (const layer of AvatarLayerStack.iter()) {
        expect(parseInt(await contract.getNumPatterns(canvasId, layer.index))).to.equal(0)
      }
    })
  })

  describe('Should be able to add layers', function () {
    beforeEach(doInitWithCanvas)
    async function testAddLayer(canvasId: number, layer: number): Promise<void> {
      expect(parseInt(await contract.getNumPatterns(canvasId, layer))).to.equal(0)
      const beforeNumLayers = parseInt(await contract.getNumLayers(canvasId))
      const tx = await contract.addLayer(canvasId, layer)
      const receipt: ContractReceipt = await tx.wait()
      expectOneEvent(receipt, 'LayerAdd', { layer })
      // should have transparent layer
      expect(parseInt(await contract.getNumPatterns(canvasId, layer))).to.equal(1)
      const numLayers = parseInt(await contract.getNumLayers(canvasId))
      // 3 cases
      // 1. layer < beforeNumLayers => no new max layer
      // 2. layer == beforeNumLayers => new num layers is layer + 1
      // 3. layer > beforeNumLayers => new num layers is layer + 1
      if (layer < beforeNumLayers) {
        expect(numLayers).to.equal(beforeNumLayers)
      } else {
        expect(numLayers).to.equal(layer + 1)
      }
      // should not be able to add layer again
      await expect(contract.addLayer(canvasId, layer)).to.be.revertedWith(`LayerAlreadyExists(${canvasId}, ${layer}`)
    }

    async function testAddLayers(canvasId: number, layers: number[]): Promise<void> {
      const beforeNumLayers = parseInt(await contract.getNumLayers(canvasId))
      const tx = await contract.addLayers(canvasId, layers)
      const receipt: ContractReceipt = await tx.wait()
      for (const layer of layers) {
        expectEvent(receipt, 'LayerAdd', { canvasId, layer })
      }
      const afterNumLayers = parseInt(await contract.getNumLayers(canvasId))
      const expectedNumLayers = Math.max(beforeNumLayers, Math.max(...layers) + 1)
      expect(afterNumLayers, `num layers is wrong`).to.equal(expectedNumLayers)
      for (let i = 0; i < layers.length; i++) {
        expect(
          parseInt(await contract.getNumPatterns(canvasId, layers[i])),
          `layer ${layers[i]} has wrong num patterns`
        ).to.equal(1)
      }
      // should not be able to add layers again
      await expect(contract.addLayers(canvasId, layers)).to.be.revertedWith(
        `LayerAlreadyExists(${canvasId}, ${layers[0]}`
      )
      for (const layer of layers) {
        await expect(contract.addLayer(canvasId, layer)).to.be.revertedWith(`LayerAlreadyExists(${canvasId}, ${layer}`)
      }
    }

    it('Should be able to add a layer', async function () {
      const canvasId: number = 0
      await testAddLayer(canvasId, 0)
    })

    it('Should be able to add layer with a skipped layer below', async function () {
      const canvasId: number = 0
      const layerNum = 1
      await testAddLayer(canvasId, layerNum)
      // 0 patterns for layer 0
      expect(parseInt(await contract.getNumPatterns(canvasId, 0))).to.equal(0)
      // 1 pattern for layer 1
      expect(parseInt(await contract.getNumPatterns(canvasId, 1))).to.equal(1)
    })

    it('Should be able to add layer with multiple skipped layers below', async function () {
      const canvasId: number = 0
      const layerNum = 10
      await testAddLayer(canvasId, layerNum)
      const numLayers = parseInt(await contract.getNumLayers(canvasId))
      for (let i = 0; i < numLayers - 1; i++) {
        expect(parseInt(await contract.getNumPatterns(canvasId, i))).to.equal(0)
      }
      expect(parseInt(await contract.getNumPatterns(canvasId, numLayers - 1))).to.equal(1)
    })

    it('Should be able to add skipped layer after it was skipped', async function () {
      const canvasId: number = 0
      await contract.addLayer(canvasId, 1)
      expect(parseInt(await contract.getNumLayers(canvasId))).to.equal(2)
      // 0 patterns or palettes for layer 0
      expect(parseInt(await contract.getNumPatterns(canvasId, 0))).to.equal(0)
      expect(parseInt(await contract.getNumPatterns(canvasId, 1))).to.equal(1)
      await testAddLayer(canvasId, 0)
      // 1 pattern and 1 palette for layer 1
      expect(parseInt(await contract.getNumPatterns(canvasId, 1))).to.equal(1)
    })

    it('Should be able to add multiple skipped layers after they were skipped', async function () {
      const canvasId: number = 0
      await contract.addLayer(canvasId, 10)
      expect(await contract.getNumLayers(canvasId)).to.equal(11)
      // now add layers
      for (let i = 0; i < 10; i++) {
        const tx = await contract.addLayer(canvasId, i)
        const receipt: ContractReceipt = await tx.wait()
        expectOneEvent(receipt, 'LayerAdd', { canvasId, layer: i })
        // check that num layers is unchanged
        expect(await contract.getNumLayers(canvasId)).to.equal(11)
      }
      for (let i = 0; i <= 10; i++) {
        expect(parseInt(await contract.getNumPatterns(canvasId, i))).to.equal(1)
      }
    })

    it('Should be able to add multiple layers at once', async function () {
      await testAddLayers(0, [0, 1, 2])
    })

    it('Should be able to add single layer after adding multiple layers', async function () {
      await testAddLayers(0, [0, 1, 2])
      await testAddLayer(0, 3)
    })

    it('Should be able to add multiple layers at once with skipped layers', async function () {
      await testAddLayers(0, [0, 2, 3])
      await testAddLayer(0, 1)
      await testAddLayer(0, 4)
    })

    it('Should be able to add multiple layers with multiple skipped layers', async function () {
      await testAddLayers(0, [0, 2, 4, 8, 16, 32, 64])
      await testAddLayer(0, 1)
      await testAddLayer(0, 3)
      await testAddLayer(0, 5)
      await testAddLayers(0, [6, 7, /* 8, /*/ 9, 10, 11, 12, 13, 14, 15])
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Error tests
  /////////////////////////////////////////////////////////////////////////////
  describe('Should handle error cases properly', function () {
    before(doInitWithLayersAndPaletteCode)

    it('Should not be able to upload pattern at wrong layer index', async function () {
      const canvasId: number = 0
      const oobIndex = 255
      await expect(
        contract.uploadPattern({
          canvasId,
          layer: oobIndex,
          index: 0,
          // header
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
          paletteCode: 0,
          // data
          data: PATTERN_32_BY_32_ZEROS,
        })
      ).to.be.revertedWith(`LayerIndexOutOfBounds(${canvasId}, ${oobIndex})`)
    })

    it('Should not be able to upload pattern at wrong (layer,pattern) index', async function () {
      const canvasId: number = 0
      const layer: LayerDescriptor = AvatarLayerStack.bottomLayer
      const invalidPatternIndex = 123
      await expect(
        contract.uploadPattern({
          canvasId,
          layer: layer.index,
          index: invalidPatternIndex,
          // header
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
          paletteCode: 0,
          // data
          data: PATTERN_32_BY_32_ZEROS,
        })
      ).to.be.revertedWith(`PatternIndexOutOfBounds(${canvasId}, ${layer.index}, ${invalidPatternIndex})`)
    })

    it('Should not be able to upload at existing uploaded index', async function () {
      const canvasId: number = 0
      const layer: LayerDescriptor = AvatarLayerStack.bottomLayer
      const numPatterns = await wrapper.getNumPatterns(canvasId, layer.index)
      expect(numPatterns).to.equal(1)
      const expectedError = `PatternAlreadyExists(${canvasId}, ${layer.index}, 0)`
      await expect(
        contract.uploadPattern({
          canvasId,
          layer: layer.index,
          index: 0,
          // header
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
          paletteCode: 0,
          // data
          data: PATTERN_32_BY_32_ZEROS,
        })
      ).to.be.revertedWith(expectedError)
    })
    it('Should not be able to upload empty pattern', async function () {
      const canvasId: number = 0
      const layer: LayerDescriptor = AvatarLayerStack.bottomLayer
      const newPatternIndex = await wrapper.getNumPatterns(canvasId, layer.index)
      await expect(
        contract.uploadPattern({
          canvasId,
          layer: layer.index,
          index: newPatternIndex,
          // header
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
          paletteCode: 0,
          // data
          data: Buffer.from([]),
        })
      ).to.be.revertedWith('InvalidPatternLength(32, 32, 0)')
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Fuses
  /////////////////////////////////////////////////////////////////////////////

  describe('Fuses', function () {
    const POSE = AvatarPose.IdleDown0
    const LAYERS = [AvatarLayerStack.bottomLayer.index, AvatarLayerStack.topLayer.index]

    describe('Fuse: Can Add Layer', function () {
      beforeEach(doInitWithCanvas)

      async function burnFuseAndTest() {
        const tx = await wrapper.burnFuseCanAddLayer()
        const receipt = await tx.wait()
        expectOneEvent(receipt, 'FuseBurnedCanAddLayer')
        expect(await wrapper.isFuseBurnedCanAddLayer()).to.equal(true)
        // calling again should not emit event
        const tx2 = await wrapper.burnFuseCanAddLayer()
        const receipt2 = await tx2.wait()
        expect((receipt2 as unknown as { events: any }).events).to.be.empty
      }

      it('Should not be able to add a layer after burning the fuse', async function () {
        expect(await wrapper.isFuseBurnedCanAddLayer()).to.equal(false)

        // should succeed
        await wrapper.addLayer(POSE.canvasId, LAYERS[0])

        await burnFuseAndTest()

        await expect(wrapper.addLayer(POSE.canvasId, LAYERS[1])).to.be.revertedWith('OperationBlockedByBurnedFuse()')
      })

      it('Should not be able to add multiple layers at once after burning the fuse', async function () {
        expect(await wrapper.isFuseBurnedCanAddLayer()).to.equal(false)

        // should succeed
        await wrapper.addLayers(POSE.canvasId, [LAYERS[0]])

        await burnFuseAndTest()

        await expect(wrapper.addLayers(POSE.canvasId, [LAYERS[1]])).to.be.revertedWith('OperationBlockedByBurnedFuse()')
      })
    })

    describe('Fuse: Can Upload Patterns', function () {
      beforeEach(doInitWithLayersAndPaletteCode)

      async function burnFuseAndTest() {
        const tx = await wrapper.burnFuseCanUploadPattern()
        const receipt = await tx.wait()
        expectOneEvent(receipt, 'FuseBurnedCanUploadPattern')
        expect(await wrapper.isFuseBurnedCanUploadPattern()).to.equal(true)
        // calling again should not emit event
        const tx2 = await wrapper.burnFuseCanUploadPattern()
        const receipt2 = await tx2.wait()
        expect((receipt2 as unknown as { events: any }).events).to.be.empty
      }

      it('Should not be able to upload a pattern after burning the fuse', async function () {
        expect(await wrapper.isFuseBurnedCanUploadPattern()).to.equal(false)

        // should succeed
        const numPatterns = await wrapper.getNumPatterns(0, AvatarLayerStack.bottomLayer.index)
        const index = numPatterns
        await wrapper.uploadPattern({
          canvasId: POSE.canvasId,
          layer: AvatarLayerStack.bottomLayer.index,
          index,
          // header
          width: 32,
          height: 32,
          offsetX: 0,
          offsetY: 0,
          paletteCode: 0,
          // data
          data: PATTERN_32_BY_32_ZEROS,
        })

        await burnFuseAndTest()

        await expect(
          wrapper.uploadPattern({
            canvasId: POSE.canvasId,
            layer: AvatarLayerStack.bottomLayer.index,
            index: index + 1,
            // header
            width: 32,
            height: 32,
            offsetX: 0,
            offsetY: 0,
            paletteCode: 0,
            // data
            data: PATTERN_32_BY_32_ZEROS,
          })
        ).to.be.revertedWith('OperationBlockedByBurnedFuse()')
      })

      it('Should not be able to upload a pattern batch after burning the fuse', async function () {
        expect(await wrapper.isFuseBurnedCanUploadPattern()).to.equal(false)

        // should succeed
        const numPatterns = await wrapper.getNumPatterns(0, AvatarLayerStack.bottomLayer.index)
        const index = numPatterns
        await wrapper.uploadPatterns([
          {
            canvasId: POSE.canvasId,
            layer: AvatarLayerStack.bottomLayer.index,
            index,
            // header
            width: 32,
            height: 32,
            offsetX: 0,
            offsetY: 0,
            paletteCode: 0,
            // data
            data: PATTERN_32_BY_32_ZEROS,
          },
        ])

        await burnFuseAndTest()

        await expect(
          wrapper.uploadPatterns([
            {
              canvasId: POSE.canvasId,
              layer: AvatarLayerStack.bottomLayer.index,
              index: index,
              // header
              width: 32,
              height: 32,
              offsetX: 0,
              offsetY: 0,
              paletteCode: 0,
              // data
              data: PATTERN_32_BY_32_ZEROS,
            },
          ])
        ).to.be.revertedWith('OperationBlockedByBurnedFuse()')
      })
    })
  })

  /////////////////////////////////////////////////////////////////////////////
  // Upload pattern tests
  /////////////////////////////////////////////////////////////////////////////

  describe('Should be able to upload patterns', function () {
    beforeEach(doInitWithLayersAndPalettes)
    it('Should be able to upload one pattern', async function () {
      const pose: AvatarPose = AvatarDefinitions.getPose(0)
      const layer: LayerDescriptor = AvatarLayerStack.bottomLayer
      const numPatternsBefore = await wrapper.getNumPatterns(pose.canvasId, layer.index)
      expect(numPatternsBefore).to.equal(1)
      const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, numPatternsBefore)
      const tx = await uploader.uploadPattern(pattern, pose)
      const receipt = await tx.wait()
      expectEvent(receipt, 'PatternUpload', {
        canvasId: pose.canvasId,
        layer: layer.index,
        pattern: numPatternsBefore,
      })
      const numPatternsAfter = await wrapper.getNumPatterns(pose.canvasId, layer.index)
      expect(numPatternsAfter).to.equal(numPatternsBefore + 1)

      const optionalPatternHeader: OptionalPatternHeader = await wrapper.getPatternHeader(
        pose.canvasId,
        layer.index,
        pattern.index
      )
      expect(optionalPatternHeader.exists).to.equal(true)
      expect(optionalPatternHeader.header.width + optionalPatternHeader.header.offsetX).to.lessThanOrEqual(32)
      expect(optionalPatternHeader.header.height + optionalPatternHeader.header.offsetY).to.lessThanOrEqual(32)
      expect(optionalPatternHeader.header.paletteCode).to.equal(2) // this is a bit brittle but should work unless we change codes
    })
    it('Should be able to upload a pattern for each layer', async function () {
      const pose: AvatarPose = AvatarDefinitions.getPose(0)
      const expectedBeforeNumPatterns = 1
      for (const layer of AvatarLayerStack.iter()) {
        const expected = {
          layer: layer.name,
          numPatterns: expectedBeforeNumPatterns,
        }
        const got = {
          layer: layer.name,
          numPatterns: await wrapper.getNumPatterns(pose.canvasId, layer.index),
        }
        expect(`${JSON.stringify(got)}`).to.equal(`${JSON.stringify(expected)}`)
      }
      for (const layer of AvatarLayerStack.iter()) {
        const patternIndexToUpload = await wrapper.getNumPatterns(pose.canvasId, layer.index)
        const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, patternIndexToUpload)
        const tx = await uploader.uploadPattern(pattern, pose)
        const receipt = await tx.wait()
        expectEvent(receipt, 'PatternUpload', {
          canvasId: pose.canvasId,
          layer: layer.index,
          pattern: patternIndexToUpload,
        })
      }

      const expectedAfterNumStyles = 2
      for (const layer of AvatarLayerStack.iter()) {
        const expected = {
          layer: layer.name,
          numStyles: expectedAfterNumStyles,
        }
        const got = {
          layer: layer.name,
          numStyles: await wrapper.getNumPatterns(pose.canvasId, layer.index),
        }
        expect(`${JSON.stringify(got)}`).to.equal(`${JSON.stringify(expected)}`)
      }
    })
  })

  describe('Should be able to upload everything', function () {
    beforeEach(doInitWithLayersAndPalettes)

    async function expectAllUploaded() {
      const canvasId: number = 0
      // now loop through each layer and ensure correct number of patterns
      // and loop through each (layer, pattern) and ensure correct number of palettes
      // source of truth is Options
      for (const layer of AvatarLayerStack.iter()) {
        const numPatterns = await wrapper.getNumPatterns(canvasId, layer.index)

        // ensure correct number of patterns
        expect(numPatterns).to.equal(AvatarDefinitions.getPatternCount(layer))

        // loop through each pattern and ensure correct info
        for (let patternIndex = 0; patternIndex < numPatterns; patternIndex++) {
          const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, patternIndex)
          const patternMaster: PatternMaster = AvatarAssets.getPattern(pattern)

          const optionalPatternHeader: OptionalPatternHeader = await wrapper.getPatternHeader(
            canvasId,
            layer.index,
            pattern.index
          )
          expect(optionalPatternHeader.exists).to.equal(true)
          expect(optionalPatternHeader.header.width + optionalPatternHeader.header.offsetX).to.lessThanOrEqual(32)
          expect(optionalPatternHeader.header.height + optionalPatternHeader.header.offsetY).to.lessThanOrEqual(32)

          // sanity check that the first pattern is transparent
          if (patternIndex == 0) {
            expect(optionalPatternHeader.header.paletteCode).to.equal(0)
          } else {
            expect(optionalPatternHeader.header.paletteCode).to.not.equal(0)
          }

          // now match the expected palette code from source data
          expect(optionalPatternHeader.header.paletteCode).to.equal(patternMaster.paletteCode)
        }
      }
    }

    // this test is too slow to run for naive implementation, but it works here for 1024byte patterns + palettes
    it('Should be able to upload all patterns for all layers', async function () {
      await uploader.uploadAllTestOnly(AvatarDefinitions.getPose(0))

      await expectAllUploaded()
    })
  })
})
