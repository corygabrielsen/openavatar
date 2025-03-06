import { LayerDescriptor } from '../core/Layer'
import { PaletteDescriptor, PatternPaletteDescriptor } from '../core/Palette'
import { PatternDescriptor, PatternRef } from '../core/Pattern'
import { AvatarLayerStack } from './AvatarLayerStack'
import { AvatarPaletteCollection } from './AvatarPaletteCollection'
import { AvatarPatternCollection } from './AvatarPatternCollection'
import { AvatarPose } from './AvatarPose'

/**
 * AvatarDefinitionsSingleton is a singleton class that composes
 * {@link AvatarLayerStack}, {@link AvatarPatternCollection}, and
 * {@link AvatarPaletteCollection} into a single interface for accessing the
 * descriptors.
 */
class AvatarDefinitionsSingleton {
  private static _instance: AvatarDefinitionsSingleton

  private constructor() {}

  /**
   * Get the singleton instance of AvatarDefinitions
   * @returns The singleton instance of AvatarDefinitions
   */
  public static instance(): AvatarDefinitionsSingleton {
    if (!AvatarDefinitionsSingleton._instance) {
      AvatarDefinitionsSingleton._instance = new AvatarDefinitionsSingleton()
    }

    return AvatarDefinitionsSingleton._instance
  }

  /////////////////////////////////////////////////////////////////////////////
  // Pose
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the {@link AvatarPose} for the given reference.
   * @param layer The pose reference
   * @returns The pose
   */
  getPose(poseRef: number | string): AvatarPose {
    return AvatarPose.get(poseRef)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Layer
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the {@link LayerDescriptor} for the given layer reference.
   * @param layer The layer reference
   * @returns The layer
   */
  getLayer(layerRef: number | string): LayerDescriptor {
    return AvatarLayerStack.get(layerRef)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Pattern
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the {@link PatternDescriptor} for the given layer and pattern reference.
   * @param layer The layer descriptor
   * @param patternRef The pattern reference
   * @returns The pattern
   */
  getPattern(layer: LayerDescriptor, patternRef: number | string): PatternDescriptor {
    return AvatarPatternCollection.get(layer, patternRef)
  }

  /**
   * Get the array of unique {@link PatternDescriptor}.
   * @returns The patterns
   */
  getPatterns(): PatternDescriptor[] {
    return AvatarPatternCollection.getAll()
  }

  /**
   * Get the array of {@link PatternDescriptor} for the given layer.
   * @param layer The layer descriptor
   * @returns The patterns
   */
  getPatternsByLayer(layer: LayerDescriptor): PatternDescriptor[] {
    return AvatarPatternCollection.getBy(layer)
  }

  /**
   * Get the number of patterns for the given layer.
   * @param layer The layer descriptor
   * @returns The number of patterns
   */
  getPatternCount(layer: LayerDescriptor): number {
    return AvatarPatternCollection.getCount(layer)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Pattern + Palette
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the {@link PatternPaletteDescriptor} for the given layer, pattern, and palette.
   * @param layer The layer descriptor
   * @param patternRef The pattern reference (possibly a {@link PatternDescriptor})
   * @param paletteRef The palette reference (not a {@link PatternPaletteDescriptor})
   * @returns The palette
   */
  getPatternPalette(
    layer: LayerDescriptor,
    patternRef: PatternRef,
    paletteRef: number | string
  ): PatternPaletteDescriptor {
    if (typeof patternRef === 'object' && JSON.stringify(patternRef.layer) !== JSON.stringify(layer)) {
      throw new Error(`Invalid pattern reference for layer ${layer.name}: ${patternRef}.`)
    }
    return AvatarPaletteCollection.getByPattern(AvatarPatternCollection.get(layer, patternRef), paletteRef)
  }

  /**
   * Get the array of unique {@link PatternPaletteDescriptor}.
   * @returns The palettes
   */
  getPatternPalettes(): PatternPaletteDescriptor[] {
    return AvatarPaletteCollection.getAll()
  }

  /**
   * Get the array of {@link PatternPaletteDescriptor} for the given layer.
   * @param layer The layer descriptor
   * @returns The palettes
   */
  getPatternPalettesByLayer(layer: LayerDescriptor): PatternPaletteDescriptor[] {
    return this.getPatternPalettes().filter((palette) => palette.pattern.layer.name === layer.name)
  }

  /**
   * Get the array of {@link PatternPaletteDescriptor} for the given layer.
   * @param pattern The pattern descriptor
   * @returns The palettes
   */
  getPatternPalettesByPattern(pattern: PatternDescriptor): PatternPaletteDescriptor[] {
    return AvatarPaletteCollection.getAllByPattern(pattern)
  }

  /**
   * Get the number of palettes for the given pattern.
   * @param pattern The pattern descriptor
   * @returns The number of palettes
   */
  getPaletteCount(pattern: PatternDescriptor): number {
    return AvatarPaletteCollection.getCount(pattern)
  }

  searchPatternPalettes(
    layer: LayerDescriptor,
    patternRef: number | string,
    paletteRegex: RegExp
  ): PatternPaletteDescriptor[] {
    // first lookup the pattern by name
    const pattern: PatternDescriptor = this.getPattern(layer, patternRef)
    // get all the available palettes
    const patternPalettes: PatternPaletteDescriptor[] = this.getPatternPalettesByPattern(pattern)
    // find all the palettes that match the regex
    // rewrite as one liner
    return patternPalettes.filter((patternPalette) => paletteRegex.test(patternPalette.palette.name))
  }

  findPatternPalette(
    layer: LayerDescriptor,
    patternRef: number | string,
    paletteRegex: RegExp
  ): PatternPaletteDescriptor {
    const patternPalettes: PatternPaletteDescriptor[] = this.searchPatternPalettes(layer, patternRef, paletteRegex)
    if (patternPalettes.length === 0) {
      throw new Error(`No palettes found for layer ${layer.name}, pattern ${patternRef}, palette ${paletteRegex}`)
    } else if (patternPalettes.length > 1) {
      throw new Error(`Multiple palettes found for layer ${layer.name}, pattern ${patternRef}, palette ${paletteRegex}`)
    }
    return patternPalettes[0]
  }

  /////////////////////////////////////////////////////////////////////////////
  // Palette
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the array of {@link PaletteDescriptor} for the given layer.
   * @param code The palette code
   * @returns The palettes
   */
  getPalettesByCode(code: number): PaletteDescriptor[] {
    return AvatarPaletteCollection.getByCode(code)
  }

  /**
   * Get the array of {@link PaletteDescriptor} for the given code and reference.
   * @param code The palette code
   * @param ref The palette reference
   * @returns The palettes
   */
  getPalette(code: number, ref: number | string): PaletteDescriptor {
    return AvatarPaletteCollection.get(code, ref)
  }

  /**
   * Get the number of unique palette codes.
   * @returns The number of palette codes
   */
  getNumPaletteCodes(): number {
    return AvatarPaletteCollection.getNumCodes()
  }

  /**
   * Get the number of palettes for the given code.
   * @param code The palette code
   * @returns The number of palettes
   */
  getNumPalettes(code: number): number {
    return AvatarPaletteCollection.getCountByCode(code)
  }

  searchPalettes(code: number, paletteRegex: RegExp): PaletteDescriptor[] {
    // get all the available palettes
    const palettes: PaletteDescriptor[] = this.getPalettesByCode(code)
    // find all the palettes that match the regex
    // rewrite as one liner
    return palettes.filter((palette) => paletteRegex.test(palette.name))
  }

  findPalette(code: number, paletteRegex: RegExp): PaletteDescriptor {
    const palettes: PaletteDescriptor[] = this.searchPalettes(code, paletteRegex)
    if (palettes.length === 0) {
      throw new Error(`No palettes found for code ${code}, palette ${paletteRegex}`)
    } else if (palettes.length > 1) {
      throw new Error(`Multiple palettes found for code ${code}, palette ${paletteRegex}`)
    }
    return palettes[0]
  }
}

/**
 * AvatarDefinitions is an exported constant that contains an instance of the
 * AvatarDefinitionsSingleton. It provides access to the layer descriptors.
 */
export const AvatarDefinitions = AvatarDefinitionsSingleton.instance()
