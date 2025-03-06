import { PatternDescriptor, PatternPaletteDescriptor } from '@openavatar/types'
import Jimp from 'jimp'
import { Texture } from '../../lib/Texture'

/**
 * Encodes a texture as a variety of different formats.
 */
export class TextureEncoder {
  private readonly texture: Texture
  private cachedPNG: Buffer | undefined

  constructor(texture: Texture) {
    this.texture = texture
  }

  /**
   * Encodes the texture as a PNG.
   * @returns PNG buffer
   */
  encodeHex(): string {
    return Buffer.from(this.texture.data).toString('hex')
  }

  /**
   * Encodes the texture as a BMP.
   * @returns BMP buffer
   */
  encodeBitmap(): Buffer {
    const header = Buffer.alloc(14)
    const dibHeader = Buffer.alloc(40)
    header.write('BM', 0, 2, 'ascii') // magic number
    header.writeUInt32LE(header.length + dibHeader.length + this.texture.length, 2) // size of the file
    header.writeUInt32LE(0, 6) // reserved
    header.writeUInt32LE(header.length + dibHeader.length, 10) // offset to the pixel data

    dibHeader.writeUInt32LE(dibHeader.length, 14) // size of the DIB header
    dibHeader.writeUInt32LE(this.texture.width, 18) // width of the image
    dibHeader.writeUInt32LE(this.texture.height, 22) // height of the image
    dibHeader.writeUInt16LE(1, 26) // number of planes
    dibHeader.writeUInt16LE(this.texture.colorFormat.bitsPerPixel, 28) // bits per pixel
    dibHeader.writeUInt32LE(0, 30) // compression method (uncompressed)
    dibHeader.writeUInt32LE(this.texture.length, 34) // size of the pixel data

    return Buffer.concat([header, dibHeader, Buffer.from(this.texture.data)])
  }

  /**
   * Encodes the texture as a PNG.
   * @returns PNG buffer
   */
  encodePNG(): Buffer {
    if (this.texture.colorFormat.bitsPerChannel !== 8) {
      throw new Error('Only 8 bit images can be encoded as PNG. Got ' + this.texture.colorFormat.bitsPerPixel)
    }
    if (this.cachedPNG !== undefined) {
      return this.cachedPNG
    }
    // Use the Jimp library to encode the image as PNG
    const jimp = new Jimp(this.texture.width, this.texture.height)
    jimp.bitmap.data = Buffer.from(this.texture.data)

    jimp.getBuffer(Jimp.MIME_PNG, (err: Error | null, buffer: Buffer) => {
      if (err) {
        console.error(err)
        throw err
      }
      this.cachedPNG = buffer
    })
    const start = Date.now()
    while (this.cachedPNG === undefined && Date.now() - start < 30_000) {
      // Wait for the encoding to finish
    }
    if (this.cachedPNG === undefined) {
      throw new Error('PNG encoding timed out')
    }
    return this.cachedPNG
  }

  /**
   * Encodes the texture as a PNG and encodes it as a base64 string.
   * @returns Base64 encoded PNG
   */
  encodeBase64PNG(): string {
    return this.encodePNG().toString('base64')
  }

  /**
   * Encodes the texture as a PNG and encodes it as a base64 string with the data URI prefix.
   * @returns Base64 encoded PNG with data URI prefix
   */
  encodePNGBase64URI(): string {
    return `data:image/png;base64,${this.encodeBase64PNG()}`
  }

  /**
   * Encodes the texture as a TypeScript module which exports a base64 encoded PNG string.
   * @param pattern Pattern descriptor to use for the variable name in the module
   * @param patternPalette Palette descriptor to use for the variable name in the module
   * @returns TypeScript module file as a string
   */
  encodeTSModule(pattern: PatternDescriptor, patternPalette: PatternPaletteDescriptor): string {
    const varname = `${pattern.layer.name}__${pattern.name}__${patternPalette.palette.name}`
    return `export const ${varname} = '${this.encodePNGBase64URI()}'`
  }
}
