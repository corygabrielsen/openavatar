import { expect } from 'chai'
import { ColorFormat } from '../src/lib/ImageProperties'
import { PatternFile, PatternHex } from '../src/lib/PatternFile'

describe('PatternFile', function () {
  it('splitScanlines should split a pattern into scanlines of the given width', function () {
    const pattern: PatternHex = '0x0123456789abcdef'
    const expectedScanlines: PatternHex[] = ['0x0123', '0x4567', '0x89ab', '0xcdef']
    const scanlines = PatternFile.splitScanlines(pattern, 2)
    expect(scanlines).to.deep.equal(expectedScanlines)
  })

  it('joinScanlines should join scanlines into a single pattern', function () {
    const scanlines: PatternHex[] = ['0x0123', '0x4567', '0x89ab', '0xcdef']
    const expectedPattern: PatternHex = '0x0123456789abcdef'
    const pattern = PatternFile.joinScanlines(scanlines)
    expect(pattern).to.equal(expectedPattern)
  })

  it('cropPatternFile should crop a pattern file to the given width and height', function () {
    const scanlines: PatternHex[] = [
      '0x 00 01 02 03 04 05 06 07'.replace(/ /g, '') as PatternHex,
      '0x 10 11 12 13 14 15 16 17'.replace(/ /g, '') as PatternHex,
      '0x 20 21 22 23 24 25 26 27'.replace(/ /g, '') as PatternHex,
      '0x 30 31 32 33 34 35 36 37'.replace(/ /g, '') as PatternHex,
      '0x 40 41 42 43 44 45 46 47'.replace(/ /g, '') as PatternHex,
      '0x 50 51 52 53 54 55 56 57'.replace(/ /g, '') as PatternHex,
      '0x 60 61 62 63 64 65 66 67'.replace(/ /g, '') as PatternHex,
      '0x 70 71 72 73 74 75 76 77'.replace(/ /g, '') as PatternHex,
    ]
    const patternFile: PatternFile = new PatternFile(
      'layer',
      'patternName',
      0,
      {
        size: {
          width: 8,
          height: 8,
        },
        colorFormat: ColorFormat.GRAYSCALE8,
      },
      scanlines
    )

    const cropOptions = {
      x: 1, // offset from left
      y: 2, // offset from top
      width: 2,
      height: 2,
    }
    // so we should skip row 0, col 1, get the pixels at (1,2), (2,2), (1,3), (2,3)

    const croppedPatternFile = patternFile.crop(cropOptions)
    const expectedCroppedScanlines = ['0x2122', '0x3132']

    expect(croppedPatternFile.scanlines).to.deep.equal(expectedCroppedScanlines)
    expect(croppedPatternFile.imageProperties.size.width).to.equal(2)
    expect(croppedPatternFile.imageProperties.size.height).to.equal(2)
  })
})
