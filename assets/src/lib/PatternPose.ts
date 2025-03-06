import { AvatarPose, PatternDescriptor } from '@openavatar/types'
import { ImageProperties } from './ImageProperties'
import { PatternBlob } from './PatternBlob'

export class PatternPose {
  constructor(
    public readonly pattern: PatternDescriptor,
    public readonly paletteCode: number,
    public readonly imageProperties: ImageProperties,
    public readonly pose: AvatarPose,
    public readonly buffer: Buffer
  ) {}

  trim(): PatternBlob {
    const buffer = this.buffer

    let firstNonZeroX: number = this.imageProperties.size.width - 1
    let firstNonZeroY: number = this.imageProperties.size.height - 1
    let lastNonZeroX: number = 0
    let lastNonZeroY: number = 0
    for (let y = 0; y < this.imageProperties.size.height; y++) {
      for (let x = 0; x < this.imageProperties.size.width; x++) {
        const i = y * 32 + x
        if (buffer[i].toString(16).padStart(2, '0') !== '00') {
          if (x < firstNonZeroX) {
            firstNonZeroX = x
          }
          if (x > lastNonZeroX) {
            lastNonZeroX = x
          }
          if (y < firstNonZeroY) {
            firstNonZeroY = y
          }
          if (y > lastNonZeroY) {
            lastNonZeroY = y
          }
        }
      }
    }
    // now we have the bounding box
    let width = lastNonZeroX - firstNonZeroX + 1
    let height = lastNonZeroY - firstNonZeroY + 1
    let offsetX = firstNonZeroX
    let offsetY = firstNonZeroY

    let trimmedBuffer: Buffer = Buffer.alloc(0)

    if (width > 0 && height > 0) {
      // now we need to copy the pixels into a new buffer
      trimmedBuffer = Buffer.alloc(width * height)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const newIndex = y * width + x
          const oldIndex = (y + offsetY) * this.imageProperties.size.width + (x + offsetX)
          trimmedBuffer[newIndex] = buffer[oldIndex]
        }
      }
    } else {
      // if the width or height is 0, then we need to return an empty buffer
      width = 0
      height = 0
      offsetX = 0
      offsetY = 0
    }

    const result: PatternBlob = {
      header: {
        width,
        height,
        offsetX,
        offsetY,
        paletteCode: this.paletteCode,
      },
      data: trimmedBuffer,
    }

    if (result.header.width < 0) {
      throw new Error(`width < 0: ${result.header.width}`)
    }
    if (result.header.height < 0) {
      throw new Error(`height < 0: ${result.header.height}`)
    }

    return result
  }
}
