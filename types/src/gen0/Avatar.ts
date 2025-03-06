import { LayerDescriptor } from '../core/Layer'
import { PatternPaletteDescriptor } from '../core/Palette'
import { AvatarDefinitions } from './AvatarDefinitions'
import { AvatarLayerStack } from './AvatarLayerStack'
import { DNA } from './DNA'

export interface PatternPaletteNames {
  patternName: string
  paletteName: string
}

export interface AvatarPatternPaletteNames {
  [key: string]: PatternPaletteNames
}

export type PatternPaletteLike = {
  patternName: string
  paletteName?: string
  paletteLike?: RegExp
}

export interface AvatarBuilder {
  [key: string]: PatternPaletteLike
}

export type PatternPaletteShortHand = [string, string | RegExp]

export interface AvatarBuilderShortHand {
  [key: string]: PatternPaletteShortHand | PatternPaletteLike
}

export type AvatarDictLike = AvatarPatternPaletteNames | AvatarBuilder | AvatarBuilderShortHand

export type AvatarLike = DNA | AvatarDictLike

function defaultNames(layer: LayerDescriptor): PatternPaletteNames {
  if (layer.name === AvatarLayerStack.hair.name) {
    return {
      patternName: 'bald',
      paletteName: 'transparent',
    }
  } else if (layer.name === AvatarLayerStack.bottomwear.name || layer.name === AvatarLayerStack.topwear.name) {
    return {
      patternName: 'naked',
      paletteName: 'transparent',
    }
  } else {
    return {
      patternName: 'none',
      paletteName: 'transparent',
    }
  }
}

export class Avatar {
  dna: DNA

  layers: Record<string, PatternPaletteDescriptor> = {}

  constructor(input: AvatarLike) {
    if (input instanceof DNA) {
      this.layers = Avatar._layersFromDNA(input)
      this.dna = input
    } else {
      const handleEyes: AvatarDictLike = Avatar._acquiesce_layers(input)
      const builder: AvatarBuilder = Avatar._acquiesce_shortHand(handleEyes)
      const properties: AvatarPatternPaletteNames = Avatar._acquiesce(builder)
      this.layers = Avatar._layersFromProperties(properties)
      this.dna = Avatar._layersToDNA(this.layers)

      // sanity check creating a new Avatar from the DNA should equal this avatar
      const dnaAvatar = new Avatar(this.dna)
      if (!this.equals(dnaAvatar)) {
        throw new Error('Avatar DNA mismatch')
      }
    }
  }

  private static _acquiesce_layers(obj: AvatarDictLike): AvatarDictLike {
    const layers: AvatarDictLike = {}

    for (const key of Object.keys(obj)) {
      const value = obj[key]
      if (key === 'eyes') {
        layers['left_eye'] = value
        layers['right_eye'] = value
      } else {
        layers[key] = value
      }
    }
    return layers
  }

  private static _acquiesce_shortHand(obj: AvatarBuilder | AvatarPatternPaletteNames | AvatarBuilderShortHand): AvatarBuilder {
    const builder: AvatarBuilder = {}

    // check each layer for a short hand
    for (const layer of AvatarLayerStack.iter()) {
      const entry: PatternPaletteShortHand | PatternPaletteLike | undefined = obj[layer.name]
      // each layer is optional
      if (entry === undefined) {
        continue
      }

      if (!Array.isArray(entry)) {
        // not shorthand, can pass along
        builder[layer.name] = entry
      } else {
        // shorthand entry that needs to be converted into a PatternPaletteLike
        const patternName: string = entry[0]
        const paletteNameOrLike: string | RegExp = entry[1]
        if (typeof paletteNameOrLike === 'string') {
          builder[layer.name] = {
            patternName,
            paletteName: paletteNameOrLike,
          }
        } else {
          builder[layer.name] = {
            patternName,
            paletteLike: paletteNameOrLike,
          }
        }
      }
    }
    return builder
  }

  private static _acquiesce(obj: AvatarBuilder | AvatarPatternPaletteNames): AvatarPatternPaletteNames {
    const properties: AvatarPatternPaletteNames = {}

    for (const layer of AvatarLayerStack.iter()) {
      const entry = obj[layer.name] as AvatarBuilder[keyof AvatarBuilder]
      let patternPaletteNames: PatternPaletteNames

      if (entry) {
        let { patternName, paletteName, paletteLike } = entry

        // if paletteName is not defined, try to find palette using paletteLike
        if (!paletteName && paletteLike) {
          const foundPalette = AvatarDefinitions.findPatternPalette(layer, patternName, paletteLike)
          paletteName = foundPalette ? foundPalette.palette.name : undefined
        }

        patternPaletteNames = {
          patternName: patternName || defaultNames(layer).patternName,
          paletteName: paletteName || defaultNames(layer).paletteName,
        }
      } else {
        patternPaletteNames = defaultNames(layer)
      }

      properties[layer.name] = patternPaletteNames
    }

    return properties
  }

  private static _layersToDNA(layers: Record<string, PatternPaletteDescriptor>): DNA {
    const dnaInput: Record<
      string,
      {
        pattern: number
        palette: number
      }
    > = {}
    for (const layer of AvatarLayerStack.iter()) {
      dnaInput[layer.name] = {
        pattern: layers[layer.name].pattern.index,
        palette: layers[layer.name].palette.index,
      }
    }
    return new DNA(dnaInput)
  }

  private static _layersFromDNA(dna: DNA): Record<string, PatternPaletteDescriptor> {
    const layers: Record<string, PatternPaletteDescriptor> = {}
    for (const layer of AvatarLayerStack.iter()) {
      layers[layer.name] = AvatarDefinitions.getPatternPalette(layer, dna.get(layer).pattern, dna.get(layer).palette)
    }
    return layers
  }

  private static _layersFromProperties(properties: AvatarPatternPaletteNames): Record<string, PatternPaletteDescriptor> {
    const layers: Record<string, PatternPaletteDescriptor> = {}
    for (const layer of AvatarLayerStack.iter()) {
      let patternPaletteNames: PatternPaletteNames = properties[layer.name] || defaultNames(layer)
      layers[layer.name] = AvatarDefinitions.getPatternPalette(
        layer,
        patternPaletteNames.patternName,
        patternPaletteNames.paletteName
      )
    }
    return layers
  }

  /**
   * Returns the PatternPaletteNames for the given layer name or index.
   * @param nameOrIndex The name or index of the layer.
   * @returns The PatternPaletteNames for the given layer.
   */
  get(nameOrIndex: LayerDescriptor | string | number): PatternPaletteDescriptor {
    let name: string = ''
    // convert to name if number
    if (typeof nameOrIndex === 'number') {
      name = AvatarLayerStack.get(nameOrIndex).name
    }
    // should be a string now
    if (typeof nameOrIndex !== 'string') {
      // should be a LayerDescriptor so try to get the name
      name = (nameOrIndex as LayerDescriptor).name
    }
    // get by name
    if ([...AvatarLayerStack.iter()].map((layer) => layer.name).indexOf(name) === -1) {
      throw new Error(`Invalid layer name: ${nameOrIndex}`)
    }
    try {
      return this.layers[name]
    } catch (e) {
      console.error('Unexpected error, possibly introduced a new layer without corresponding DNA getter')
      throw new Error(`Invalid layer name: ${nameOrIndex}`)
    }
  }

  /**
   * Returns whether the given Avatar is equal to this Avatar.
   * @param other The other Avatar to compare to.
   * @returns True if the Avatars have the same DNA, otherwise false.
   */
  equals(other: Avatar): boolean {
    return this.dna.equals(other.dna)
  }

  /**
   * Returns a new Avatar with the given overrides applied.
   * @param override The overrides to apply.
   * @returns A new Avatar with the given overrides applied.
   */
  transform(override: Record<string, PatternPaletteNames>): Avatar {
    const newProperties: Record<string, PatternPaletteNames> = {}
    for (const layer of AvatarLayerStack.iter()) {
      newProperties[layer.name] = {
        patternName: layer.name in override ? override[layer.name].patternName : this.layers[layer.name].pattern.name,
        paletteName: layer.name in override ? override[layer.name].paletteName : this.layers[layer.name].palette.name,
      }
    }
    return new Avatar(newProperties)
  }

  toString(): string {
    let s = `Avatar(${this.dna}; `
    for (const layer of AvatarLayerStack.iter()) {
      s += `(${this.get(layer).pattern.name},${this.get(layer).palette.name}); `
    }
    s += ')'
    return s
  }

  static random(): Avatar {
    let avatar: Avatar = new Avatar(DNA.ZERO)
    for (const layer of AvatarLayerStack.iter()) {
      // get all the possible options
      const options = AvatarDefinitions.getPatternPalettesByLayer(layer)
      // pick a random option
      const option = options[Math.floor(Math.random() * options.length)]
      // set the DNA
      avatar = avatar.transform({
        [layer.name]: {
          patternName: option.pattern.name,
          paletteName: option.palette.name,
        },
      })
    }
    return avatar
  }
}
