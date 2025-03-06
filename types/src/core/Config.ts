import { LayerDescriptor } from './Layer'
import { PatternPaletteDescriptor } from './Palette'
import { PatternDescriptor } from './Pattern'

export type PatternName = `pattern:${string}`

export type PaletteConfig = {
  code: number
  palettes: string[]
}

export interface LayerConfig {
  layer: LayerDescriptor
  patterns: Record<PatternName, PaletteConfig>
}

// no need for prefix because it's clear at top-level
// the prefixes are mostly for organizing the source code configs
type LayerName = string

export type Config = Record<LayerName, LayerConfig>

/**
 * ConfigParser is a class that provides functionality for parsing a config object
 * into an array of LayerDescriptor objects and a map of PatternDescriptor objects
 * keyed by layer name.
 */
export class ConfigParser {
  /**
   * Parses a given config object into an array of LayerDescriptor objects.
   * @param config The config object to parse
   * @returns The array of LayerDescriptor objects
   */
  public static parseLayers(config: Config): LayerDescriptor[] {
    // INPUT:
    // {
    //   layerName: {
    //     layer: {
    //       name: <number>
    //       index: <number>
    //     },
    //     patterns: {
    //       'pattern:patternName': {
    //         'ui:uiName': {
    //           'palette:paletteName': <number>
    //         }
    //       }
    //     }
    //   }
    // }
    ConfigParser._validateNonEmpty(config, 'Cannot parse empty config')
    const layerDescriptors: LayerDescriptor[] = []
    for (const [layerName, layerConfig] of Object.entries(config)) {
      ConfigParser._validateLayerConfig(layerConfig, layerName)
      layerDescriptors.push(layerConfig.layer)
    }
    layerDescriptors.sort((a, b) => a.index - b.index)
    return layerDescriptors
  }

  /**
   * Parses a given config object into a map of PatternDescriptor objects keyed by layer name.
   * @param config The config object to parse
   * @returns The map of PatternDescriptor objects keyed by layer name
   */
  public static parsePatterns(config: Config): Record<string, PatternDescriptor[]> {
    // INPUT:
    // {
    //   layerName: {
    //     layer: {
    //       name: <number>
    //       index: <number>
    //     },
    //     patterns: {
    //       'pattern:patternName': {
    //         'palette:paletteName': <number>
    //       }
    //     }
    //   }
    // }
    ConfigParser._validateNonEmpty(config, 'Cannot parse empty config')
    const patternDescriptors: Record<string, PatternDescriptor[]> = {}
    for (const layerName in config) {
      patternDescriptors[layerName] = ConfigParser._parseLayerPatterns(config[layerName])
    }
    return patternDescriptors
  }

  /**
   * Parses a given config object into an array of palettes.
   * @param config The config object to parse
   * @returns The map of PatternDescriptor array
   */
  public static parsePalettes(config: Config): PatternPaletteDescriptor[] {
    // INPUT:
    // {
    //   layerName: {
    //     layer: {
    //       name: <number>
    //       index: <number>
    //     },
    //     patterns: {
    //       'pattern:patternName': {
    //         'palette:paletteName': <number>
    //       }
    //     }
    //   }
    // }
    ConfigParser._validateNonEmpty(config, 'Cannot parse empty config')

    const palettes: PatternPaletteDescriptor[] = []
    for (const layerName in config) {
      const layerConfig: LayerConfig = config[layerName]
      ConfigParser._validateLayerConfig(layerConfig, layerName)

      // loop over patterns
      let patternIndex = 0
      for (const [patternKey, paletteConfig] of Object.entries(layerConfig.patterns)) {
        const patternName = patternKey.replace('pattern:', '')
        const pattern = {
          layer: layerConfig.layer,
          name: patternName,
          index: patternIndex++,
        }

        // loop over palettes
        for (let i = 0; i < paletteConfig.palettes.length; i++) {
          const paletteName = paletteConfig.palettes[i]
          palettes.push({
            pattern,
            palette: { code: paletteConfig.code, name: paletteName, index: i },
          })
        }
      }
    }
    palettes.sort((a, b) => {
      if (a.pattern.layer.index === b.pattern.layer.index) {
        if (a.pattern.index === b.pattern.index) {
          // CASE 1 - same layer, same pattern, different palette
          return a.palette.index - b.palette.index
        }
        // CASE 2 - same layer, different pattern
        return a.pattern.index - b.pattern.index
      }
      // CASE 3 - different layer
      return a.pattern.layer.index - b.pattern.layer.index
    })
    return palettes
  }

  private static _parseLayerPatterns(layerConfig: LayerConfig): PatternDescriptor[] {
    // INPUT:
    // {
    //   layer: {
    //     name: <number>
    //     index: <number>
    //   },
    //   patterns: {
    //     'pattern:patternName': {
    //       'ui:uiName': {
    //         'palette:paletteName': <number>
    //       }
    //     }
    //   }
    // }
    ConfigParser._validateLayerConfig(layerConfig)

    const layer: LayerDescriptor = layerConfig.layer
    const patternDescriptors: PatternDescriptor[] = []
    // loop over each { 'pattern:patternName': { 'ui:uiName': { 'palette:paletteName': <number> } } }
    let patternIndex = 0
    for (const key of Object.keys(layerConfig.patterns)) {
      const patternName: string = key.replace('pattern:', '')
      ConfigParser._validateNonEmpty(patternName, `layer config patterns[${patternIndex}] pattern cannot be blank`)

      const patternDescriptor: PatternDescriptor = {
        layer,
        name: patternName,
        index: patternIndex++,
      }
      patternDescriptors.push(patternDescriptor)
    }
    patternDescriptors.sort((a, b) => a.index - b.index)
    return patternDescriptors
  }

  /**
   * Validates that the given layer name matches the layer descriptor name.
   * @param layerName The layer name to validate
   * @param layer The layer descriptor to validate
   * @throws Error if the layer name does not match the layer descriptor name
   */
  private static _validateLayerName(layerName: string, layer: LayerDescriptor) {
    // should match layerName
    if (layer.name !== layerName) {
      throw new Error(`Layer name "${layerName}" does not match configured layer descriptor name: "${layer.name}"`)
    }
  }

  /**
   * Validates that the given object is not undefined.
   * @param config The object to validate
   * @throws Error if the object is undefined.
   */
  private static _validateNotUndefined(val: object, msg: string) {
    if (val === undefined) {
      throw new Error(msg)
    }
  }

  /**
   * Validates that the given string or object is not empty.
   * @param config The string or object to validate
   * @throws Error if the string or object is empty
   */
  private static _validateNonEmpty(val: Config | LayerConfig | string | object, msg: string) {
    if (typeof val === 'string' && val.length === 0) {
      throw new Error(msg)
    } else if (Object.keys(val).length === 0) {
      throw new Error(msg)
    }
  }

  /**
   * Validates that the given layer config is valid.
   * @param layerConfig The layer config to validate
   * @throws Error if the layer config is invalid
   */
  private static _validateLayerConfig(layerConfig: LayerConfig, layerName?: string) {
    ConfigParser._validateNonEmpty(layerConfig, 'Layer config is empty')
    ConfigParser._validateNotUndefined(layerConfig.layer, 'Layer config layer is undefined')
    ConfigParser._validateNotUndefined(layerConfig.patterns, 'Layer config patterns is undefined')
    ConfigParser._validateNonEmpty(layerConfig.patterns, 'Layer config patterns is empty')
    if (layerName !== undefined) {
      ConfigParser._validateLayerName(layerName, layerConfig.layer)
    }
  }
}
