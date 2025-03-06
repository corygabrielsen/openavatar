import { expect } from 'chai'
import { LayerDescriptor, LayerDescriptorStack } from '../../src/core/Layer'

describe('LayerDescriptorStack', function () {
  // Test data
  const layerDescriptors: LayerDescriptor[] = [
    { name: 'background', index: 0 },
    { name: 'midground', index: 10 },
    { name: 'foreground', index: 23 },
  ]

  class TestLayerDescriptorStack extends LayerDescriptorStack {
    constructor(layers: LayerDescriptor[]) {
      super(layers)
    }
  }

  // Constructor tests
  describe('Constructor', function () {
    it('Should create a LayerDescriptorStack instance with valid layer descriptors', function () {
      const layerStack = new TestLayerDescriptorStack(layerDescriptors)
      expect(layerStack).to.be.instanceOf(LayerDescriptorStack)
    })

    it('Should throw an error if empty layer descriptors are provided', function () {
      expect(() => new TestLayerDescriptorStack([])).to.throw()
    })

    it('Should throw an error if there are duplicate layer indices', function () {
      const invalidLayers = [
        { name: 'background', index: 0 },
        { name: 'midground', index: 0 },
        { name: 'foreground', index: 2 },
      ]
      expect(() => new TestLayerDescriptorStack(invalidLayers)).to.throw(Error, 'Duplicate layer index: 0')
    })

    it('Should throw an error if there are duplicate layer names', function () {
      const invalidLayers = [
        { name: 'background', index: 0 },
        { name: 'midground', index: 1 },
        { name: 'midground', index: 2 },
      ]
      expect(() => new TestLayerDescriptorStack(invalidLayers)).to.throw(Error, 'Duplicate layer name: midground')
    })
  })

  // Getter tests
  describe('Getter', function () {
    const layerStack = new TestLayerDescriptorStack(layerDescriptors)

    it('Should get a layer by name', function () {
      expect(layerStack.get('midground')).to.deep.equal({ name: 'midground', index: 10 })
    })

    it('Should get a layer by index', function () {
      expect(layerStack.get(23)).to.deep.equal({ name: 'foreground', index: 23 })
    })

    it('Should throw an error if an invalid layer name is passed', function () {
      expect(() => layerStack.get('invalid')).to.throw(Error, 'Invalid layer reference: invalid')
    })

    it('Should throw an error if an invalid layer index is passed', function () {
      expect(() => layerStack.get(3)).to.throw(Error, 'Invalid layer reference: 3')
    })

    it('Should get the bottom layer', function () {
      expect(layerStack.bottomLayer).to.deep.equal({ name: 'background', index: 0 })
    })

    it('Should get the top layer', function () {
      expect(layerStack.topLayer).to.deep.equal({ name: 'foreground', index: 23 })
    })
  })

  // Tests for methods
  describe('Methods', function () {
    let layerStack: TestLayerDescriptorStack

    beforeEach(function () {
      layerStack = new TestLayerDescriptorStack(layerDescriptors)
    })

    describe('get', function () {
      it('Should return the layer descriptor for a valid layer name', function () {
        expect(layerStack.get('background')).to.deep.equal({ name: 'background', index: 0 })
        expect(layerStack.get('midground')).to.deep.equal({ name: 'midground', index: 10 })
        expect(layerStack.get('foreground')).to.deep.equal({ name: 'foreground', index: 23 })
      })

      it('Should return the layer descriptor for a valid layer index', function () {
        expect(layerStack.get(0)).to.deep.equal({ name: 'background', index: 0 })
        expect(layerStack.get(10)).to.deep.equal({ name: 'midground', index: 10 })
        expect(layerStack.get(23)).to.deep.equal({ name: 'foreground', index: 23 })
      })

      it('Should throw an error for an invalid layer reference', function () {
        expect(() => layerStack.get('invalid')).to.throw('Invalid layer reference: invalid')
      })
    })

    describe('iter', function () {
      it('Should return an iterator that yields all layers in order', function () {
        const expectedLayers = layerDescriptors
        const actualLayers = [...layerStack.iter()]
        expect(actualLayers).to.deep.equal(expectedLayers)
      })
    })

    describe('map', function () {
      it('Should apply the given function to each layer and return an array of results', function () {
        const layerNames = layerStack.map((layer) => layer.name)
        expect(layerNames).to.deep.equal(['background', 'midground', 'foreground'])
      })
    })

    describe('filter', function () {
      it('Should return an array of layers that satisfy the given predicate', function () {
        const filteredLayers = layerStack.filter((layer) => layer.index % 2 === 0)
        expect(filteredLayers).to.deep.equal([
          { name: 'background', index: 0 },
          { name: 'midground', index: 10 },
        ])
      })
    })

    describe('reduce', function () {
      it('Should apply the given function to each layer and return a single result', function () {
        const layerNames = layerStack.reduce<string[]>((accumulator, layer) => [...accumulator, layer.name], [])
        expect(layerNames).to.deep.equal(['background', 'midground', 'foreground'])
      })
    })

    describe('bottomLayer', function () {
      it('Should return the layer with the smallest index', function () {
        expect(layerStack.bottomLayer).to.deep.equal({ name: 'background', index: 0 })
      })
    })

    describe('topLayer', function () {
      it('Should return the layer with the largest index', function () {
        expect(layerStack.topLayer).to.deep.equal({ name: 'foreground', index: 23 })
      })
    })
  })

  describe('Unsorted layers', function () {
    it('Should create a LayerDescriptorStack instance with out of order layer descriptors', function () {
      const layerStack = new TestLayerDescriptorStack([layerDescriptors[1], layerDescriptors[0], layerDescriptors[2]])
      expect(layerStack).to.be.instanceOf(LayerDescriptorStack)
      expect(layerStack.get('background')).to.deep.equal({ name: 'background', index: 0 })
      expect(layerStack.get('midground')).to.deep.equal({ name: 'midground', index: 10 })
      expect(layerStack.get('foreground')).to.deep.equal({ name: 'foreground', index: 23 })
      expect(layerStack.bottomLayer).to.deep.equal({ name: 'background', index: 0 })
      expect(layerStack.topLayer).to.deep.equal({ name: 'foreground', index: 23 })
      expect(layerStack.get(0)).to.deep.equal({ name: 'background', index: 0 })
      expect(layerStack.get(10)).to.deep.equal({ name: 'midground', index: 10 })
      expect(layerStack.get(23)).to.deep.equal({ name: 'foreground', index: 23 })
    })
  })
})
