import { ColorCode, ColorFormat, ImageProperties } from './ImageProperties'
import { crop, CropOptions, deindexColors, indexColors, overlay8bit, pixel, pixelIndirect } from './ImageUtils'

// A texture is a two-dimensional image used in game development to add detail and color to 3D models
export class Texture {
  protected _imageProperties: ImageProperties
  protected _imageData: Uint8Array

  constructor(imageProperties: ImageProperties, imageData: Uint8Array) {
    if (imageProperties.size.width < 0 || imageProperties.size.height < 0) {
      throw new Error('Image size cannot be negative')
    }
    const length = imageProperties.size.width * imageProperties.size.height * imageProperties.colorFormat.bytesPerPixel
    if (length === 0) {
      throw new Error('Image size cannot be 0')
    }
    if (imageData.length !== length) {
      const msg =
        `Image data length (${imageData.length}) does not match the image size ` +
        `${imageProperties.size.width}x${imageProperties.size.height}*${imageProperties.colorFormat.bytesPerPixel}=` +
        `${length} and color format`
      throw new Error(msg)
    }
    this._imageProperties = imageProperties
    this._imageData = imageData
  }

  // Gets the properties of the texture, such as its format, size, and color depth
  get properties(): ImageProperties {
    return this._imageProperties
  }

  // Gets the raw image data for the texture
  get data(): Uint8Array {
    return this._imageData
  }

  // Gets the height of the texture
  get height(): number {
    return this._imageProperties.size.height
  }

  // Gets the width of the texture
  get width(): number {
    return this._imageProperties.size.width
  }

  get length(): number {
    return this.width * this.height * this.colorFormat.bytesPerPixel
  }

  get colorFormat(): ColorFormat {
    return this._imageProperties.colorFormat
  }

  /**
   * Gets the color of the pixel at the specified (x, y) position.
   *
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @returns The color of the pixel in hexadecimal format.
   */
  getPixel(x: number, y: number): ColorCode {
    return pixel({ imageProperties: this._imageProperties, imageData: this._imageData, x, y })
  }

  // Crop the texture, given a region to crop.
  crop(options: CropOptions): Texture {
    return new Texture(...crop(this._imageProperties, this._imageData, options))
  }

  // Crop the texture, given a region to crop.
  overlay(overlay: Texture): Texture {
    if (this._imageProperties.colorFormat !== overlay._imageProperties.colorFormat) {
      throw new Error('Cannot overlay textures with different color formats')
    }
    if (this._imageProperties.size.width !== overlay._imageProperties.size.width) {
      throw new Error('Cannot overlay textures with different widths')
    }
    if (this._imageProperties.size.height !== overlay._imageProperties.size.height) {
      throw new Error('Cannot overlay textures with different heights')
    }
    return new Texture(...overlay8bit(this._imageProperties, this._imageData, overlay.data))
  }
}

type PatternHex = `0x${string}`

// A PatternTexture is a texture that uses a palette to map colors to a grayscale image.
export class PatternTexture extends Texture {
  // RGB8: [#000102, #FF0000, #00FF00, #0000FF, ...]
  // RGBA8: [#000102FF, #FF0000FF, #00FF00FF, #0000FFFF, ...]
  private _patternData: Uint8Array
  private _palette: ColorCode[]

  constructor(imageProperties: ImageProperties, patternData: Uint8Array | PatternHex, palette: ColorCode[]) {
    if (typeof patternData === 'string') {
      patternData = Buffer.from(patternData.slice(2), 'hex')
    }
    // construct imageData array from patternData and palette
    const imageData = deindexColors(patternData, palette)
    super(imageProperties, imageData)
    this._patternData = patternData
    this._palette = palette
  }

  /**
   * Gets the palette used to look up colors for each pixel.
   */
  get palette(): ColorCode[] {
    return this._palette
  }

  get paletteData(): Buffer[] {
    const buffers: Buffer[] = this.palette.map((color: `#${string}`) => {
      // color should be a 9-character hex string, e.g. #FF0000FF
      if (color.length !== 9) {
        throw new Error(`Invalid color ${color} in palette`)
      }
      const buffer = Buffer.from(color.slice(1), 'hex')
      return buffer
    })
    return buffers
  }

  get patternData(): Uint8Array {
    return this._patternData
  }

  get patternHex(): `0x${string}` {
    return `0x${Buffer.from(this.patternData).toString('hex')}`
  }

  /**
   * Gets the color of the pixel at the specified (x, y) position.
   *
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @returns The color of the pixel in hexadecimal format.
   */
  getPixel(x: number, y: number): ColorCode {
    return pixelIndirect({
      x,
      y,
      width: this.width,
      patternData: this.patternData,
      palette: this.palette,
    })
  }

  // Convert a texture to a palette texture by creating a palette and rewriting the texture
  static from(texture: Texture): PatternTexture {
    // Create a new texture with the new pixels
    const [indexedColors, palette] = indexColors(texture.properties, texture.data)

    return new PatternTexture(texture.properties, indexedColors, palette)
  }
}

// TextureMap is a class that maps textures to their positions within a TextureAtlas.
export class TextureMap {
  private textures: { [key: string]: Texture } = {}

  // Add a texture to the map, given a unique key and a Texture object.
  public add(key: string, texture: Texture): void {
    this.textures[key] = texture
  }

  // Get a texture from the map, given its key.
  public get(key: string): Texture | undefined {
    return this.textures[key]
  }
}

// TextureAtlas is a class that represents a collection of textures, used to create a spritesheet.
export class TextureAtlas {
  private textureMap: TextureMap

  // Construct a TextureAtlas, given a TextureMap object.
  constructor(textureMap: TextureMap) {
    this.textureMap = textureMap
  }

  // Get the texture map associated with this texture atlas.
  get map(): TextureMap {
    return this.textureMap
  }

  // Generate the spritesheet from the textures in the texture map.
  public generateSpritesheet(): Uint8Array {
    // code to generate the spritesheet using the textures in the texture map
    // ...
    return new Uint8Array() // placeholder
  }
}
