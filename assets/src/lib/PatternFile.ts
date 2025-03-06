import { ImageProperties } from './ImageProperties'
import { CropOptions } from './ImageUtils'

export type PatternHex = `0x${string}`
export type LayerName = string
export type PatternName = string

export class PatternFile {
  constructor(
    public layer: LayerName,
    public patternName: PatternName,
    public paletteCode: number,
    public imageProperties: ImageProperties,
    public scanlines: PatternHex[]
  ) {}

  /**
   * Returns the pattern file as a buffer.
   * @returns A buffer
   */
  get buffer(): Buffer {
    return Buffer.from(PatternFile.joinScanlines(this.scanlines).slice(2), 'hex')
  }

  /**
   * Crops the given pattern file to the given width and height, returning a new pattern file.
   * @param cropOptions - The options for cropping
   * @returns A new pattern file with the given width and height
   */
  crop(cropOptions: CropOptions): PatternFile {
    const top: number = cropOptions.y
    const left: number = cropOptions.x
    const w = cropOptions.width
    const h = cropOptions.height

    const croppedScanlines: PatternHex[] = []

    for (let i = top; i < top + h; i++) {
      croppedScanlines.push(`0x${this.scanlines[i].slice(2).slice(left * 2, (left + w) * 2)}`)
    }

    // SANITY CHECK - there should be exactly h scanlines
    if (croppedScanlines.length !== h) {
      throw new Error(`Invalid scanline count after crop: ${croppedScanlines.length}`)
    }

    // SANITY CHECK - each scanline should be exactly w*2+2
    for (let i = 0; i < croppedScanlines.length; i++) {
      if (croppedScanlines[i].length !== w * 2 + 2) {
        throw new Error(`Invalid scanline[${i}] length after crop: ${croppedScanlines[i].length}`)
      }
    }

    return new PatternFile(
      this.layer,
      this.patternName,
      this.paletteCode,
      {
        size: {
          width: w,
          height: h,
        },
        colorFormat: this.imageProperties.colorFormat,
      },
      croppedScanlines
    )
  }

  /**
   * Splits the given pattern into scanlines of the given width.
   * @param pattern - The pattern to split
   * @param width - The width of the scanlines to split into
   * @returns An array of scanlines
   */
  static splitScanlines(pattern: PatternHex, width: number): PatternHex[] {
    const rawPattern: string = pattern.slice(2)
    const scanlines: PatternHex[] = []

    for (let i = 0; i < rawPattern.length; i += width * 2) {
      scanlines.push(`0x${rawPattern.slice(i, i + width * 2)}`)

      if (scanlines[scanlines.length - 1].length !== width * 2 + 2) {
        throw new Error(`Invalid scanline length: ${scanlines[scanlines.length - 1].length}`)
      }
    }

    return scanlines
  }

  /**
   * Joins the given scanlines into a single pattern.
   * @param scanlines - The scanlines to join
   * @returns A single pattern string
   */
  static joinScanlines(scanlines: PatternHex[]): PatternHex {
    return `0x${scanlines.map((scanline) => scanline.slice(2)).join('')}`
  }
}
