import { Adler32 } from './Adler32'
import { CRC32 } from './CRC32'

export class PNGEncoder {
  /**
   * The PNG signature is a fixed eight-byte sequence:
   * 89 50 4e 47 0d 0a 1a 0a
   */
  public static readonly SIGNATURE: Uint8Array = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  /**
   * The IEND chunk marks the end of the PNG datastream.
   * It contains no data.
   *
   * The IEND chunk must appear last.
   * It is an error to place any data after the IEND chunk.
   *
   * The IEND chunk is always equal to 12 bytes
   * 00 00 00 00 49 45 4e 44 ae 42 60 82
   */
  public static readonly IEND: Uint8Array = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ])

  /**
   * @notice Encodes a PNG image from raw image data
   * @param data Raw image data
   * @param width  The width of the image, in pixels
   * @param height The height of the image, in pixels
   * @param alpha  Whether the image has an alpha channel
   * @return PNG image
   */
  public static encode(data: Uint8Array, width: number, height: number, alpha: boolean): Uint8Array {
    // Determine the width of each pixel
    const pixelWidth = alpha ? 4 : 3

    // Check that the length of the data is correct
    if (data.length !== pixelWidth * width * height) {
      throw new Error('Invalid image data length')
    }
    const chunkIHDR: Uint8Array = PNGEncoder.encodeIHDR(width, height, alpha)
    const chunkIDAT: Uint8Array = PNGEncoder.encodeIDAT(data, width, height, alpha)
    const result = new Uint8Array(
      PNGEncoder.SIGNATURE.length + chunkIHDR.length + chunkIDAT.length + PNGEncoder.IEND.length
    )
    result.set(PNGEncoder.SIGNATURE, 0)
    result.set(chunkIHDR, PNGEncoder.SIGNATURE.length)
    result.set(chunkIDAT, PNGEncoder.SIGNATURE.length + chunkIHDR.length)
    result.set(PNGEncoder.IEND, PNGEncoder.SIGNATURE.length + chunkIHDR.length + chunkIDAT.length)

    return result
  }

  /**
   * Generates an IHDR chunk for a PNG image with the given width and height.
   *
   * @param width The width of the image.
   * @param height The height of the image.
   * @param alpha Whether the image has alpha transparency.
   * @return A bytes memory array containing the IDAT chunk data.
   *
   * @dev This function generates an IHDR chunk according to the PNG specification
   * (http://libpng.org/pub/png/spec/1.2/PNG-Chunks.html#C.IHDR).
   */
  public static encodeIHDR(width: number, height: number, alpha: boolean): Uint8Array {
    // Create the IHDR chunk
    // The IHDR type 49 48 44 52 (IHDR)
    //
    // The IHDR chunk data consists of the following fields:
    // 4 bytes: width
    // 4 bytes: height
    // 1 byte: bit depth (8)
    // 1 byte: color type (2 for RGB, 6 for RGBA)
    // 1 byte: compression method (0)
    // 1 byte: filter method (0)
    // 1 byte: interlace method (0)
    const chunkIHDR = new Uint8Array([
      // The IHDR chunk length is 13 bytes (0x0000000d in hex)
      0x00,
      0x00,
      0x00,
      0x0d,
      // The IHDR type 49 48 44 52 (IHDR)
      0x49,
      0x48,
      0x44,
      0x52,
      // 4 bytes: width
      0x00,
      0x00,
      0x00,
      0x00,
      // 4 bytes: height
      0x00,
      0x00,
      0x00,
      0x00,
      // 1 byte: bit depth (8)
      0x08,
      // 1 byte: color type (2 for RGB, 6 for RGBA)
      alpha ? 0x06 : 0x02,
      // 1 byte: compression method (0)
      0x00,
      // 1 byte: interlace method (0)
      0x00,
      // 1 byte: filter method (0)
      0x00,
      // 4 bytes: CRC32 checksum
      0x00,
      0x00,
      0x00,
      0x00,
    ])

    // Set the width and height of the image in the chunk data
    chunkIHDR[8] = (width >> 24) & 0xff
    chunkIHDR[9] = (width >> 16) & 0xff
    chunkIHDR[10] = (width >> 8) & 0xff
    chunkIHDR[11] = width & 0xff
    chunkIHDR[12] = (height >> 24) & 0xff
    chunkIHDR[13] = (height >> 16) & 0xff
    chunkIHDR[14] = (height >> 8) & 0xff
    chunkIHDR[15] = height & 0xff

    // Set the color type of the image in the chunk data
    if (alpha) {
      // truecolor image with alpha channel
      chunkIHDR[17] = 0x06
    } else {
      // truecolor image without alpha channel
      chunkIHDR[17] = 0x02
    }

    // Calculate and set the CRC32 checksum of the chunk
    const checksum = CRC32.crc32(new DataView(chunkIHDR.buffer), 4, 21)
    chunkIHDR[21] = (checksum >> 24) & 0xff
    chunkIHDR[22] = (checksum >> 16) & 0xff
    chunkIHDR[23] = (checksum >> 8) & 0xff
    chunkIHDR[24] = checksum & 0xff

    return chunkIHDR
  }

  /**
   * Interlaces a given bytes array of image data.
   * @param data The bytes array of image data.
   * @param width The width of the image, in pixels.
   * @param height The height of the image, in pixels.
   * @param alpha Whether the image has an alpha channel.
   * @return The interlaced bytes array.
   */
  private static interlace(data: Uint8Array, width: number, height: number, alpha: boolean): Uint8Array {
    let pixelWidth: number = alpha ? 4 : 3

    const rowWidth = pixelWidth * width
    const rowWidthPadded = rowWidth + 1
    const interlacedData = new Uint8Array(rowWidthPadded * height)

    // Loop over the scanlines.
    for (let row = 0; row < height; row++) {
      // Calculate the starting index for the current scanline.
      const startIndex = rowWidthPadded * row

      // Set the filter type byte for the current scanline.
      interlacedData[startIndex] = 0x00 // Filter type 0 (no filtering)

      // Copy the scanline data into the interlaced data array.
      // No filtering is used, so the scanline data starts at index 1.
      for (let j = 0; j < rowWidth; j++) {
        interlacedData[startIndex + 1 + j] = data[row * rowWidth + j]
      }
    }
    return interlacedData
  }

  /**
   * Generates a zlib-compressed version of the given image data using the Deflate algorithm.
   *
   * @param data The image data to be compressed.
   * @param width The width of the image, in pixels.
   * @param height The height of the image, in pixels.
   * @param alpha Whether the image has alpha transparency.
   * @return A bytes array containing the zlib-compressed image data.
   *
   * @dev This function generates a zlib-compressed version of the given image data using the Deflate algorithm,
   * as specified in the PNG specification (http://www.libpng.org/pub/png/spec/1.2/PNG-Compression.html).
   * The resulting data is suitable for storage in an IDAT chunk of a PNG file.
   */
  private static zlibDEFLATE(data: Uint8Array, width: number, height: number, alpha: boolean): Uint8Array {
    const MAX_BLOCK_SIZE = 32768
    // subtract off zlib block header
    const BLOCK_HEADER_SIZE = 5
    const BLOCK_FOOTER_SIZE = 4
    const MAX_BLOCK_DATA_SIZE = MAX_BLOCK_SIZE - BLOCK_HEADER_SIZE - BLOCK_FOOTER_SIZE

    const rowWidth = width * (alpha ? 4 : 3)
    const interlacedData: Uint8Array = PNGEncoder.interlace(data, width, height, alpha)
    if (interlacedData.length !== data.length + height) {
      throw new Error('Interlaced data length does not match expected length')
    }
    const interlacedRowWidth = rowWidth + 1
    const maxRowsFitInBlock = Math.floor(MAX_BLOCK_DATA_SIZE / interlacedRowWidth)
    const sourceDataBytesPerZlibBlock = maxRowsFitInBlock * interlacedRowWidth

    // Split data into blocks of size sourceDataBytesPerZlibBlock
    let blocks = []
    let i = 0
    while (i < interlacedData.length) {
      blocks.push(interlacedData.slice(i, i + sourceDataBytesPerZlibBlock))
      i += sourceDataBytesPerZlibBlock
    }

    // Generate zlib-compressed data for each block
    let result = new Uint8Array(2) // Start with zlib header
    result[0] = 0x78 // CM = 8 (deflate), CINFO = 7 (32K window size)
    result[1] = 0x01 // FCHECK = 0 (no check), FDICT = 0 (no preset dictionary), FLEVEL = 0 (fastest compression)

    for (let j = 0; j < blocks.length; j++) {
      let block = blocks[j]
      let len: number = block.length
      let zlibBlockHeader: Uint8Array = new Uint8Array([j === blocks.length - 1 ? 0x01 : 0x00]) // BFINAL = 1 for last block, 0 for others
      let blockResult = new Uint8Array(zlibBlockHeader.length + 4 + block.length)
      blockResult.set(zlibBlockHeader, 0) // block header (BFINAL, BTYPE = 0)
      blockResult[1] = len & 0xff
      blockResult[2] = (len >> 8) & 0xff
      blockResult[3] = ~len & 0xff
      blockResult[4] = ~(len >> 8) & 0xff
      blockResult.set(block, 5) // Block data
      result = PNGEncoder.concatenateUint8Arrays(result, blockResult) // Concatenate this block to the result
    }

    // Compute Adler-32 checksum for the entire uncompressed data and append it to the end
    let checksum: number = Adler32.adler32(interlacedData, 0, interlacedData.length)
    let checksumBytes = new Uint8Array([
      (checksum >> 24) & 0xff,
      (checksum >> 16) & 0xff,
      (checksum >> 8) & 0xff,
      checksum & 0xff,
    ])
    result = PNGEncoder.concatenateUint8Arrays(result, checksumBytes)

    return result
  }

  private static concatenateUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
    let result = new Uint8Array(a.length + b.length)
    result.set(a, 0)
    result.set(b, a.length)
    return result
  }

  /**
   * Generates an IDAT chunk for a PNG image with the given width and height.
   *
   * @param data The filtered image data.
   * @param width The width of the image.
   * @param height The height of the image.
   * @param alpha Whether the image has alpha transparency.
   * @return A bytes memory array containing the IDAT chunk data.
   *
   * @dev This function generates an IDAT chunk according to the PNG specification
   * (http://www.libpng.org/pub/png/spec/1.2/PNG-Filters.html).
   */
  private static encodeIDAT(data: Uint8Array, width: number, height: number, alpha: boolean): Uint8Array {
    // The IDAT data is compressed using the deflate algorithm.
    const compressed = PNGEncoder.zlibDEFLATE(data, width, height, alpha)

    // The compressed data stream is then stored in the IDAT chunk.
    const chunkType = new Uint8Array([0x49, 0x44, 0x41, 0x54]) // Chunk type: "IDAT" in ASCII
    const typedata = new Uint8Array([...chunkType, ...compressed])

    // CRC calculated from the chunk type and chunk data
    const crc = CRC32.crc32(new DataView(typedata.buffer), 0, typedata.length)

    // Construct the IDAT chunk
    const length = new Uint8Array(4)
    const dataView = new DataView(length.buffer)
    dataView.setUint32(0, compressed.length, false)

    const crcArray = new Uint8Array(4)
    const crcDataView = new DataView(crcArray.buffer)
    crcDataView.setUint32(0, crc, false)

    // Append the CRC32 checksum to the end of the chunk
    return new Uint8Array([...length, ...typedata, ...crcArray])
  }
}

export type PNGData = {
  width: number
  height: number
  alpha: boolean
  data: Uint8Array
}

export type IHDRData = {
  width: number
  height: number
  bitDepth: number
  colorType: number
  compressionMethod: number
  filterMethod: number
  interlaceMethod: number
}

function readUInt32(dataView: DataView, offset: number): number {
  return dataView.getUint32(offset, false) // PNG uses big-endian
}

function arrayEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export class PNGDecoder {
  private readonly textDecoder: TextDecoder
  private readonly prealloc: Uint8Array

  constructor() {
    this.textDecoder = new TextDecoder()
    this.prealloc = new Uint8Array(4)
  }

  private readChunkType(dataView: DataView, offset: number): string {
    this.prealloc[0] = dataView.getUint8(offset)
    this.prealloc[1] = dataView.getUint8(offset + 1)
    this.prealloc[2] = dataView.getUint8(offset + 2)
    this.prealloc[3] = dataView.getUint8(offset + 3)
    return this.textDecoder.decode(this.prealloc)
  }

  private decodeIHDR(dataView: DataView): IHDRData {
    if (dataView.byteLength !== 25) {
      throw new Error('IHDR chunk must have length 25')
    }

    // Here we use the readUInt32 and readByte functions
    // Note that we need to add 4 to the offset for each subsequent read, because each value is 4 bytes long
    const chunkLength = readUInt32(dataView, 0)
    if (chunkLength !== 13) {
      throw new Error('IHDR chunk must have length 13 but has length ' + chunkLength)
    }
    const chunkType = this.readChunkType(dataView, 4)
    if (chunkType !== 'IHDR') {
      throw new Error('IHDR chunk must have type "IHDR"' + ' but has type "' + chunkType + '"')
    }
    const width = readUInt32(dataView, 8)
    const height = readUInt32(dataView, 12)
    const bitDepth = dataView.getUint8(16)
    const colorType = dataView.getUint8(17)
    const compressionMethod = dataView.getUint8(18)
    const filterMethod = dataView.getUint8(19)
    const interlaceMethod = dataView.getUint8(20)
    const crc = readUInt32(dataView, 21)
    if (crc !== CRC32.crc32(dataView, 4, 21)) {
      throw new Error('IHDR chunk has invalid CRC')
    }

    // Here we return the values as an object
    return {
      width,
      height,
      bitDepth,
      colorType,
      compressionMethod,
      filterMethod,
      interlaceMethod,
    }
  }

  public decode(buffer: Uint8Array): PNGData {
    // const buffer: Buffer = png instanceof Buffer ? png : Buffer.from(png)
    // The PNG signature is stored in the first 8 bytes of the file
    if (!arrayEquals(buffer.subarray(0, 8), PNGEncoder.SIGNATURE)) {
      throw new Error('Invalid PNG signature')
    }

    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    let offset = 8

    // The IHDR chunk should start at byte 8
    const ihdrView: DataView = new DataView(buffer.buffer, buffer.byteOffset + offset, 25)
    const ihdr = this.decodeIHDR(ihdrView)
    offset += 25
    const alpha: boolean = (ihdr.colorType & 4) !== 0

    // The IDAT chunk should start next
    const idatChunkLength: number = view.getUint32(offset, false)
    const idatView: DataView = new DataView(buffer.buffer, buffer.byteOffset + offset, idatChunkLength + 12)
    const idat = this.decodeIDAT(idatView, ihdr.width, ihdr.height, alpha)
    offset += idatChunkLength + 12 // 4 for chunk length, 4 for chunk type, 4 for CRC

    // The IEND chunk should start next
    const iendView: DataView = new DataView(buffer.buffer, buffer.byteOffset + offset, 12)
    this.decodeIEND(iendView)

    return {
      data: idat,
      width: ihdr.width,
      height: ihdr.height,
      alpha,
    }
  }

  private decodeIDAT(dataView: DataView, width: number, height: number, alpha: boolean): Uint8Array {
    this.validateChunkAndCrc(dataView)

    let dataBlocks: Uint8Array[] = this.decompressDataBlocks(dataView, 8)

    return this.deinterlaceDataBlocks(dataBlocks, width, height, alpha)
  }

  private validateChunkAndCrc(dataView: DataView): void {
    const chunkLength = readUInt32(dataView, 0)
    if (chunkLength > dataView.byteLength - 12) {
      throw new Error('IDAT chunk length is too large')
    }
    const chunkType = this.readChunkType(dataView, 4)
    if (chunkType !== 'IDAT') {
      throw new Error('IDAT chunk must have type "IDAT"')
    }
    const crc = readUInt32(dataView, 8 + chunkLength)
    if (crc !== CRC32.crc32(dataView, 4, 8 + chunkLength)) {
      throw new Error('IDAT chunk has invalid CRC')
    }
  }

  private decompressDataBlocks(dataView: DataView, offset: number): Uint8Array[] {
    let dataBlocks: Uint8Array[] = []

    // in encoder we have:
    //   let result = new Uint8Array(2) // Start with zlib header
    //   result[0] = 0x78 // CM = 8 (deflate), CINFO = 7 (32K window size)
    //   result[1] = 0x01 // FCHECK = 0 (no check), FDICT = 0 (no preset dictionary), FLEVEL = 0 (fastest compression)

    const zlibHeader0 = dataView.getUint8(offset)
    const zlibHeader1 = dataView.getUint8(offset + 1)
    if (zlibHeader0 !== 0x78 || zlibHeader1 !== 0x01) {
      throw new Error('Invalid zlib header bits: ' + zlibHeader0 + ' ' + zlibHeader1)
    }
    // Process each zlib block
    offset += 2

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let header = dataView.getUint8(offset)
      offset++
      let bfinal = header & 0x01 // Extract BFINAL bit
      let btype = (header & 0x06) >> 1 // Extract BTYPE bits
      if (btype !== 0) {
        throw new Error('Unsupported BTYPE: ' + btype)
      }

      let len = dataView.getUint16(offset, true) // Read LEN (2 bytes, little-endian)
      let nlen = dataView.getUint16(offset + 2, true) // Read NLEN (2 bytes, little-endian)
      offset += 4

      // Validate that NLEN is one's complement of LEN
      if (len !== (~nlen & 0xffff)) {
        throw new Error('LEN and NLEN do not match')
      }

      // LEN value can now be used to read the block data

      let blockData = new Uint8Array(dataView.buffer, dataView.byteOffset + offset, len)
      dataBlocks.push(blockData)

      offset += blockData.byteLength

      if (bfinal === 1) {
        break
      }
    }

    return dataBlocks
  }

  private deinterlaceDataBlocks(dataBlocks: Uint8Array[], width: number, height: number, alpha: boolean): Uint8Array {
    const rowWidth = width * (alpha ? 4 : 3)
    const interlacedRowWidth = 1 + rowWidth
    let deinterlaced = new Uint8Array(height * rowWidth)
    let di = 0

    for (let block of dataBlocks) {
      const numRows = block.length / interlacedRowWidth
      if (numRows !== Math.floor(numRows)) {
        throw new Error('Invalid interlaced block length')
      }
      // Each scanline starts with a filter type byte
      for (let y = 0; y < numRows; y++) {
        const yoffset = y * (1 + rowWidth)
        // filter type is first byte of scanline
        const filterType = block[yoffset]
        if (filterType !== 0) {
          throw new Error('Unsupported filter type: ' + filterType)
        }

        let i = yoffset + 1 // skip filter type byte
        // each scanline consists of width * (r,g,b[,a]) values
        for (let x = 0; x < width; x++) {
          deinterlaced[di++] = block[i++]
          deinterlaced[di++] = block[i++]
          deinterlaced[di++] = block[i++]
          if (alpha) {
            deinterlaced[di++] = block[i++]
          }
        }
      }
    }

    return deinterlaced
  }

  private decodeIEND(dataView: DataView): void {
    if (dataView.byteLength !== 12) {
      throw new Error('IEND chunk must have length 12 but has length ' + dataView.byteLength)
    }
    const iendChunkLength = readUInt32(dataView, 0)
    if (iendChunkLength !== 0) {
      throw new Error('IEND chunk must have length 0')
    }
    const iendChunkType = this.readChunkType(dataView, 4)
    if (iendChunkType !== 'IEND') {
      throw new Error('IEND chunk must have type "IEND"')
    }
    const iendCRC = readUInt32(dataView, 8)
    if (iendCRC !== CRC32.crc32(dataView, 4, 8)) {
      throw new Error('IEND chunk has invalid CRC')
    }
  }
}

export class PNG {
  public static readonly SIGNATURE = PNGEncoder.SIGNATURE
  public static readonly IEND = PNGEncoder.IEND
  private static readonly DECODER = new PNGDecoder()

  public static encode(data: Uint8Array, width: number, height: number, alpha: boolean): Uint8Array {
    return PNGEncoder.encode(data, width, height, alpha)
  }

  public static decode(buffer: Uint8Array): PNGData {
    return PNG.DECODER.decode(buffer)
  }
}
