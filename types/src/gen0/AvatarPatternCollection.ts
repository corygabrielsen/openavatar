import { ConfigParser } from '../core/Config'
import { PatternDescriptor, PatternDescriptorCollection } from '../core/Pattern'
import { AvatarConfig } from './AvatarConfig'

// TODO parse the canonical pattern definitions from the AvatarConfig
const PATTERNS_BY_LAYER: Record<string, PatternDescriptor[]> = ConfigParser.parsePatterns(AvatarConfig)
const PATTERNS: PatternDescriptor[] = []
for (const layerName in PATTERNS_BY_LAYER) {
  PATTERNS.push(...PATTERNS_BY_LAYER[layerName])
}

/**
 * AvatarPatternCollectionSingleton is a singleton class that extends PatternDescriptorCollection
 * to provide predefined layer definitions specific to OpenAvatar Gen 0.
 */
class AvatarPatternCollectionSingleton extends PatternDescriptorCollection {
  private static _instance: AvatarPatternCollectionSingleton

  private constructor() {
    super(PATTERNS)
  }

  /**
   * Get the singleton instance of AvatarPatternCollection
   * @returns The singleton instance of AvatarPatternCollection
   */
  public static instance(): AvatarPatternCollectionSingleton {
    if (!AvatarPatternCollectionSingleton._instance) {
      AvatarPatternCollectionSingleton._instance = new AvatarPatternCollectionSingleton()
    }

    return AvatarPatternCollectionSingleton._instance
  }
}

/**
 * AvatarPatternCollection is an exported constant that contains an instance of the
 * AvatarPatternCollectionSingleton. It provides access to the pattern descriptors.
 */
export const AvatarPatternCollection = AvatarPatternCollectionSingleton.instance()
