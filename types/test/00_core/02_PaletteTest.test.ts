import { expect } from 'chai'
import { LayerDescriptor } from '../../src/core/Layer'
import { PaletteDescriptor, PatternPaletteDescriptor, PatternPaletteDescriptorCollection } from '../../src/core/Palette'
import { PatternDescriptor } from '../../src/core/Pattern'

describe('PatternPaletteDescriptorCollection', function () {
  const LAYER_A: LayerDescriptor = { name: 'LayerA', index: 0 }
  const LAYER_B: LayerDescriptor = { name: 'LayerB', index: 1 }

  const PATTERN_A: PatternDescriptor = { layer: LAYER_A, name: 'PatternA', index: 0 }
  const PATTERN_B: PatternDescriptor = { layer: LAYER_A, name: 'PatternB', index: 1 }
  const PATTERN_C: PatternDescriptor = { layer: LAYER_B, name: 'PatternC', index: 0 }
  const PATTERN_D: PatternDescriptor = { layer: LAYER_B, name: 'PatternD', index: 1 }
  const PATTERN_E: PatternDescriptor = { layer: LAYER_B, name: 'PatternE', index: 2 }

  const PALETTE_C0_0: PaletteDescriptor = { code: 0, name: 'Palette_C0_0', index: 0 }
  const PALETTE_C1_0: PaletteDescriptor = { code: 1, name: 'Palette_C1_0', index: 0 }
  const PALETTE_C1_1: PaletteDescriptor = { code: 1, name: 'Palette_C1_1', index: 1 }
  const PALETTE_C2_0: PaletteDescriptor = { code: 2, name: 'Palette_C2_0', index: 0 }
  const PALETTE_C2_1: PaletteDescriptor = { code: 2, name: 'Palette_C2_1', index: 1 }
  const PALETTE_C3_0: PaletteDescriptor = { code: 3, name: 'Palette_C3_0', index: 0 }

  const PATTERN_A_PALETTE_C1_0: PatternPaletteDescriptor = { pattern: PATTERN_A, palette: PALETTE_C1_0 }
  const PATTERN_A_PALETTE_C1_1: PatternPaletteDescriptor = { pattern: PATTERN_A, palette: PALETTE_C1_1 }
  const PATTERN_B_PALETTE_C2_0: PatternPaletteDescriptor = { pattern: PATTERN_B, palette: PALETTE_C2_0 }
  const PATTERN_B_PALETTE_C2_1: PatternPaletteDescriptor = { pattern: PATTERN_B, palette: PALETTE_C2_1 }
  const PATTERN_C_PALETTE_C3_0: PatternPaletteDescriptor = { pattern: PATTERN_C, palette: PALETTE_C3_0 }
  const PATTERN_D_PALETTE_C3_0: PatternPaletteDescriptor = { pattern: PATTERN_D, palette: PALETTE_C3_0 }
  const PATTERN_E_PALETTE_C0_0: PatternPaletteDescriptor = { pattern: PATTERN_E, palette: PALETTE_C0_0 }

  const PATTERN_PALETTES: PatternPaletteDescriptor[] = [
    PATTERN_A_PALETTE_C1_0,
    PATTERN_A_PALETTE_C1_1,
    PATTERN_B_PALETTE_C2_0,
    PATTERN_B_PALETTE_C2_1,
    PATTERN_C_PALETTE_C3_0,
    PATTERN_D_PALETTE_C3_0,
    PATTERN_E_PALETTE_C0_0,
  ]

  class TestPatternPaletteDescriptorCollection extends PatternPaletteDescriptorCollection {
    constructor(patternPalettes: PatternPaletteDescriptor[]) {
      super(patternPalettes)
    }
  }

  let collection: TestPatternPaletteDescriptorCollection

  beforeEach(function () {
    collection = new TestPatternPaletteDescriptorCollection(PATTERN_PALETTES)
  })
  describe('constructor', function () {
    it('Should throw an error if empty palette descriptors are provided', function () {
      expect(() => new TestPatternPaletteDescriptorCollection([])).to.throw()
    })

    it('Should throw an error if missing palette code', function () {
      expect(
        () =>
          new TestPatternPaletteDescriptorCollection(
            PATTERN_PALETTES.filter((patternPalette) => patternPalette.palette.code !== 0)
          )
      ).to.throw()
      expect(
        () =>
          new TestPatternPaletteDescriptorCollection(
            PATTERN_PALETTES.filter((patternPalette) => patternPalette.palette.code !== 1)
          )
      ).to.throw()
      expect(
        () =>
          new TestPatternPaletteDescriptorCollection(
            PATTERN_PALETTES.filter((patternPalette) => patternPalette.palette.code !== 2)
          )
      ).to.throw()
    })

    it('Should throw an error if duplicate names are found in a pattern', function () {
      const duplicatePaletteName: PatternPaletteDescriptor = {
        pattern: PATTERN_A,
        palette: {
          code: 1,
          name: 'Palette_C1_0',
          index: 1,
        },
      }
      const duplicateInput: PatternPaletteDescriptor[] = [
        PATTERN_A_PALETTE_C1_0,
        PATTERN_A_PALETTE_C1_1,
        duplicatePaletteName,
      ]
      expect(() => new TestPatternPaletteDescriptorCollection(duplicateInput)).to.throw()
    })

    it('Should throw an error if duplicate indices are found in a pattern', function () {
      const duplicatePaletteIndex: PatternPaletteDescriptor = {
        pattern: PATTERN_A,
        palette: {
          code: 1,
          name: 'Palette_C1_1',
          index: 0,
        },
      }
      const duplicateInput: PatternPaletteDescriptor[] = [
        PATTERN_A_PALETTE_C1_0,
        PATTERN_A_PALETTE_C1_1,
        duplicatePaletteIndex,
      ]
      expect(() => new TestPatternPaletteDescriptorCollection(duplicateInput)).to.throw()
    })
  })

  describe('get', function () {
    it('Should retrieve palettes using pattern and name', function () {
      expect(collection.getByPattern(PATTERN_A, PALETTE_C1_0.name)).to.be.equal(PATTERN_A_PALETTE_C1_0)
      expect(collection.getByPattern(PATTERN_A, PALETTE_C1_1.name)).to.be.equal(PATTERN_A_PALETTE_C1_1)
      expect(collection.getByPattern(PATTERN_B, PALETTE_C2_0.name)).to.be.equal(PATTERN_B_PALETTE_C2_0)
      expect(collection.getByPattern(PATTERN_B, PALETTE_C2_1.name)).to.be.equal(PATTERN_B_PALETTE_C2_1)
      expect(collection.getByPattern(PATTERN_C, PALETTE_C3_0.name)).to.be.equal(PATTERN_C_PALETTE_C3_0)
      expect(collection.getByPattern(PATTERN_D, PALETTE_C3_0.name)).to.be.equal(PATTERN_D_PALETTE_C3_0)
      expect(collection.getByPattern(PATTERN_E, PALETTE_C0_0.name)).to.be.equal(PATTERN_E_PALETTE_C0_0)
    })

    it('Should retrieve palettes using pattern and index', function () {
      expect(collection.getByPattern(PATTERN_A, 0)).to.be.equal(PATTERN_A_PALETTE_C1_0)
      expect(collection.getByPattern(PATTERN_A, 1)).to.be.equal(PATTERN_A_PALETTE_C1_1)
      expect(collection.getByPattern(PATTERN_B, 0)).to.be.equal(PATTERN_B_PALETTE_C2_0)
      expect(collection.getByPattern(PATTERN_B, 1)).to.be.equal(PATTERN_B_PALETTE_C2_1)
      expect(collection.getByPattern(PATTERN_C, 0)).to.be.equal(PATTERN_C_PALETTE_C3_0)
      expect(collection.getByPattern(PATTERN_D, 0)).to.be.equal(PATTERN_D_PALETTE_C3_0)
      expect(collection.getByPattern(PATTERN_E, 0)).to.be.equal(PATTERN_E_PALETTE_C0_0)
    })

    it('Should throw an error for invalid pattern', function () {
      expect(() => collection.getByPattern({ layer: LAYER_A, name: 'Invalid', index: -1 }, 'Palette_C1_1')).to.throw()
    })
  })

  describe('getByPattern', function () {
    it('Should retrieve all palettes for a given pattern', function () {
      expect(collection.getAllByPattern(PATTERN_A)).to.be.deep.equal([PATTERN_A_PALETTE_C1_0, PATTERN_A_PALETTE_C1_1])
      expect(collection.getAllByPattern(PATTERN_B)).to.be.deep.equal([PATTERN_B_PALETTE_C2_0, PATTERN_B_PALETTE_C2_1])
      expect(collection.getAllByPattern(PATTERN_C)).to.be.deep.equal([PATTERN_C_PALETTE_C3_0])
      expect(collection.getAllByPattern(PATTERN_D)).to.be.deep.equal([PATTERN_D_PALETTE_C3_0])
      expect(collection.getAllByPattern(PATTERN_E)).to.be.deep.equal([PATTERN_E_PALETTE_C0_0])
    })

    it('Should throw an error for invalid pattern', function () {
      expect(() => collection.getAllByPattern({ layer: LAYER_A, name: 'Invalid', index: -1 })).to.throw()
    })
  })

  describe('getByCode', function () {
    it('Should retrieve all palettes for a given palette code', function () {
      expect(collection.getByCode(0)).to.be.deep.equal([PALETTE_C0_0])
      expect(collection.getByCode(1)).to.be.deep.equal([PALETTE_C1_0, PALETTE_C1_1])
      expect(collection.getByCode(2)).to.be.deep.equal([PALETTE_C2_0, PALETTE_C2_1])
      expect(collection.getByCode(3)).to.be.deep.equal([PALETTE_C3_0])
    })

    it('Should throw an error for invalid code', function () {
      expect(() => collection.getByCode(-1)).to.throw()
    })
  })

  describe('getAll', function () {
    it('Should retrieve all palettes in the collection', function () {
      expect(collection.getAll()).to.be.deep.equal(PATTERN_PALETTES)
    })

    it('Should properly sort the palettes', function () {
      const unsortedPalettes: PatternPaletteDescriptor[] = [
        PATTERN_B_PALETTE_C2_0,
        PATTERN_A_PALETTE_C1_1,
        PATTERN_E_PALETTE_C0_0,
        PATTERN_C_PALETTE_C3_0,
        PATTERN_D_PALETTE_C3_0,
        PATTERN_A_PALETTE_C1_0,
        PATTERN_B_PALETTE_C2_1,
      ]
      const sortedPalettes: PatternPaletteDescriptor[] = [
        PATTERN_A_PALETTE_C1_0,
        PATTERN_A_PALETTE_C1_1,
        PATTERN_B_PALETTE_C2_0,
        PATTERN_B_PALETTE_C2_1,
        PATTERN_C_PALETTE_C3_0,
        PATTERN_D_PALETTE_C3_0,
        PATTERN_E_PALETTE_C0_0,
      ]
      const unsortedCollection = new TestPatternPaletteDescriptorCollection(unsortedPalettes)
      expect(unsortedCollection.getAll()).to.be.deep.equal(sortedPalettes)
    })
  })
})
