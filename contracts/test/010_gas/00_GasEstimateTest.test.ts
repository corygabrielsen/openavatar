import { PatternTexture } from '@openavatar/assets'
import {
  AvatarDefinitions,
  AvatarLayerStack,
  AvatarPose,
  DNA,
  PatternDescriptor,
  PatternPaletteDescriptor,
} from '@openavatar/types'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import hre, { ethers } from 'hardhat'
import { GasParams } from '../../src/client/GasParams'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../../src/client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { OptionalPatternHeader } from '../../src/client/core/assets/OpenAvatarGen0AssetsPatternStore'
import { OpenAvatarGen0ProfilePictureRenderer } from '../../src/client/extensions/OpenAvatarGen0ProfilePictureRenderer'
import { PaletteUploader } from '../../src/upload/PaletteUploader'
import { PatternUploader } from '../../src/upload/PatternUploader'
import { fmtCommas } from '../../src/util/StringUtils'
import { TestHelper } from '../TestHelper'
import { TestImageData } from '../TestImageData'

interface GasTest {
  found: BigNumber
  expected: BigNumber
  errorMsg: string
}

let createLayerComposition8x8: GasTest = {
  found: BigNumber.from(0),
  expected: BigNumber.from(241_491),
  errorMsg: '',
}

let createLayerComposition32x32: GasTest = {
  found: BigNumber.from(0),
  expected: BigNumber.from(250_790),
  errorMsg: '',
}
let renderURI: GasTest = {
  found: BigNumber.from(0),
  expected: BigNumber.from(10_785_118),
  errorMsg: '',
}
let tokenURI: GasTest = {
  found: BigNumber.from(0),
  expected: BigNumber.from(11_643_769),
  errorMsg: '',
}
let pfpTokenURI: GasTest = {
  found: BigNumber.from(0),
  expected: BigNumber.from(14_793_409),
  errorMsg: '',
}

const WIDTH_8x8 = 8
const HEIGHT_8x8 = 8
const TEST_IMAGE_DATA_8x8 = new TestImageData({ width: WIDTH_8x8, height: HEIGHT_8x8 }, AvatarLayerStack.topLayer.index)

const WIDTH_32x32 = 32
const HEIGHT_32x32 = 32

const POSE: AvatarPose = AvatarPose.IdleDown0

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const ENDC = '\x1b[0m'
/////////////////////////////////////////////////////////////////////////////
// Helpers
/////////////////////////////////////////////////////////////////////////////

function fmtErrorMsg(functionName: string, gasEstimate: BigNumber, limit: BigNumber) {
  const errorPrefix = `${functionName}(): `
  let errorPostfix = ''
  const fmtGasEstimate = fmtCommas(gasEstimate.toNumber()).replace(/,/g, '_')
  const fmtLimit = fmtCommas(limit.toNumber())
  if (gasEstimate.gt(limit)) {
    errorPostfix = `gasEstimate = ${GREEN}${fmtGasEstimate}${ENDC} > ${RED}${fmtLimit}${ENDC} by ${fmtCommas(
      gasEstimate.sub(limit).toNumber()
    )}`
  } else if (gasEstimate.lt(limit)) {
    errorPostfix = `gasEstimate = ${GREEN}${fmtGasEstimate}${ENDC} < ${RED}${fmtLimit}${ENDC} by ${fmtCommas(
      BigNumber.from(limit).sub(gasEstimate).toNumber()
    )}`
  }
  return errorPrefix + errorPostfix
}

describe('Gas Estimate Tests', function () {
  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry
  let openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer
  let openAvatarGen0Token: OpenAvatarGen0Token
  let openAvatarGen0TextRecords: OpenAvatarGen0TextRecords

  async function doInit(width: number, height: number) {
    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    await openAvatarGen0Assets.addCanvas({ id: POSE.canvasId, width: width, height: height })
    await openAvatarGen0Assets.addLayers(
      POSE.canvasId,
      [...AvatarLayerStack.iter()].map((layer) => layer.index)
    )
    await openAvatarGen0Assets.uploadPalette(POSE.canvasId, 0, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
    openAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    openAvatarGen0RendererRegistry = await TestHelper.initOpenAvatarGen0RendererRegistry(ethers, {
      key: 'base',
      openAvatarGen0Renderer,
    })
    openAvatarGen0Token = await TestHelper.initOpenAvatarGen0Token(ethers, openAvatarGen0RendererRegistry)
    openAvatarGen0TextRecords = await TestHelper.initOpenAvatarGen0TextRecords(ethers, openAvatarGen0Token)
    openAvatarGen0ProfilePictureRenderer = await TestHelper.initOpenAvatarGen0ProfilePictureRenderer(
      ethers,
      openAvatarGen0Assets,
      openAvatarGen0Renderer,
      openAvatarGen0Token,
      openAvatarGen0TextRecords
    )
  }

  async function doInit8x8() {
    await doInit(WIDTH_8x8, HEIGHT_8x8) // first we need to upload the test image data for each layer

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
          width: WIDTH_8x8,
          height: HEIGHT_8x8,
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
      expect(optionalPatternHeader.header.width).to.equal(WIDTH_8x8)
      expect(optionalPatternHeader.header.height).to.equal(HEIGHT_8x8)
      expect(optionalPatternHeader.header.offsetX).to.equal(0)
      expect(optionalPatternHeader.header.offsetY).to.equal(0)
      expect(optionalPatternHeader.header.paletteCode).to.equal(layer.index)
    }
    return await Promise.all(txs)
  }

  async function doInit32x32() {
    await doInit(WIDTH_32x32, HEIGHT_32x32)
  }

  describe('8x8', function () {
    before(async function () {
      await doInit8x8()
      createLayerComposition8x8.found = await ethers.provider.estimateGas(
        await openAvatarGen0Renderer.contract.populateTransaction.createLayerComposition(
          POSE.canvasId,
          AvatarLayerStack.map((layer) => [layer.index, 0, 0])
        )
      )
      createLayerComposition8x8.errorMsg = fmtErrorMsg(
        'createLayerComposition(8x8)',
        createLayerComposition8x8.found,
        createLayerComposition8x8.expected
      )
      if (!createLayerComposition8x8.expected.eq(createLayerComposition8x8.found)) {
        console.error(createLayerComposition8x8.errorMsg)
      }
    })

    it(`Should cost ${fmtCommas(
      createLayerComposition8x8.expected.toNumber()
    )} gas to create transparent 32x32 layer composition`, async function () {
      expect(createLayerComposition8x8.found).to.eq(createLayerComposition8x8.expected)
    })
  })

  describe('32x32', function () {
    before(async function () {
      await doInit32x32()

      ////////////////////////////////////////////////////////////////////////////////
      // createLayerComposition
      ////////////////////////////////////////////////////////////////////////////////
      createLayerComposition32x32.found = await ethers.provider.estimateGas(
        await openAvatarGen0Renderer.contract.populateTransaction.createLayerComposition(
          POSE.canvasId,
          AvatarLayerStack.map((layer) => [layer.index, 0, 0])
        )
      )
      createLayerComposition32x32.errorMsg = fmtErrorMsg(
        'createLayerComposition(32x32)',
        createLayerComposition32x32.found,
        createLayerComposition32x32.expected
      )
      if (!createLayerComposition32x32.expected.eq(createLayerComposition32x32.found)) {
        console.error(createLayerComposition32x32.errorMsg)
      }

      ////////////////////////////////////////////////////////////////////////////////
      // renderURI
      ////////////////////////////////////////////////////////////////////////////////
      await new PaletteUploader(hre, openAvatarGen0Assets, {} as GasParams, { logging: false }).uploadAllTestOnly()
      await new PatternUploader(hre, openAvatarGen0Assets, {} as GasParams, { logging: false }).uploadAllTestOnly(POSE)
      let dna: DNA = DNA.ZERO
      for (const layer of AvatarLayerStack.iter()) {
        const numPatterns = AvatarDefinitions.getPatternCount(layer)
        const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, numPatterns - 1)
        const numPalettes = AvatarDefinitions.getPaletteCount(pattern)
        const patternPalette: PatternPaletteDescriptor = AvatarDefinitions.getPatternPalette(
          layer,
          pattern,
          numPalettes - 1
        )
        dna = dna.replace({
          [layer.name]: {
            pattern: pattern.index,
            palette: patternPalette.palette.index,
          },
        })
      }

      renderURI.found = await ethers.provider.estimateGas(
        await openAvatarGen0Renderer.contract.populateTransaction.renderURI(dna.buffer)
      )
      renderURI.errorMsg = fmtErrorMsg('renderURI', renderURI.found, renderURI.expected)
      if (!renderURI.expected.eq(renderURI.found)) {
        console.error(renderURI.errorMsg)
      }

      ////////////////////////////////////////////////////////////////////////////////
      // tokenURI
      ////////////////////////////////////////////////////////////////////////////////
      await (await openAvatarGen0Token.increaseSupplySoftCap(8192)).wait()
      await (await openAvatarGen0Token.setMintPrice(ethers.utils.parseEther('0.1'))).wait()
      await (await openAvatarGen0Token.setMintState(TestHelper.PUBLIC)).wait()
      await (await openAvatarGen0Token.mint(DNA.ZERO)).wait()
      await (await openAvatarGen0Token.mint(dna)).wait()
      tokenURI.found = await ethers.provider.estimateGas(
        await openAvatarGen0Token.contract.populateTransaction.tokenURI(1)
      )
      tokenURI.errorMsg = fmtErrorMsg('tokenURI', tokenURI.found, tokenURI.expected)
      if (!tokenURI.expected.eq(tokenURI.found)) {
        console.error(tokenURI.errorMsg)
      }

      ////////////////////////////////////////////////////////////////////////////////
      // pfp
      ////////////////////////////////////////////////////////////////////////////////
      await openAvatarGen0RendererRegistry.addRenderer('pfp', openAvatarGen0ProfilePictureRenderer.address)
      await openAvatarGen0RendererRegistry.setDefaultRendererByKey('pfp')
      pfpTokenURI.found = await ethers.provider.estimateGas(
        await openAvatarGen0Token.contract.populateTransaction.tokenURI(1)
      )
      pfpTokenURI.errorMsg = fmtErrorMsg('pfpTokenURI', pfpTokenURI.found, pfpTokenURI.expected)
      if (!pfpTokenURI.expected.eq(pfpTokenURI.found)) {
        console.error(pfpTokenURI.errorMsg)
      }
    })

    it(`Should cost ${fmtCommas(
      createLayerComposition32x32.expected.toNumber()
    )} gas to create transparent 32x32 layer composition`, async function () {
      expect(createLayerComposition32x32.found).to.eq(createLayerComposition32x32.expected)
    })

    it(`Should cost ${fmtCommas(
      renderURI.expected.toNumber()
    )} gas to renderURI for max pattern/palette for all layers`, async function () {
      expect(renderURI.found).to.eq(renderURI.expected)
    })

    it(`Should cost ${fmtCommas(
      renderURI.expected.toNumber()
    )} gas to tokenURI for max pattern/palette token (default)`, async function () {
      expect(tokenURI.found).to.eq(tokenURI.expected)
    })

    it(`Should cost ${fmtCommas(
      pfpTokenURI.expected.toNumber()
    )} gas to tokenURI for max pattern/palette token (pfp)`, async function () {
      expect(pfpTokenURI.found).to.eq(pfpTokenURI.expected)
    })
  })
})
