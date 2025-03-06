import { PaletteDescriptor } from '@openavatar/types'
import * as generatedPalettes from '../../generated/palettes'
import { Palette } from '../lib/Palette'

export type PaletteCodeIndexString = `palette__${number}__${number}`

class PaletteAssetLookupError extends Error {
  constructor(palette: PaletteDescriptor) {
    super(`Palette not found: ${JSON.stringify(palette)}.`)
  }
}

export class AvatarPaletteAssets {
  /**
   * The sprites as a map of layer and style to base64-encoded PNG URI
   */
  public static readonly palettes: Record<PaletteCodeIndexString, Palette> = generatedPalettes

  /**
   * Get the palette.
   * @param palette The palette to get
   * @returns The palette
   */
  public static getPalette(palette: PaletteDescriptor): Palette {
    const key: PaletteCodeIndexString = `palette__${palette.code}__${palette.index}`
    if (!(key in AvatarPaletteAssets.palettes)) {
      throw new PaletteAssetLookupError(palette)
    }
    return AvatarPaletteAssets.palettes[key]
  }
}
