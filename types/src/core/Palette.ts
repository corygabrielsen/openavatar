import { LayerDescriptor } from './Layer'
import { PatternDescriptor } from './Pattern'

/**
 * {@link PatternPaletteDescriptor} represents an individual palette.
 * It contains a code for grouping, and then a name/index for identification
 * and ordering purposes.
 */
export type PaletteDescriptor = {
  code: number
  name: string
  index: number
}

/**
 * {@link PatternPaletteDescriptor} represents an individual palette for a pattern in a
 * layered pixel art composition. It contains a name for identification
 * and an index for ordering purposes.
 */
export type PatternPaletteDescriptor = {
  pattern: PatternDescriptor
  palette: PaletteDescriptor
}

/**
 * {@link PatternPaletteDescriptorProvider} is an interface for objects that can
 * provide {@link PatternPaletteDescriptor} instances based on either their name or
 * index. This interface ensures that classes implementing it can retrieve
 * palette information in a standardized manner.
 */
export interface PatternPaletteDescriptorProvider {
  getByPattern(pattern: PatternDescriptor, ref: string | number): PatternPaletteDescriptor
  getAllByPattern(pattern: PatternDescriptor): PatternPaletteDescriptor[]
  getByCode(code: number): PaletteDescriptor[]
  getAll(): PatternPaletteDescriptor[]
}

/**
 * Ensure that the given array of {@link PatternPaletteDescriptor} is not empty.
 * @param patternPalettes The array of {@link PatternPaletteDescriptor} to check
 * @throws Error if the array is empty
 */
function nonEmpty(patternPalettes: PatternPaletteDescriptor[]): void {
  if (patternPalettes === undefined || patternPalettes.length === 0) {
    throw new Error('PatternPaletteDescriptorCollection cannot be empty')
  }
}

/**
 * Ensure that there are no duplicate {@link PatternPaletteDescriptor} objects in the given array.
 * @param patternPalettes The array of {@link PatternPaletteDescriptor} to check
 * @throws Error if there are duplicate names or indices within a (layer, pattern) pair
 */
function noDuplicates(patternPalettes: PatternPaletteDescriptor[]): void {
  // duplicate layer names/indices allowed if there are unique patterns within each layer
  // duplicate pattern names/indices allowed if there are unique palettes within each layer/pattern

  // ensure no duplicate palette names within a layer/pattern
  const layerToPatternToPaletteNames = new Map<string, Map<number, Set<string>>>()
  patternPalettes.forEach((patternPalette) => {
    const layerPatterns =
      layerToPatternToPaletteNames.get(patternPalette.pattern.layer.name) || new Map<number, Set<string>>()
    const patternPalettes = layerPatterns.get(patternPalette.pattern.index) || new Set<string>()
    if (patternPalettes.has(patternPalette.palette.name)) {
      throw new Error(
        `Duplicate palette name: ${patternPalette.palette.name} within layer/pattern ${patternPalette.pattern.layer.name}/${patternPalette.pattern.name}`
      )
    }
    patternPalettes.add(patternPalette.palette.name)
    layerPatterns.set(patternPalette.pattern.index, patternPalettes)
    layerToPatternToPaletteNames.set(patternPalette.pattern.layer.name, layerPatterns)
  })

  // ensure no duplicate palette indices within a layer/pattern
  const layerToPatternToPaletteIndices = new Map<string, Map<number, Set<number>>>()
  patternPalettes.forEach((patternPalette) => {
    const layerPatterns =
      layerToPatternToPaletteIndices.get(patternPalette.pattern.layer.name) || new Map<number, Set<number>>()
    const patternPalettes = layerPatterns.get(patternPalette.pattern.index) || new Set<number>()
    if (patternPalettes.has(patternPalette.palette.index)) {
      throw new Error(`Duplicate palette index within layer/pattern: ${patternPalette.palette.index}`)
    }
    patternPalettes.add(patternPalette.palette.index)
    layerPatterns.set(patternPalette.pattern.index, patternPalettes)
    layerToPatternToPaletteIndices.set(patternPalette.pattern.layer.name, layerPatterns)
  })
}

/**
 * Sort the given array of {@link PatternPaletteDescriptor} by their indices.
 * @param patternPalettes The array of {@link PatternPaletteDescriptor} to sort
 * @returns The sorted array of {@link PatternPaletteDescriptor}
 */
function sort(patternPalettes: PatternPaletteDescriptor[]): PatternPaletteDescriptor[] {
  // sort by pattern.layer.index then by pattern.index
  return patternPalettes.sort((a, b) => {
    if (a.pattern.layer.index === b.pattern.layer.index) {
      if (a.pattern.index === b.pattern.index) {
        // CASE 1: same layer, same pattern
        return a.palette.index - b.palette.index
      }
      // CASE 2: same layer, different pattern
      return a.pattern.index - b.pattern.index
    }
    // CASE 3: different layer
    return a.pattern.layer.index - b.pattern.layer.index
  })
}

/**
 * {@link PatternPaletteDescriptorCollection} is an abstract class that implements the
 * {@link PatternPaletteDescriptorProvider} interface. It provides a structure for
 * managing and interacting with a collection of {@link PatternPaletteDescriptor}
 * objects. This class enables easy retrieval, iteration, and manipulation of
 * {@link PatternPaletteDescriptor} in a collection-like manner, where palettes are
 * associated with alyers and patterns and can be identified using names or
 * indices.
 */
export abstract class PatternPaletteDescriptorCollection implements PatternPaletteDescriptorProvider {
  private readonly patternPalettes: PatternPaletteDescriptor[] = []
  // layer name -> pattern index -> palette index -> <value>
  private readonly layerToDoubleArray: Map<string, PatternPaletteDescriptor[][]> = new Map()
  // layer name -> pattern name -> palette name -> <value>
  private readonly layerToDoubleMap: Map<string, Map<string, Map<string, PatternPaletteDescriptor>>> = new Map()
  // palette code -> palette index -> <value>
  private readonly codeDoubleArray: PaletteDescriptor[][] = []

  constructor(patternPalettes: PatternPaletteDescriptor[]) {
    nonEmpty(patternPalettes)
    noDuplicates(patternPalettes)
    // deep copy then sort
    patternPalettes = sort(patternPalettes)
    this.patternPalettes = patternPalettes

    this.patternPalettes.forEach((patternPalette) => {
      // freeze the pattern palette so it can't be modified
      Object.freeze(patternPalette)

      // 1. build the double array of palettes by layer
      // 1a. get or create the double array
      const palettesDoubleArray = this.layerToDoubleArray.get(patternPalette.pattern.layer.name) || []
      // 1b. the double array should contain an array of palettes for the pattern
      if (palettesDoubleArray[patternPalette.pattern.index] === undefined) {
        palettesDoubleArray[patternPalette.pattern.index] = []
      }
      // 1c. add the palette to the array
      palettesDoubleArray[patternPalette.pattern.index][patternPalette.palette.index] = patternPalette
      // 1d. update the double array
      this.layerToDoubleArray.set(patternPalette.pattern.layer.name, palettesDoubleArray)

      // 2. build the double map of palettes by layer
      // 2a. get or create the inner map
      const middleMap =
        this.layerToDoubleMap.get(patternPalette.pattern.layer.name) ||
        new Map<string, Map<string, PatternPaletteDescriptor>>()
      // 2b. get or create the inner inner map
      const innerMap = middleMap.get(patternPalette.pattern.name) || new Map<string, PatternPaletteDescriptor>()
      // 2c. add the palette to the inner inner map
      innerMap.set(patternPalette.palette.name, patternPalette)
      // 2d. update the inner map
      middleMap.set(patternPalette.pattern.name, innerMap)
      // 2e. update the outer map
      this.layerToDoubleMap.set(patternPalette.pattern.layer.name, middleMap)

      // 3. build the double array of palettes by code (for lookup by code)
      // 3a. ensure we have enough arrays
      if (this.codeDoubleArray.length <= patternPalette.palette.code) {
        // push empty arrays until we have enough
        while (this.codeDoubleArray.length <= patternPalette.palette.code) {
          this.codeDoubleArray.push([])
        }
      }
      // 3b. get or create the inner array
      const innerArray = this.codeDoubleArray[patternPalette.palette.code] || []
      // 3c. add the palette to the inner array
      // CASE 1 - does not exist ( index should match the length of the array )
      if (innerArray[patternPalette.palette.index] === undefined) {
        if (patternPalette.palette.index !== innerArray.length) {
          throw new Error(`Unsorted input??? Processing palette: ${JSON.stringify(patternPalette)}`)
        }
        innerArray.push(patternPalette.palette)
      }
      // CASE 2 - exists and should match name/index
      else {
        const existingPalette = innerArray[patternPalette.palette.index]
        if (
          existingPalette.name !== patternPalette.palette.name ||
          existingPalette.index !== patternPalette.palette.index
        ) {
          throw new Error(
            `Palette code ${patternPalette.palette.code} already exists with different name/index: ${JSON.stringify(
              existingPalette
            )}`
          )
        }
      }
    })

    // now ensure no empty inner arrays in codeDoubleArray
    this.codeDoubleArray.forEach((innerArray, index) => {
      if (innerArray.length === 0) {
        throw new Error(`Missing palette code: ${index}`)
      }
    })
  }

  /**
   * Get a specific palette by its pattern and palette reference.
   * @param pattern The pattern descriptor
   * @param ref The palette reference
   * @returns The palette descriptor
   */
  getByPattern(pattern: PatternDescriptor, ref: number | string): PatternPaletteDescriptor {
    // CASE 1: ref is a string, so it's a palette name
    //         we need to look up the palette by name using the double map
    if (typeof ref === 'string') {
      // use the layerToDoubleMap to get the lookup by palette name map
      const doubleMap = this._verifyGetDoubleMapByLayer(pattern.layer)
      const innerMap = doubleMap.get(pattern.name)
      if (innerMap === undefined) {
        throw new Error(`No palettes found for pattern: ${pattern.name} (${JSON.stringify(pattern)})`)
      }
      const palette = innerMap.get(ref)
      if (palette === undefined) {
        throw new Error(`No palette found for pattern: ${pattern.name} and palette name: ${ref}`)
      }
      return palette
    }

    // CASE 2: ref is a number, so it's a palette index
    //         we need to look up the palette by index using the double array
    let paletteIndex: number | undefined = undefined
    if (typeof ref === 'number') {
      paletteIndex = ref
    } else if (paletteIndex === undefined) {
      throw new Error(`Invalid palette reference: ${JSON.stringify(ref)}`)
    }

    const doubleArray: PatternPaletteDescriptor[][] = this._verifyGetDoubleArrayByLayer(pattern.layer)
    if (pattern.index >= doubleArray.length) {
      throw new Error(
        `Invalid pattern index: ${pattern.index} for pattern: ${pattern.name} in layer: ${pattern.layer.name}`
      )
    }

    const palettes: PatternPaletteDescriptor[] = doubleArray[pattern.index]

    if (paletteIndex >= palettes.length) {
      throw new Error(
        `Invalid palette index: ${paletteIndex} for pattern: ${pattern.name} in layer: ${pattern.layer.name}`
      )
    }

    return palettes[paletteIndex]
  }

  /**
   * Get the palettes for a given {@link PatternDescriptor}
   * @param pattern The pattern descriptor
   * @returns The palettes
   */
  getAllByPattern(pattern: PatternDescriptor): PatternPaletteDescriptor[] {
    const palettesByPatternIndex: PatternPaletteDescriptor[][] = this._verifyGetDoubleArrayByLayer(pattern.layer)
    if (pattern.index >= palettesByPatternIndex.length) {
      throw new Error(
        `Invalid pattern index: ${pattern.index} for pattern: ${pattern.name} in layer: ${pattern.layer.name}`
      )
    }
    const palettes = palettesByPatternIndex[pattern.index]
    if (palettes === undefined) {
      throw new Error(`No palettes found for pattern: ${pattern.name} (${JSON.stringify(pattern)})`)
    }
    return palettes
  }

  /**
   * Get the {@link PaletteDescriptor} for the given code and reference.
   * @param code The palette code
   * @param ref The palette reference
   * @returns The  {@link PaletteDescriptor}
   */
  get(code: number, ref: number | string): PaletteDescriptor {
    const found: PaletteDescriptor | undefined = this.getByCode(code).find((palette) => {
      if (typeof ref === 'number') {
        return palette.index === ref
      } else if (typeof ref === 'string') {
        return palette.name === ref
      }
      return false
    })
    if (found === undefined) {
      throw new Error(`No palette found for code: ${code} and reference: ${ref}`)
    }
    return found
  }

  /**
   * Get the {@link PaletteDescriptor} for a given palette code.
   * @param code The code
   * @returns The palettes
   */
  getByCode(code: number): PaletteDescriptor[] {
    if (code < 0 || code >= this.codeDoubleArray.length) {
      throw new Error(`Invalid palette code: ${code}`)
    }
    const palettes = this.codeDoubleArray[code]
    if (palettes === undefined) {
      throw new Error(`No palettes found for code: ${code}`)
    }
    return palettes
  }

  /**
   * Get all palettes in the collection
   * @returns The palettes
   */
  getAll(): PatternPaletteDescriptor[] {
    return this.patternPalettes
  }

  /**
   * Get the number of palette codes
   * @returns The number of palette codes
   */
  getNumCodes(): number {
    return this.codeDoubleArray.length
  }

  /**
   * Get the number of palettes for a given pattern descriptor
   * @param pattern The pattern descriptor
   * @returns The number of palettes
   */
  getCount(pattern: PatternDescriptor): number {
    return this.getAllByPattern(pattern).length
  }

  /**
   * Get the number of palettes for a given palette code
   * @param code The palette code
   * @returns The number of palettes
   */
  getCountByCode(code: number): number {
    return this.getByCode(code).length
  }

  /**
   * Get the double map for the given layer or throw an error if it doesn't exist
   * @param layer The layer descriptor
   * @returns The double map
   * @throws Error if the double map doesn't exist
   */
  _verifyGetDoubleMapByLayer(layer: LayerDescriptor): Map<string, Map<string, PatternPaletteDescriptor>> {
    const palettesByPatternName = this.layerToDoubleMap.get(layer.name)
    if (palettesByPatternName === undefined) {
      throw new Error(`No palettes found for layer: ${layer.name} (${JSON.stringify(layer)})`)
    }
    return palettesByPatternName
  }

  /**
   * Get the double array for the given layer or throw an error if it doesn't exist
   * @param layer The layer descriptor
   * @returns The double array
   * @throws Error if the double array doesn't exist
   */
  _verifyGetDoubleArrayByLayer(layer: LayerDescriptor): PatternPaletteDescriptor[][] {
    const palettesDoubleArray = this.layerToDoubleArray.get(layer.name)
    if (palettesDoubleArray === undefined) {
      throw new Error(`No palettes found for layer: ${layer.name} (${JSON.stringify(layer)})`)
    }
    return palettesDoubleArray
  }
}
