import { expect } from 'chai'
import { PatternDescriptor } from '../../src/core/Pattern'
import { AvatarDefinitions } from '../../src/gen0/AvatarDefinitions'
import { AvatarLayerStack } from '../../src/gen0/AvatarLayerStack'
import { DNA } from '../../src/gen0/DNA'

const ZERO_TEST_CASES: string[] = [
  DNA.ZERO.hex,
  DNA.ZERO.toString(),
  '0000000000000000000000000000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000000000000000000000000000',
]

const NONZERO_TEST_CASES: string[] = ['0x0104010404010400240105520000000000000000000000000000000000000000']

describe('DNA', function () {
  it('Should be able to create zero DNA from hex strings', function () {
    for (const hex of ZERO_TEST_CASES) {
      const dna = new DNA(hex)
      expect(dna.hex).to.equal(DNA.ZERO.hex)
      expect(dna.toString()).to.equal(DNA.ZERO.toString())
    }
  })

  it('Should be able to create non-zero DNA from hex strings', function () {
    for (const hex of NONZERO_TEST_CASES) {
      const dna = new DNA(hex)
      expect(dna.hex).to.not.equal(DNA.ZERO.hex)
      expect(dna.toString()).to.not.equal(DNA.ZERO.toString())
    }
  })

  it('Should be able to create a DNA for any valid attribute', function () {
    this.timeout(15000)
    for (const layer of AvatarLayerStack.iter()) {
      const numPatterns: number = AvatarDefinitions.getPatternCount(layer)
      for (let patternIndex = 0; patternIndex < numPatterns; patternIndex++) {
        const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, patternIndex)
        const numPalettes: number = AvatarDefinitions.getPaletteCount(pattern)
        for (let paletteIndex = 0; paletteIndex < numPalettes; paletteIndex++) {
          const properties: any = {
            [layer.name]: {
              pattern: patternIndex,
              palette: paletteIndex,
            },
          }
          for (const other of AvatarLayerStack.iter()) {
            if (other.name !== layer.name) {
              properties[other.name] = {
                pattern: 0,
                palette: 0,
              }
            }
          }
          const dna = new DNA(properties)

          // now validate the DNA's properties
          expect(
            dna.get(layer).pattern,
            `layer=${layer.name} patternIndex=${patternIndex} paletteIndex=${paletteIndex} from ${JSON.stringify(
              properties
            )}`
          ).to.equal(patternIndex)
          expect(
            dna.get(layer).palette,
            `layer=${layer.name} patternIndex=${patternIndex} paletteIndex=${paletteIndex} from ${JSON.stringify(
              properties
            )}`
          ).to.equal(paletteIndex)
          for (const other of AvatarLayerStack.iter()) {
            if (other.name !== layer.name) {
              expect(dna.get(other).pattern).to.equal(0)
              expect(dna.get(other).palette).to.equal(0)
            }
          }
        }
      }
    }
  })
})
