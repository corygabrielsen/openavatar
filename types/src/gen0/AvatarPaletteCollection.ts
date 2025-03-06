import { ConfigParser } from '../core/Config'
import { PatternPaletteDescriptor, PatternPaletteDescriptorCollection } from '../core/Palette'
import { AvatarConfig } from './AvatarConfig'

const PALETTES: PatternPaletteDescriptor[] = ConfigParser.parsePalettes(AvatarConfig)

/**
 * AvatarPaletteCollectionSingleton is a singleton class that extends PatternPaletteDescriptorCollection
 * to provide predefined layer definitions specific to OpenAvatar Gen 0.
 */
class AvatarPaletteCollectionSingleton extends PatternPaletteDescriptorCollection {
  private static _instance: AvatarPaletteCollectionSingleton

  private constructor() {
    super(PALETTES)
  }

  /**
   * Get the singleton instance of AvatarPaletteCollection
   * @returns The singleton instance of AvatarPaletteCollection
   */
  public static instance(): AvatarPaletteCollectionSingleton {
    if (!AvatarPaletteCollectionSingleton._instance) {
      AvatarPaletteCollectionSingleton._instance = new AvatarPaletteCollectionSingleton()
    }

    return AvatarPaletteCollectionSingleton._instance
  }
}

/**
 * AvatarPaletteCollection is an exported constant that contains an instance of the
 * AvatarPaletteCollectionSingleton. It provides access to the palette descriptors.
 */
export const AvatarPaletteCollection = AvatarPaletteCollectionSingleton.instance()
