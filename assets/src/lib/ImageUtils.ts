import { ColorCode, ImageProperties } from './ImageProperties'

export interface CropOptions {
  x: number
  y: number
  width: number
  height: number
}

export function crop(
  imageProperties: ImageProperties,
  imageData: Uint8Array,
  cropOptions: CropOptions
): [ImageProperties, Uint8Array] {
  // code to crop the texture
  const data = new Uint8Array(cropOptions.width * cropOptions.height * imageProperties.colorFormat.bytesPerPixel)
  // traverse the texture and copy the pixels within the crop region to the new texture

  // scanlines
  for (let y = 0; y < cropOptions.height; y++) {
    // pixels
    for (let x = 0; x < cropOptions.width; x++) {
      // color channels
      for (let c = 0; c < imageProperties.colorFormat.channels; c++) {
        // Calculate the index and newIndex for each pixel within the crop region
        //  _________________
        //  |_|_|_|_|_|_|_|_|
        //  |_|_|_|_|_|_|_|_|        _________
        //  |_|_|_|_|_|_|_|_|        |_|_|_|_|
        //  |_|_|_|_|_|_|_|_|  --->  |_|_|_|_|
        //  |_|_|_|_|_|_|_|_|        |_|_|_|_|
        //  |_|_|_|_|_|_|_|_|        |_|_|_|_|
        //  |_|_|_|_|_|_|_|_|
        //
        // The original image has `this.width` columns and `this.height` rows.
        // The index of a pixel at column `x` and row `y` is calculated as:
        //   index = y * this.width + x
        //
        // The cropped image has `options.width` columns and `options.height` rows.
        // The index of a pixel at column `x` and row `y` is calculated as:
        //   newIndex = y * options.width + x
        //
        // When copying the pixels from the original image to the cropped image, we must also
        // take into account the number of color channels and bytes per pixel:
        const index =
          ((y + cropOptions.y) * imageProperties.size.width + (x + cropOptions.x)) *
            imageProperties.colorFormat.bytesPerPixel +
          c
        const newIndex = (y * cropOptions.width + x) * imageProperties.colorFormat.bytesPerPixel + c
        data[newIndex] = imageData[index]
      }
    }
  }
  return [
    { size: { width: cropOptions.width, height: cropOptions.height }, colorFormat: imageProperties.colorFormat },
    data,
  ]
}

export interface PixelInput {
  imageProperties: ImageProperties
  imageData: Uint8Array
  x: number
  y: number
}

/**
 * Gets the color of the pixel at the specified (x, y) position.
 *
 * @param imageProperties - The properties of the image.
 * @param imageData - The image data.
 * @param x - The x-coordinate of the pixel.
 * @param y - The y-coordinate of the pixel.
 * @returns The color of the pixel in hexadecimal format.
 */
export function pixel({ imageProperties, imageData, x, y }: PixelInput): ColorCode {
  const index = (x + y * imageProperties.size.width) * imageProperties.colorFormat.bytesPerPixel
  const color: Uint8Array = imageData.slice(index, index + imageProperties.colorFormat.bytesPerPixel)
  return imageProperties.colorFormat.toHex(color)
}

export interface PixelIndirectInput {
  x: number
  y: number
  width: number
  patternData: Uint8Array
  palette: ColorCode[]
}

/**
 * Gets the color of the pixel at the specified (x, y) position.
 * This function is used to get the color of a color-coded image.
 *
 * @param x - The x-coordinate of the pixel.
 * @param y - The y-coordinate of the pixel.
 * @param width - The width of the image.
 * @param patternData - The image data.
 * @param palette - The palette of the image.
 * @returns The color of the pixel in hexadecimal format.
 * @throws An error if the pixel is out of bounds.
 */
export function pixelIndirect({ x, y, width, patternData, palette }: PixelIndirectInput): ColorCode {
  // Get the index of the pixel in the grayscale image
  // Note: We don't need to know the height of the image because the index is calculated from the width
  const index: number = y * width + x
  if (index >= patternData.length) {
    throw new Error(
      `patternData[${x}][${y}] => paletteIndex=${index} but palette has length ${palette.length}: ${palette}`
    )
  }

  // Get the color code from the grayscale image
  // this is the pixel # in the palette
  // e.g. if the pixel is 0x12 then the color is the 18th color in the palette
  const colorCodeIndex: number = patternData[index]

  // Get the color from the palette
  // Note: we don't need to know the color format because the palette is already in hex format
  return palette[colorCodeIndex]
}

/**
 * Converts the image data to a palette-based image.
 *
 * @param imageProperties - The properties of the image.
 * @param imageData - The image data.
 * @returns The palette-based image data and the palette.
 **/
export function indexColors(imageProperties: ImageProperties, imageData: Uint8Array): [Uint8Array, ColorCode[]] {
  const channels = imageProperties.colorFormat.channels
  const w = imageProperties.size.width
  const h = imageProperties.size.height

  // 0. The transparent color is always the first color in the palette
  const transparentColorCode = ('#' + '00'.repeat(channels)) as ColorCode
  const palette: ColorCode[] = [transparentColorCode]

  // 1. Loop over the pixels and determine the unique colors
  // palette formed by going from top to bottom, left to right
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const colorHex: ColorCode = pixel({ imageProperties, imageData, x: i, y: j })
      if (!palette.includes(colorHex)) {
        palette.push(colorHex)
      }
    }
  }
  // should be 256 colors max
  const maxColorsAllowed = Math.pow(2, imageProperties.colorFormat.bitsPerChannel)
  if (palette.length > maxColorsAllowed) {
    // print to console in bold yellow using ASCII escape codes
    throw new Error(`Too many colors in palette: ${palette.length}/${maxColorsAllowed}`)
  }

  // 2. Rewrite the file as follows:
  // traverse the image from top to bottom, left to right
  // Write N bytes per color index, where N is the number of bytes per channel
  // [0] := transparent color code (always the zero-th color)
  // [1] := first  non-transparent pixel color code
  // [2] := second non-transparent pixel color code
  // etc.

  // Create a new array of pixels with the new color code indices
  const indexedColorCodes: Uint8Array = new Uint8Array(w * h)
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const color: ColorCode = pixel({ imageProperties, imageData, x: i, y: j })
      // the grayscale pixel value is the index of the color in the palette
      const colorIndex: number = palette.indexOf(color)
      if (colorIndex < 0) {
        throw new Error(`[${i}][${j}] Color not found in palette`)
      } else if (colorIndex > maxColorsAllowed) {
        // this branch should be impossible
        let msg = `[${i}][${j}] Color index ${colorIndex} is greater than the maximum allowed: ${maxColorsAllowed}`
        msg += ` due to ${imageProperties.colorFormat.bitsPerChannel} bits per channel`
        throw new Error(msg)
      }
      indexedColorCodes[i + j * w] = colorIndex
    }
  }

  return [indexedColorCodes, palette]
}

/**
 * Converts the color code to a Uint8Array.
 *
 * @param colorHex - The color code in hexadecimal format.
 */
function hexToBytes(colorCode: ColorCode): Uint8Array {
  if (!colorCode || !colorCode.startsWith('#')) {
    throw new Error(`Invalid color code: ${colorCode}`)
  }
  const colorCodeHex = colorCode.slice(1)
  const color: Uint8Array = new Uint8Array(colorCodeHex.length / 2)
  for (let i = 0; i < color.length * 2; i += 2) {
    color[i / 2] = parseInt(colorCodeHex.slice(i, i + 2), 16)
  }
  return color
}

/**
 * Converts the palette-based image data to a color image.
 *
 * @param patternData - The palette-based image data.
 * @param palette - The palette.
 * @returns The color image data.
 * @throws An error if the pattern or palette is empty.
 */
export function deindexColors(patternData: Uint8Array, palette: ColorCode[]): Uint8Array {
  if (patternData.length === 0) {
    throw new Error('Pattern data is empty')
  }
  if (palette.length === 0) {
    throw new Error('Palette is empty')
  }
  const bytesPerPixel = (palette[0].length - 1) / 2
  if (patternData.length % bytesPerPixel !== 0) {
    throw new Error(`Pattern data length ${patternData.length} is not divisible by ${bytesPerPixel}`)
  }

  const imageData: Uint8Array = new Uint8Array(patternData.length * bytesPerPixel)
  for (let i = 0; i < patternData.length; i++) {
    const lookup: number = patternData[i]
    const colorCode: ColorCode = palette[lookup]
    if (!colorCode) {
      console.error(`Palette: ${palette}`)
      throw new Error(`Color code not found in palette: ${lookup}`)
    }
    const colorBytes: Uint8Array = hexToBytes(colorCode)
    // Set the color bytes in the image data
    const offset: number = i * colorBytes.length
    imageData.set(colorBytes, offset)
  }
  return imageData
}

export function overlay8bit(
  imageProperties: ImageProperties,
  imageData: Uint8Array,
  overlay: Uint8Array
): [ImageProperties, Uint8Array] {
  // 1a. Validate that the image properties are 8bit
  if (imageProperties.colorFormat.bitsPerChannel !== 8) {
    throw new Error(`Image properties are not 8bit: ${imageProperties.colorFormat.bitsPerChannel}`)
  }
  // 1b. Validate that there is an alpha layer in the image (else the overlay is meaningless)
  if (imageProperties.colorFormat.channels !== 4) {
    throw new Error(`Image properties does not have an alpha layer: ${imageProperties.colorFormat.channels}`)
  }
  // 1c. validate that the overlay is the same size as the image
  const w = imageProperties.size.width
  const h = imageProperties.size.height
  const channels = imageProperties.colorFormat.channels
  if (overlay.length !== w * h * channels) {
    throw new Error(`Overlay size ${overlay.length} does not match image size ${w}x${h}`)
  }

  // 2a. Alloc the output data array
  const outputData: Uint8Array = new Uint8Array(imageData.length)

  // 2b. Loop over the pixels and overlay the image
  //    If a pixel has alpha value 0x00 then it is transparent
  //    If a pixel has alpha value 0xFF then it is opaque
  //    If a pixel has any other alpha value, it is unsupported and throw an error
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      // the pixel
      const px = i + j * w
      // the index will be the pixel multiplied by the number of bytesPerPixel
      const index = px * imageProperties.colorFormat.bytesPerPixel
      const alpha = overlay[index + 3]
      if (alpha === 0xff) {
        // opaque pixel -> copy the overlay pixel
        outputData[index] = overlay[index]
        outputData[index + 1] = overlay[index + 1]
        outputData[index + 2] = overlay[index + 2]
        outputData[index + 3] = overlay[index + 3]
      } else if (alpha === 0x00) {
        // transparent pixel -> take the original pixel
        outputData[index] = imageData[index]
        outputData[index + 1] = imageData[index + 1]
        outputData[index + 2] = imageData[index + 2]
        outputData[index + 3] = imageData[index + 3]
      } else {
        throw new Error(`Unsupported alpha value: ${alpha}`)
      }
    }
  }

  return [imageProperties, outputData]
}
