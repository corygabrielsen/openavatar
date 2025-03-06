import { Avatar, LayerDescriptor, PaletteDescriptor, PatternDescriptor } from '@openavatar/types'
import { Palette, PatternMaster } from '../lib'
import { AvatarPaletteAssets } from './AvatarPaletteAssets'
import { AvatarPatternAssets } from './AvatarPatternAssets'
import { AvatarSpriteAssets, Base64PNGURI } from './AvatarSpriteAssets'

export class AvatarAssets {
  /**
   * Get the pattern.
   * @param pattern The pattern to get
   * @returns The pattern
   */
  public static getPattern(pattern: PatternDescriptor): PatternMaster {
    return AvatarPatternAssets.getPattern(pattern)
  }

  /**
   * Get the palette.
   * @param palette The palette to get
   * @returns The palette
   */
  public static getPalette(palette: PaletteDescriptor): Palette {
    return AvatarPaletteAssets.getPalette(palette)
  }

  /**
   * Get the sprite for a given layer and style
   * @param avatar The avatar to get the sprite for
   * @param layerNum The layer index for which to get the sprite
   */
  public static getSprite(avatar: Avatar, layer: LayerDescriptor): Base64PNGURI {
    return AvatarSpriteAssets.getSprite(avatar, layer)
  }
}
