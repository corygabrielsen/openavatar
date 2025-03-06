// ImageSize is a struct that represents the width and height of an image
export interface ImageSize {
  width: number
  height: number
}

export type ColorCode = `#${string}`
// canonical color code for transparent
export const TRANSPARENT: ColorCode = '#00000000'

/**
 * ColorFormat is a struct that represents format of an image,
 * such as RGB8, RGBA8, RGB16, RGBA16, RGB32, or RGBA32.
 */
export class ColorFormat {
  public static readonly RGB8: ColorFormat = new ColorFormat(8, 3)
  public static readonly RGBA8: ColorFormat = new ColorFormat(8, 4)
  public static readonly RGB16: ColorFormat = new ColorFormat(16, 3)
  public static readonly RGBA16: ColorFormat = new ColorFormat(16, 4)
  public static readonly RGB32: ColorFormat = new ColorFormat(32, 3)
  public static readonly RGBA32: ColorFormat = new ColorFormat(32, 4)
  public static readonly GRAYSCALE8: ColorFormat = new ColorFormat(8, 1)
  public static readonly GRAYSCALE16: ColorFormat = new ColorFormat(16, 1)
  public static readonly GRAYSCALE32: ColorFormat = new ColorFormat(32, 1)
  // also include some ones for when there is just a single channel
  // this is used for "pattern" files where we have an external color map

  public alphaChannel: boolean

  private constructor(public bitsPerChannel: number, public channels: number) {
    this.alphaChannel = this.channels === 4
  }

  get bitsPerPixel(): number {
    return this.bitsPerChannel * this.channels
  }

  get bytesPerPixel(): number {
    return this.bitsPerPixel / 8
  }

  get bytesPerChannel(): number {
    return this.bitsPerChannel / 8
  }

  get name(): string {
    return this.toString()
  }

  toString(): string {
    // RGB8, RGBA8, RGB16, RGBA16, RGB32, or RGBA32
    return `${this.channels === 1 ? 'GRAYSCALE' : this.channels === 3 ? 'RGB' : 'RGBA'}${this.bitsPerChannel}`
  }

  serialize(): { bitsPerChannel: number; channels: number } {
    return { bitsPerChannel: this.bitsPerChannel, channels: this.channels }
  }

  equals(other: ColorFormat): boolean {
    return this.bitsPerChannel === other.bitsPerChannel && this.channels === other.channels
  }

  toHex(color: Uint8Array): ColorCode {
    if (color.length % this.channels !== 0) {
      throw new Error(`Invalid color length: ${color.length} != ${this.channels} * n`)
    }
    let hex: ColorCode = '#'
    for (let i = 0; i < color.length; i++) {
      hex += color[i].toString(16).padStart(2, '0')
    }
    return hex
  }

  static valueOf(data: { bitsPerChannel: number; channels: number }): ColorFormat {
    if (data.channels !== 1 && data.channels !== 3 && data.channels !== 4) {
      throw new Error(`Invalid number of channels: ${data.channels}`)
    }
    if (data.bitsPerChannel !== 8 && data.bitsPerChannel !== 16 && data.bitsPerChannel !== 32) {
      throw new Error(`Invalid number of bits per channel: ${data.bitsPerChannel}`)
    }
    return {
      8: data.channels === 1 ? ColorFormat.GRAYSCALE8 : data.channels === 3 ? ColorFormat.RGB8 : ColorFormat.RGBA8,
      16: data.channels === 1 ? ColorFormat.GRAYSCALE16 : data.channels === 3 ? ColorFormat.RGB16 : ColorFormat.RGBA16,
      32: data.channels === 1 ? ColorFormat.GRAYSCALE32 : data.channels === 3 ? ColorFormat.RGB32 : ColorFormat.RGBA32,
    }[data.bitsPerChannel]
  }
}

// Defines the properties of an image, such as its format, size, and color depth
export interface ImageProperties {
  size: ImageSize
  colorFormat: ColorFormat
}
