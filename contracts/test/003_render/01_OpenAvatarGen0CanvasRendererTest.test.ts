import {
  AvatarDefinitions,
  AvatarLayerStack,
  AvatarPose,
  DNA,
  PatternDescriptor,
  PatternPaletteDescriptor,
} from '@openavatar/types'
import { expect } from 'chai'
import { Contract } from 'ethers'
import hre, { ethers } from 'hardhat'
import { GasParams } from '../../src/client/GasParams'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { PaletteUploader } from '../../src/upload/PaletteUploader'
import { PatternUploader } from '../../src/upload/PatternUploader'
import { TestHelper } from '../TestHelper'
import { mkTestDirs } from '../utils'

describe('OpenAvatarGen0CanvasRenderer', function () {
  let wrapper: OpenAvatarGen0Renderer
  let contract: Contract

  let zeroResult: string

  async function renderUriZero(): Promise<string> {
    if (!zeroResult) {
      zeroResult = await contract.renderURI(DNA.ZERO.buffer)
    }
    return zeroResult
  }

  before(async function () {
    mkTestDirs()

    const openAvatarGen0Assets: OpenAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    const pose: AvatarPose = AvatarDefinitions.getPose(0)
    await openAvatarGen0Assets.addCanvas({ id: pose.canvasId, width: 32, height: 32 })
    await openAvatarGen0Assets.addLayers(
      pose.canvasId,
      [...AvatarLayerStack.iter()].map((layer) => layer.index)
    )
    await new PaletteUploader(hre, openAvatarGen0Assets, {} as GasParams, { logging: false }).uploadAllTestOnly()
    await new PatternUploader(hre, openAvatarGen0Assets, {} as GasParams, { logging: false }).uploadAllTestOnly(pose)
    wrapper = await TestHelper.initOpenAvatarGen0CanvasRenderer(ethers, openAvatarGen0Assets, pose)
    contract = wrapper.contract
  })

  it(`Should render different inputs as different PNGs`, async function () {
    // upload a new pattern
    const layer = AvatarLayerStack.bottomLayer

    const uri0: string = await renderUriZero()
    expect(uri0.startsWith('data:image/svg+xml;base64,')).to.be.true

    const uri1: string = await contract.renderURI(DNA.ZERO.replace({ [layer.name]: { pattern: 1 } }).buffer)
    expect(uri1.startsWith('data:image/svg+xml;base64,')).to.be.true

    expect(uri0).to.not.equal(uri1)
  })

  it(`Should render 0x00FF...00FF same as 0x0000...0000`, async function () {
    expect(await contract.renderURI(Buffer.from('00FF'.repeat(16), 'hex'))).to.equal(await renderUriZero())
  })

  it(`Should render 0x01FF...00FF same as 0x0000...0000`, async function () {
    expect(await contract.renderURI(Buffer.from('01FF'.repeat(8) + '00FF'.repeat(8), 'hex'))).to.equal(
      await renderUriZero()
    )
  })

  it(`Should render 0xFF00...FF00 same as 0x0000...0000`, async function () {
    expect(await contract.renderURI(Buffer.from('FF00'.repeat(16), 'hex'))).to.equal(await renderUriZero())
  })

  it(`Should render 0xFF01...FF01 same as 0x0000...0000`, async function () {
    expect(await contract.renderURI(Buffer.from('FF01'.repeat(16), 'hex'))).to.equal(await renderUriZero())
  })

  it(`Should render 0xFFFF...FFFF same as 0x0000...0000`, async function () {
    expect(await contract.renderURI(Buffer.from('FFFF'.repeat(16), 'hex'))).to.equal(await renderUriZero())
  })

  let dna: DNA = DNA.ZERO
  for (const layer of AvatarLayerStack.iter()) {
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip(`Should properly render max pattern/palette for layer ${layer.name}`, async function () {
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

      const uri: string = await contract.renderURI(dna.buffer)
      const svgUriPrefix = 'data:image/svg+xml;base64,'
      expect(uri.startsWith(svgUriPrefix)).to.be.true
      const svg = Buffer.from(uri.slice(svgUriPrefix.length), 'base64').toString('utf8')

      const svgRegex =
        /^<svg version="1\.1" xmlns="http:\/\/www.w3.org\/2000\/svg" xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink" class="openavatar" width="100%" height="100%" viewbox="0 0 (\d+) (\d+)">[\s\S]*<\/svg>$/
      const svgMatch = svgRegex.exec(svg)
      expect(svgMatch, 'Invalid SVG tag').to.not.be.null

      const foreignObjectRegex = /<foreignObject width="(\d+)" height="(\d+)">[\s\S]*<\/foreignObject>/
      const foreignObjectMatch = foreignObjectRegex.exec(svg)
      expect(foreignObjectMatch, 'Invalid foreignObject tag').to.not.be.null
      expect(foreignObjectMatch![1], 'foreignObject width mismatch').to.equal(svgMatch![1])
      expect(foreignObjectMatch![2], 'foreignObject height mismatch').to.equal(svgMatch![2])

      const imgRegex =
        /<img xmlns="http:\/\/www.w3.org\/1999\/xhtml" width="(\d+)" height="(\d+)" style="image-rendering: pixelated;" src="data:image\/png;base64,([^"]+)"\/>/
      const imgMatch = imgRegex.exec(svg)
      expect(imgMatch, 'Invalid img tag').to.not.be.null
      expect(imgMatch![1], 'img width mismatch').to.equal(svgMatch![1])
      expect(imgMatch![2], 'img height mismatch').to.equal(svgMatch![2])
    })
  }
})
