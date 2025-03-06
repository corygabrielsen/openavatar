import { expect } from 'chai'
import { LayerDescriptor } from '../../src/core/Layer'
import { AvatarLayerStack } from '../../src/gen0/AvatarLayerStack'

const LAYERS = [...AvatarLayerStack.iter()]

const EXPECTED_INDEXES: Record<string, number> = {
  body: 10,
  tattoos: 20,
  makeup: 30,
  left_eye: 40,
  right_eye: 50,
  bottomwear: 60,
  footwear: 70,
  topwear: 80,
  handwear: 90,
  outerwear: 100,
  jewelry: 110,
  facial_hair: 120,
  facewear: 130,
  eyewear: 140,
  hair: 150,
}

const EXPECTED_BOTTOM_LAYER = 'body'
const EXPECTED_TOP_LAYER = 'hair'

describe('AvatarLayerStack', function () {
  function expectLayerDescriptor(params: { expected: LayerDescriptor; actual: LayerDescriptor }) {
    expect(params.actual.name).to.be.a('string')
    expect(params.actual.index).to.be.a('number')
    expect(params.actual.name).to.equal(params.expected.name)
    expect(params.actual.index).to.equal(params.expected.index)
  }

  function testLayer(key: string | number, expected: LayerDescriptor) {
    const layer: LayerDescriptor = AvatarLayerStack.get(key)
    expectLayerDescriptor({ expected, actual: layer })
  }

  it('Should throw an error for invalid layer reference', function () {
    expect(() => AvatarLayerStack.get('invalid')).to.throw()
    expect(() => AvatarLayerStack.get(999)).to.throw()
  })

  it(`Should define ${Object.values(EXPECTED_INDEXES).length} unique layers`, function () {
    expect([...AvatarLayerStack.iter()]).to.have.lengthOf(Object.values(EXPECTED_INDEXES).length)
  })

  it(`Should return ${EXPECTED_TOP_LAYER} layer for topLayer`, function () {
    expectLayerDescriptor({
      expected: { name: EXPECTED_TOP_LAYER, index: EXPECTED_INDEXES[EXPECTED_TOP_LAYER] },
      actual: AvatarLayerStack.topLayer,
    })
  })

  it(`Should return ${EXPECTED_BOTTOM_LAYER} layer for bottomLayer`, function () {
    expectLayerDescriptor({
      expected: { name: EXPECTED_BOTTOM_LAYER, index: EXPECTED_INDEXES[EXPECTED_BOTTOM_LAYER] },
      actual: AvatarLayerStack.bottomLayer,
    })
  })

  for (const layer of LAYERS) {
    it(`Should properly define layer ${layer.name}`, function () {
      const expected = { name: layer.name, index: EXPECTED_INDEXES[layer.name] }
      testLayer(layer.name, expected)
      testLayer(EXPECTED_INDEXES[layer.name], expected)
    })
  }

  function testName(layer: LayerDescriptor) {
    return `Getters for layer ${layer.name} should return correct name and index`
  }

  for (const layer of LAYERS) {
    it(testName(layer), function () {
      expectLayerDescriptor({ expected: { name: layer.name, index: EXPECTED_INDEXES[layer.name] }, actual: layer })
    })
  }
})
