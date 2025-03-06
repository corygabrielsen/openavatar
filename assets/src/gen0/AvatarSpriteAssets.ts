import { Avatar, LayerDescriptor, PatternPaletteDescriptor } from '@openavatar/types'

import * as generatedSprites from '../../generated/sprites'

export type LayerPatternPalleteString = `${string}__${string}__${string}`

export type Base64PNGURI = `data:image/png;base64,${string}`

class SpriteAssetLookupError extends Error {
  constructor(layer: string, pattern: string, pallete: string) {
    const lpp = `${layer}__${pattern}__${pallete}`
    super(`${lpp} No sprite found for {layer:"${layer}",pattern:"${pattern}",pallete:"${pallete}"}`)
  }
}

export class AvatarSpriteAssets {
  /**
   * The sprites as a map of layer and style to base64-encoded PNG URI
   */
  public static readonly sprites: Record<LayerPatternPalleteString, Base64PNGURI> = generatedSprites

  /**
   * Get the sprite for a given layer and style
   * @param avatar The avatar to get the sprite for
   * @param layer The layer for which to get the sprite
   */
  public static getSprite(avatar: Avatar, layer: LayerDescriptor): Base64PNGURI {
    const patternPalette: PatternPaletteDescriptor = avatar.get(layer)
    const key: LayerPatternPalleteString = `${layer.name}__${patternPalette.pattern.name}__${patternPalette.palette.name}`
    if (!(key in AvatarSpriteAssets.sprites)) {
      throw new SpriteAssetLookupError(layer.name, patternPalette.pattern.name, patternPalette.palette.name)
    }
    return AvatarSpriteAssets.sprites[key]
  }
}
