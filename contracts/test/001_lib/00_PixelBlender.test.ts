import { PixelBlender, RGBA } from '@openavatar/assets'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

describe('PixelBlender', function () {
  let pixelBlenderTest: Contract

  beforeEach(async function () {
    const PixelBlender = await ethers.getContractFactory('PixelBlenderTest')
    pixelBlenderTest = await PixelBlender.deploy()
    await pixelBlenderTest.deployed()
  })

  async function testBlend(base: RGBA, overlay: RGBA): Promise<void> {
    const blended: RGBA = PixelBlender.blend(base, overlay)
    expect(await pixelBlenderTest.testBlendPixel(overlay.r, base.r, overlay.a)).to.eq(blended.r)
    expect(await pixelBlenderTest.testBlendPixel(overlay.g, base.g, overlay.a)).to.eq(blended.g)
    expect(await pixelBlenderTest.testBlendPixel(overlay.b, base.b, overlay.a)).to.eq(blended.b)
    expect(await pixelBlenderTest.testBlendAlpha(overlay.a, base.a)).to.eq(blended.a)
  }

  it('should blend opaque as a full overlay', async function () {
    const base: RGBA = {
      r: 16,
      g: 16,
      b: 16,
      a: 255,
    }
    const overlay: RGBA = {
      r: 64,
      g: 64,
      b: 64,
      a: 255,
    }
    await testBlend(base, overlay)
  })

  it('should blend non-transparent with opaque and get opaque', async function () {
    const base: RGBA = {
      r: 16,
      g: 16,
      b: 16,
      a: 255,
    }
    const overlay: RGBA = {
      r: 64,
      g: 64,
      b: 64,
      a: 128,
    }
    await testBlend(base, overlay)
  })

  it('should blend semi-transparent with semi-transparent and get semi-transparent', async function () {
    const base: RGBA = {
      r: 16,
      g: 16,
      b: 16,
      a: 128,
    }
    const overlay: RGBA = {
      r: 64,
      g: 64,
      b: 64,
      a: 128,
    }
    await testBlend(base, overlay)
  })
})
