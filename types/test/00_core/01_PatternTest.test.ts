import { expect } from 'chai'
import { LayerDescriptor } from '../../src/core/Layer'
import { PatternDescriptor, PatternDescriptorCollection } from '../../src/core/Pattern'

describe('PatternDescriptorCollection', function () {
  // Define some test data
  const layer1: LayerDescriptor = { name: 'Layer 1', index: 0 }
  const layer2: LayerDescriptor = { name: 'Layer 2', index: 1 }
  const patternDescriptors: PatternDescriptor[] = [
    { layer: layer1, name: 'Pattern 1', index: 0 },
    { layer: layer1, name: 'Pattern 2', index: 1 },
    { layer: layer2, name: 'Pattern 3', index: 0 },
    { layer: layer2, name: 'Pattern 4', index: 1 },
    { layer: layer2, name: 'Pattern 5', index: 2 },
  ]

  class TestPatternDescriptorCollection extends PatternDescriptorCollection {
    constructor(patternDescriptors: PatternDescriptor[]) {
      super(patternDescriptors)
    }
  }
  const patternCollection = new TestPatternDescriptorCollection(patternDescriptors)

  describe('constructor()', function () {
    it('Should not throw an error when given a valid set of pattern descriptors', function () {
      expect(() => new TestPatternDescriptorCollection(patternDescriptors)).not.to.throw()
    })

    it('Should throw an error if empty pattern descriptors are provided', function () {
      expect(() => new TestPatternDescriptorCollection([])).to.throw()
    })

    it('Should throw an error when given pattern descriptors with duplicate names in the same layer', function () {
      const invalidDescriptors: PatternDescriptor[] = [
        { layer: layer1, name: 'Pattern 1', index: 0 },
        { layer: layer1, name: 'Pattern 1', index: 1 },
      ]
      expect(() => new TestPatternDescriptorCollection(invalidDescriptors)).to.throw(
        'Duplicate pattern name within layer: Pattern 1'
      )
    })

    it('Should throw an error when given pattern descriptors with duplicate indices in the same layer', function () {
      const invalidDescriptors: PatternDescriptor[] = [
        { layer: layer1, name: 'Pattern 1', index: 0 },
        { layer: layer1, name: 'Pattern 2', index: 0 },
      ]
      expect(() => new TestPatternDescriptorCollection(invalidDescriptors)).to.throw(
        'Duplicate pattern index within layer: 0'
      )
    })
  })

  describe('get()', function () {
    it('Should get a pattern by layer and name', function () {
      const pattern1 = patternCollection.get(layer1, 'Pattern 1')
      expect(pattern1).to.deep.equal({ layer: layer1, name: 'Pattern 1', index: 0 })
      // should be no bug with creating a new object and using that
      const pattern2 = patternCollection.get({ name: 'Layer 1', index: 0 }, 'Pattern 1')
      expect(pattern2).to.deep.equal({ layer: layer1, name: 'Pattern 1', index: 0 })
    })

    it('Should get a pattern by layer and index', function () {
      const pattern = patternCollection.get(layer2, 1)
      expect(pattern).to.deep.equal({ layer: layer2, name: 'Pattern 4', index: 1 })
    })

    it('Should throw an error for invalid layer references', function () {
      expect(() => patternCollection.get({ name: 'Layer 3', index: 2 }, 'Pattern 1')).to.throw()
    })

    it('Should throw an error for invalid pattern references', function () {
      expect(() => patternCollection.get(layer1, 'Pattern 3')).to.throw()
      expect(() => patternCollection.get(layer2, 3)).to.throw()
    })
  })

  describe('iter()', function () {
    it('Should iterate over all patterns', function () {
      const expectedPatterns = [
        { layer: layer1, name: 'Pattern 1', index: 0 },
        { layer: layer1, name: 'Pattern 2', index: 1 },
        { layer: layer2, name: 'Pattern 3', index: 0 },
        { layer: layer2, name: 'Pattern 4', index: 1 },
        { layer: layer2, name: 'Pattern 5', index: 2 },
      ]
      const iteratedPatterns = Array.from(patternCollection.iter())
      expect(iteratedPatterns).to.deep.equal(expectedPatterns)
    })
  })

  describe('map()', function () {
    it('Should map patterns to a new array', function () {
      const mappedPatterns = patternCollection.map((pattern) => pattern.name)
      expect(mappedPatterns).to.deep.equal(['Pattern 1', 'Pattern 2', 'Pattern 3', 'Pattern 4', 'Pattern 5'])
    })
  })

  describe('filter()', function () {
    it('Should filter patterns based on a predicate', function () {
      const filteredPatterns = patternCollection.filter((pattern) => pattern.layer === layer1)
      expect(filteredPatterns).to.deep.equal([
        { layer: layer1, name: 'Pattern 1', index: 0 },
        { layer: layer1, name: 'Pattern 2', index: 1 },
      ])
    })
  })

  describe('reduce()', function () {
    it('Should apply the reduce function', function () {
      const result = patternCollection.reduce((accumulator, pattern) => {
        if (pattern.layer === layer2) {
          accumulator += pattern.index
        }
        return accumulator
      }, 0)
      expect(result).to.equal(3)
    })
  })
})
