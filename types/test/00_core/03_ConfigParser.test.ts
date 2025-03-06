import { expect } from 'chai'
import { Config, ConfigParser, LayerConfig } from '../../src/core/Config'
import { LayerDescriptor } from '../../src/core/Layer'
import { PatternPaletteDescriptor } from '../../src/core/Palette'
import { PatternDescriptor } from '../../src/core/Pattern'

describe('ConfigParser', function () {
  const layer10Config: LayerConfig = {
    layer: {
      name: 'layer10',
      index: 10,
    },
    patterns: {
      'pattern:pattern10_0': {
        code: 0,
        palettes: ['palette10_0_0'],
      },
      'pattern:pattern10_1': {
        code: 1,
        palettes: ['palette10_1_0'],
      },
    },
  }
  const layer20Config: LayerConfig = {
    layer: {
      name: 'layer20',
      index: 20,
    },
    patterns: {
      'pattern:pattern20_0': {
        code: 0,
        palettes: ['palette20_0_0', 'palette20_0_1', 'palette20_0_2'],
      },
    },
  }

  let config: Config = {}

  beforeEach(function () {
    config = {
      [layer10Config.layer.name]: layer10Config,
      [layer20Config.layer.name]: layer20Config,
    }
  })

  describe('parseLayers()', function () {
    it('Should return an array of LayerDescriptor objects', function () {
      // eslint-disable-next-line no-undef
      const layers: LayerDescriptor[] = ConfigParser.parseLayers(config)

      expect(layers).to.be.an('array')
      expect(layers).to.have.lengthOf(2)

      expect(layers[0]).to.deep.equal({
        name: 'layer10',
        index: 10,
      })
      expect(layers[1]).to.deep.equal({
        name: 'layer20',
        index: 20,
      })
    })
    it('Should throw an error if no layers are defined', function () {
      expect(() => ConfigParser.parseLayers({})).to.throw()
    })
    it('Should error if layer descriptor name doesnt match key name in config', function () {
      const badConfig: Config = {
        [layer10Config.layer.name + 'bad']: layer10Config,
      }
      expect(() => ConfigParser.parseLayers(badConfig)).to.throw()
    })
    it('Should throw an error if a layer has empty patterns', function () {
      const badConfig: Config = {
        [layer10Config.layer.name]: {
          layer: layer10Config.layer,
          patterns: {},
        },
      }
      expect(() => ConfigParser.parseLayers(badConfig)).to.throw()
    })
  })

  describe('parsePatterns()', function () {
    it('Should return an array of PatternDescriptor objects for a given layer name', function () {
      const patterns: Record<string, PatternDescriptor[]> = ConfigParser.parsePatterns(config)

      // should have two layers
      expect(patterns).to.be.an('object')
      expect(Object.keys(patterns)).to.have.lengthOf(2)

      // layer10 should have two patterns
      expect(patterns.layer10).to.be.an('array')
      expect(patterns.layer10).to.have.lengthOf(2)
      // should be correct layer descriptor
      for (const pattern of patterns.layer10) {
        expect(pattern.layer).to.deep.equal({
          name: 'layer10',
          index: 10,
        })
      }
    })
  })

  describe('parsePalettes()', function () {
    it('Should return an array of PatternPaletteDescriptor objects for a given layer name', function () {
      const palettes: PatternPaletteDescriptor[] = ConfigParser.parsePalettes(config)

      // should have two layers
      expect(palettes).to.be.an('array')
      expect(palettes).to.have.lengthOf(5)

      // layer10 should have two patterns
      expect(palettes[0]).to.deep.equal({
        pattern: {
          layer: {
            name: 'layer10',
            index: 10,
          },
          name: 'pattern10_0',
          index: 0,
        },
        palette: {
          code: 0,
          name: 'palette10_0_0',
          index: 0,
        },
      })
      expect(palettes[1]).to.deep.equal({
        pattern: {
          layer: {
            name: 'layer10',
            index: 10,
          },
          name: 'pattern10_1',
          index: 1,
        },
        palette: {
          code: 1,
          name: 'palette10_1_0',
          index: 0,
        },
      })
      // layer20 should have one pattern with three palettes
      expect(palettes[2]).to.deep.equal({
        pattern: {
          layer: {
            name: 'layer20',
            index: 20,
          },
          name: 'pattern20_0',
          index: 0,
        },
        palette: {
          code: 0,
          name: 'palette20_0_0',
          index: 0,
        },
      })
      expect(palettes[3]).to.deep.equal({
        pattern: {
          layer: {
            name: 'layer20',
            index: 20,
          },
          name: 'pattern20_0',
          index: 0,
        },
        palette: {
          code: 0,
          name: 'palette20_0_1',
          index: 1,
        },
      })
      expect(palettes[4]).to.deep.equal({
        pattern: {
          layer: {
            name: 'layer20',
            index: 20,
          },
          name: 'pattern20_0',
          index: 0,
        },
        palette: {
          code: 0,
          name: 'palette20_0_2',
          index: 2,
        },
      })
    })
  })

  it('Should properly sort an unsorted config', function () {
    const unsortedConfig: Config = {
      [layer20Config.layer.name]: layer20Config,
      [layer10Config.layer.name]: layer10Config,
    }
    const palettes: PatternPaletteDescriptor[] = ConfigParser.parsePalettes(unsortedConfig)

    // should have two layers
    expect(palettes).to.be.an('array')
    expect(palettes).to.have.lengthOf(5)

    // layer10 should have two patterns
    expect(palettes[0]).to.deep.equal({
      pattern: {
        layer: {
          name: 'layer10',
          index: 10,
        },
        name: 'pattern10_0',
        index: 0,
      },
      palette: {
        code: 0,
        name: 'palette10_0_0',
        index: 0,
      },
    })
    expect(palettes[1]).to.deep.equal({
      pattern: {
        layer: {
          name: 'layer10',
          index: 10,
        },
        name: 'pattern10_1',
        index: 1,
      },
      palette: {
        code: 1,
        name: 'palette10_1_0',
        index: 0,
      },
    })
    // layer20 should have one pattern with three palettes
    expect(palettes[2]).to.deep.equal({
      pattern: {
        layer: {
          name: 'layer20',
          index: 20,
        },
        name: 'pattern20_0',
        index: 0,
      },
      palette: {
        code: 0,
        name: 'palette20_0_0',
        index: 0,
      },
    })
    expect(palettes[3]).to.deep.equal({
      pattern: {
        layer: {
          name: 'layer20',
          index: 20,
        },
        name: 'pattern20_0',
        index: 0,
      },
      palette: {
        code: 0,
        name: 'palette20_0_1',
        index: 1,
      },
    })
    expect(palettes[4]).to.deep.equal({
      pattern: {
        layer: {
          name: 'layer20',
          index: 20,
        },
        name: 'pattern20_0',
        index: 0,
      },
      palette: {
        code: 0,
        name: 'palette20_0_2',
        index: 2,
      },
    })
  })
})
