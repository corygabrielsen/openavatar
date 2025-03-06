import { PatternDescriptor, PatternPaletteDescriptor } from '@openavatar/types'
import { ColorCode, ImageProperties, Palette, PatternHex, PatternMaster, Texture } from '../../lib'
import { TextureEncoder } from './TextureEncoder'

/**
 * Union of pattern and palette data.
 */
export interface PatternPaletteData {
  // pattern info
  pattern: PatternDescriptor
  scanlines: PatternHex[]
  imageProperties: ImageProperties
  // palette info
  patternPalette: PatternPaletteDescriptor
  colors: ColorCode[]
}

/**
 * A structure that contains all the artifacts for a given image.
 * This is used to write the image to disk and to encode it in various ways.
 */
export type ImageArtifacts = {
  hex: string
  bmp: Buffer
  png: Buffer
  base64: string
  ts: string
}

export type ImageArtifactsPolicy = {
  hex: boolean
  bmp: boolean
  png: boolean
  base64: boolean
  ts: boolean
}

export type PatternArtifacts = {
  ts: string
}

export type PaletteArtifacts = {
  ts: string
}

/**
 * An extension of the {@link ImageArtifacts} interface that also contains the
 * {@link ImageArtifacts} for the spritesheet and sprite.
 */
export type SpriteArtifacts = ImageArtifacts
export type SpritesheetArtifacts = ImageArtifacts

export type RenderPatternArtifacts = {
  pattern: PatternArtifacts

  // parallel arrays
  sprites: SpriteArtifacts[]
  spritesheets: SpritesheetArtifacts[]
}

export type RenderArtifacts = {
  palettes: PaletteArtifacts[][]

  patterns: RenderPatternArtifacts[]
}

/**
 * A class that is responsible for writing the artifacts for a given texture.
 */
export class ArtifactEncoder {
  static encodePattern(patternMaster: PatternMaster): PatternArtifacts {
    return {
      ts: `export const ${patternMaster.pattern.layer.name}__${patternMaster.pattern.name} = ${JSON.stringify(
        patternMaster
      )}`,
    }
  }

  static encodePalette(palette: Palette): PaletteArtifacts {
    const vartype = `{descriptor: {code: number, name: string, index: number}, colors: \`#\${string}\`[]}`
    const varname = `palette__${palette.descriptor.code}__${palette.descriptor.index}`
    return {
      ts: `export const ${varname}: ${vartype} = ${JSON.stringify(palette)}`,
    }
  }

  static encodeImage(
    texture: Texture,
    pattern: PatternDescriptor,
    patternPalette: PatternPaletteDescriptor
  ): ImageArtifacts {
    const encoder = new TextureEncoder(texture)
    const encodings: ImageArtifacts = {
      hex: encoder.encodeHex(),
      bmp: encoder.encodeBitmap(),
      png: encoder.encodePNG(),
      base64: encoder.encodeBase64PNG(),
      ts: encoder.encodeTSModule(pattern, patternPalette),
    }
    return encodings
  }
}
