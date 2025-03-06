import { AvatarPose, PatternDescriptor } from '@openavatar/types'
import { ImageProperties } from './ImageProperties'
import { CropOptions } from './ImageUtils'
import { PatternFile, PatternHex } from './PatternFile'
import { PatternPose } from './PatternPose'

const dims = {
  width: 32,
  height: 32,
}
export const SPRITE_POSE_CROP_OPTIONS: Record<string, CropOptions> = {
  // first row
  [AvatarPose.IdleDown0.name]: { x: 32, y: 0, ...dims },
  [AvatarPose.WalkDown0.name]: { x: 64, y: 0, ...dims },
  [AvatarPose.WalkDown1.name]: { x: 96, y: 0, ...dims },
  // second row
  [AvatarPose.IdleLeft0.name]: { x: 32, y: 32, ...dims },
  [AvatarPose.WalkLeft0.name]: { x: 64, y: 32, ...dims },
  [AvatarPose.WalkLeft1.name]: { x: 96, y: 32, ...dims },
  // third row
  [AvatarPose.IdleRight0.name]: { x: 32, y: 64, ...dims },
  [AvatarPose.WalkRight0.name]: { x: 64, y: 64, ...dims },
  [AvatarPose.WalkRight1.name]: { x: 96, y: 64, ...dims },
  // fourth row
  [AvatarPose.IdleUp0.name]: { x: 32, y: 96, ...dims },
  [AvatarPose.WalkUp0.name]: { x: 64, y: 96, ...dims },
  [AvatarPose.WalkUp1.name]: { x: 96, y: 96, ...dims },
}

export type SerializedPatternMaster = {
  pattern: PatternDescriptor
  paletteCode: number
  imageProperties: ImageProperties
  scanlines: PatternHex[]
}

export class PatternMaster {
  constructor(
    public readonly pattern: PatternDescriptor,
    public readonly paletteCode: number,
    public readonly imageProperties: ImageProperties,
    public readonly scanlines: PatternHex[]
  ) {}

  /**
   * Crops the given pattern to the given width and height, returning a new pattern.
   * @param cropOptions - The options for cropping
   * @returns A new pattern master with the given width and height
   */
  crop(cropOptions: CropOptions): PatternMaster {
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

    return new PatternMaster(
      this.pattern,
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

  toPatternFile(): PatternFile {
    return new PatternFile(
      this.pattern.layer.name,
      this.pattern.name,
      this.paletteCode,
      this.imageProperties,
      this.scanlines
    )
  }

  cropPose(pose: AvatarPose): PatternPose {
    const patternFile: PatternFile = this.toPatternFile()
    const cropped: PatternFile = patternFile.crop(SPRITE_POSE_CROP_OPTIONS[pose.name])
    return new PatternPose(this.pattern, this.paletteCode, cropped.imageProperties, pose, cropped.buffer)
  }

  static fromPatternFile(pattern: PatternDescriptor, patternFile: PatternFile): PatternMaster {
    return new PatternMaster(pattern, patternFile.paletteCode, patternFile.imageProperties, patternFile.scanlines)
  }

  serialize(): SerializedPatternMaster {
    return {
      pattern: this.pattern,
      paletteCode: this.paletteCode,
      imageProperties: this.imageProperties,
      scanlines: this.scanlines,
    }
  }

  static deserialize(serialized: SerializedPatternMaster): PatternMaster {
    return new PatternMaster(
      serialized.pattern,
      serialized.paletteCode,
      serialized.imageProperties,
      serialized.scanlines
    )
  }
}
