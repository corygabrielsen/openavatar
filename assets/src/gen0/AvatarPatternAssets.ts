import { PatternDescriptor } from '@openavatar/types'
import * as generatedPatterns from '../../generated/patterns'
import { PatternMaster, SerializedPatternMaster } from '../lib'

export type LayerPatternString = `${string}__${string}`

class PatternAssetLookupError extends Error {
  constructor(pattern: PatternDescriptor) {
    super(`No pattern: ${pattern.layer.name}__${pattern.name}`)
  }
}

const DESERIALIZED_PATTERNS: Record<LayerPatternString, PatternMaster> = {}
// loop through the generated patterns and deserialize them
for (const key in generatedPatterns) {
  if (!key.includes('__')) {
    throw new Error(`Invalid key: ${key}`)
  }
  const castKey = key as LayerPatternString
  const serialized: SerializedPatternMaster = (generatedPatterns as any as Record<LayerPatternString, PatternMaster>)[
    castKey
  ]
  const pattern: PatternMaster = PatternMaster.deserialize(serialized)
  DESERIALIZED_PATTERNS[castKey] = pattern
}

export class AvatarPatternAssets {
  /**
   * The sprites as a map of layer and style to base64-encoded PNG URI
   */
  // TODO can we propogate the typing through the generated file maybe by declaring types in the generated file?
  public static readonly patterns: Record<LayerPatternString, PatternMaster> = DESERIALIZED_PATTERNS

  /**
   * Get the pattern.
   * @param pattern The pattern to get
   * @returns The pattern
   */
  public static getPattern(pattern: PatternDescriptor): PatternMaster {
    const key: LayerPatternString = `${pattern.layer.name}__${pattern.name}`
    if (!(key in AvatarPatternAssets.patterns)) {
      throw new PatternAssetLookupError(pattern)
    }
    return AvatarPatternAssets.patterns[key]
  }
}
