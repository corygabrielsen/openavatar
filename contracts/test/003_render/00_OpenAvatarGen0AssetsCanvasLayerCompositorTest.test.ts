import { ColorFormat, PatternTexture } from '@openavatar/assets'
import { AvatarLayerStack, AvatarPose } from '@openavatar/types'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OptionalPatternHeader } from '../../src/client/core/assets/OpenAvatarGen0AssetsPatternStore'
import { OpenAvatarGen0AssetsCanvasLayerCompositor } from '../../src/client/core/render/OpenAvatarGen0AssetsCanvasLayerCompositor'
import { TestHelper } from '../TestHelper'
import { TestImageData } from '../TestImageData'
import { mkTestDirs } from '../utils'

const BG: number = parseInt('00', 16)

const WIDTH_8x8 = 8
const HEIGHT_8x8 = 8
const TEST_IMAGE_DATA_8x8 = new TestImageData({ width: WIDTH_8x8, height: HEIGHT_8x8 }, AvatarLayerStack.topLayer.index)
const EMPTY_8x8 = new Uint8Array(WIDTH_8x8 * HEIGHT_8x8 * 4)

const WIDTH_32x32 = 32
const HEIGHT_32x32 = 32

describe('OpenAvatarGen0AssetsCanvasLayerCompositor', function () {
  let contract: Contract
  let wrapper: OpenAvatarGen0AssetsCanvasLayerCompositor
  let openAvatarGen0Assets: OpenAvatarGen0Assets

  const POSE: AvatarPose = AvatarPose.IdleDown0

  async function doInit(): Promise<void> {
    mkTestDirs()

    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    wrapper = await TestHelper.initOpenAvatarGen0AssetsCanvasLayerCompositor(ethers, openAvatarGen0Assets)
    contract = wrapper.contract
  }

  async function doInitWithLayers(width: number, height: number): Promise<void> {
    await doInit()
    await openAvatarGen0Assets.addCanvas({ id: POSE.canvasId, width, height })
    await openAvatarGen0Assets.addLayers(
      POSE.canvasId,
      [...AvatarLayerStack.iter()].map((layer) => layer.index)
    )
  }

  /////////////////////////////////////////////////////////////////////////////
  // Helpers
  /////////////////////////////////////////////////////////////////////////////

  async function doInit8x8() {
    const WIDTH = 8
    const HEIGHT = 8
    await doInitWithLayers(WIDTH, HEIGHT)
    // first we need to upload the test image data for each layer
    // upload the test data
    const txs = []
    for (const layer of AvatarLayerStack.iter()) {
      // backfill empty palette codes...
      while ((await openAvatarGen0Assets.getNumPaletteCodes()) < layer.index) {
        await openAvatarGen0Assets.uploadPalette(
          await openAvatarGen0Assets.getNumPaletteCodes(),
          0,
          TestImageData.PALETTE_ONE_COLOR_TRANSPARENT
        )
      }

      // now upload the desired pattern for this layer
      await openAvatarGen0Assets.uploadPalette(layer.index, 0, [
        TestImageData.PALETTE_ONE_COLOR_TRANSPARENT[0],
        Buffer.from(layer.index.toString(16).padStart(2, '0').repeat(3) + 'FF', 'hex'),
      ])

      const patternData: PatternTexture = TEST_IMAGE_DATA_8x8.getLayerPattern(layer.index)
      // pattern 0 should already exist
      const canvasId: number = 0
      const numPatterns = await openAvatarGen0Assets.getNumPatterns(canvasId, layer.index)
      expect(numPatterns).to.equal(1)
      txs.push(
        await openAvatarGen0Assets.uploadPattern({
          canvasId,
          layer: layer.index,
          index: numPatterns,
          // header
          width: WIDTH,
          height: HEIGHT,
          offsetX: 0,
          offsetY: 0,
          paletteCode: layer.index,
          // data
          data: Buffer.from(patternData.patternData),
        })
      )
      await txs[txs.length - 1].wait()
      // now retrieve the corresponding pattern header back
      const optionalPatternHeader: OptionalPatternHeader = await openAvatarGen0Assets.getPatternHeader(
        canvasId,
        layer.index,
        numPatterns
      )
      expect(optionalPatternHeader.exists).to.equal(true)
      expect(optionalPatternHeader.header.width).to.equal(WIDTH)
      expect(optionalPatternHeader.header.height).to.equal(HEIGHT)
      expect(optionalPatternHeader.header.offsetX).to.equal(0)
      expect(optionalPatternHeader.header.offsetY).to.equal(0)
      expect(optionalPatternHeader.header.paletteCode).to.equal(layer.index)
    }
    return await Promise.all(txs)
  }

  async function doInit32x32() {
    await doInitWithLayers(WIDTH_32x32, HEIGHT_32x32)
    await openAvatarGen0Assets.uploadPalette(0, 0, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Compose Layers tests
  /////////////////////////////////////////////////////////////////////////////

  function testComposeTransparentLayersIntoDefaultBackgroundImage(width: number, height: number) {
    it(`Should be able to create ${width}x${height} transparent layer composition`, async function () {
      const hex: string = await contract.createLayerComposition(
        POSE.canvasId,
        AvatarLayerStack.map((layer) => [layer.index, 0, 0])
      )
      expect(typeof hex).to.equal('string')
      expect(hex.slice(0, 2)).to.equal('0x')

      const imageStr: string = hex.slice(2)
      const image: Buffer = Buffer.from(imageStr, 'hex')

      const bytesPerPixel = ColorFormat.RGBA8.bytesPerPixel
      expect(image.length).to.equal(width * height * bytesPerPixel)

      for (let i = 0; i < image.length; i += bytesPerPixel) {
        expect(`image[${i}]=${image[i]}`).to.equal(`image[${i}]=${BG}`)
        expect(`image[${i + 1}]=${image[i + 1]}`).to.equal(`image[${i + 1}]=${BG}`)
        expect(`image[${i + 2}]=${image[i + 2]}`).to.equal(`image[${i + 2}]=${BG}`)
      }
    })
  }

  describe('8x8 tests', function () {
    describe('Happy Cases', function () {
      beforeEach(doInit8x8)

      testComposeTransparentLayersIntoDefaultBackgroundImage(WIDTH_8x8, HEIGHT_8x8)

      it('Should be able to create non-transparent patterned layer composition', async function () {
        const patternIndex = 1
        const paletteIndex = 0

        // sanity check we have enough patterns uploaded for each of these
        const canvasId: number = 0
        const layerPatternPalettes: [number, number, number][] = []
        for (const layer of AvatarLayerStack.iter()) {
          const numPatterns = await openAvatarGen0Assets.getNumPatterns(canvasId, layer.index)
          expect(numPatterns, `numPatterns for layer ${layer.name}`).to.be.greaterThanOrEqual(patternIndex + 1)

          // get the pattern header
          const optionalPatternHeader: OptionalPatternHeader = await openAvatarGen0Assets.getPatternHeader(
            canvasId,
            layer.index,
            1
          )
          // for the test data the palette code is equal to the layer index
          expect(optionalPatternHeader.exists).to.equal(true)
          expect(optionalPatternHeader.header.paletteCode).to.equal(layer.index)
          layerPatternPalettes.push([layer.index, patternIndex, paletteIndex])
        }

        const result: string = await contract.createLayerComposition(POSE.canvasId, layerPatternPalettes)
        const actual: Buffer = Buffer.from(result.slice(2), 'hex')
        const expected: Buffer = Buffer.from(TEST_IMAGE_DATA_8x8.renderOverlay(AvatarLayerStack.topLayer.index).data)
        expect(actual).to.deep.equal(expected)
      })
    })

    describe('8x8 Out-of-bounds lookup', function () {
      beforeEach(async function () {
        await doInitWithLayers(8, 8)
      })

      it('Should be able to create transparent layer composition if out-of-bounds pattern indices', async function () {
        expect(
          Buffer.from(
            (
              await contract.createLayerComposition(
                POSE.canvasId,
                AvatarLayerStack.map((layer) => [layer.index, 255, 0])
              )
            ).slice(2),
            'hex'
          )
        ).to.deep.equal(EMPTY_8x8)
      })

      it('Should be able to create transparent layer composition if out-of-bounds palette indices', async function () {
        expect(
          Buffer.from(
            (
              await contract.createLayerComposition(
                POSE.canvasId,
                AvatarLayerStack.map((layer) => [layer.index, 0, 255])
              )
            ).slice(2),
            'hex'
          )
        ).to.deep.equal(EMPTY_8x8)
      })

      it('Should be able to create transparent layer composition if out-of-bounds pattern and palette indices', async function () {
        expect(
          Buffer.from(
            (
              await contract.createLayerComposition(
                POSE.canvasId,
                AvatarLayerStack.map((layer) => [layer.index, 255, 255])
              )
            ).slice(2),
            'hex'
          )
        ).to.deep.equal(EMPTY_8x8)
      })
    })
  })

  describe('32x32 tests', function () {
    beforeEach(doInit32x32)
    testComposeTransparentLayersIntoDefaultBackgroundImage(WIDTH_32x32, HEIGHT_32x32)
  })
})
