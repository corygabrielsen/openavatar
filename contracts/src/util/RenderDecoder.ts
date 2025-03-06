type PngChunk = {
  type: string
  data: Uint8Array
}

type PngInfo = {
  width: number
  height: number
  bitDepth: number
}

export class RenderDecoder {
  public static decode(svgURI: string): { png: Buffer; hex: `0x${string}` } {
    const SVG_URI_PREFIX = 'data:image/svg+xml;base64,'
    if (!svgURI.startsWith(SVG_URI_PREFIX)) {
      throw new Error('invalid svg uri')
    }
    const svg: string = Buffer.from(svgURI.slice(SVG_URI_PREFIX.length), 'base64').toString('utf8')

    const base64Png: string = RenderDecoder.parsePngFromSvg(svg)
    const png: Buffer = Buffer.from(base64Png, 'base64')

    const { ihdr, idat } = RenderDecoder.readPngChunks(png)
    const { width, height, bitDepth } = RenderDecoder.parseIhdrChunk(ihdr)
    return { png, hex: RenderDecoder.decodeIdatChunk(idat[0], width, height) }
  }

  public static parsePngFromSvg(svgString: string): string {
    const regex = /<img[^>]*src="data:image\/png;base64,([^"]+)"/
    const match = regex.exec(svgString)
    if (!match) {
      throw new Error('invalid svg')
    }

    return match[1]
  }

  public static readPngChunks(pngData: Uint8Array): { ihdr: PngChunk; idat: PngChunk[] } {
    let pos = 8 // Skip the PNG file signature (8 bytes)

    const readUInt32 = () => {
      const value = (pngData[pos] << 24) | (pngData[pos + 1] << 16) | (pngData[pos + 2] << 8) | pngData[pos + 3]
      pos += 4
      return value
    }

    const readString = (length: number) => {
      const chars = []
      for (let i = 0; i < length; i++) {
        chars.push(String.fromCharCode(pngData[pos]))
        pos++
      }
      return chars.join('')
    }

    const ihdr: PngChunk = { type: '', data: new Uint8Array(0) }
    const idat: PngChunk[] = []

    while (pos < pngData.length) {
      const length = readUInt32()
      const type = readString(4)

      if (type === 'IHDR' && !ihdr.type) {
        ihdr.type = type
        ihdr.data = pngData.subarray(pos, pos + length)
      } else if (type === 'IDAT') {
        idat.push({ type, data: pngData.subarray(pos, pos + length) })
      } else if (type === 'IEND') {
        break
      }

      pos += length + 4 // Skip the chunk data and CRC (4 bytes)
    }

    return { ihdr, idat }
  }

  public static parseIhdrChunk(ihdrChunk: PngChunk): PngInfo {
    let pos = 0

    const readUInt32 = () => {
      const value =
        (ihdrChunk.data[pos] << 24) |
        (ihdrChunk.data[pos + 1] << 16) |
        (ihdrChunk.data[pos + 2] << 8) |
        ihdrChunk.data[pos + 3]
      pos += 4
      return value
    }

    const width = readUInt32()
    const height = readUInt32()
    const bitDepth = ihdrChunk.data[pos]

    return { width, height, bitDepth }
  }

  public static decodeIdatChunk(idatChunk: PngChunk, width: number, height: number): `0x${string}` {
    // first two bytes should be 0x78 0x01
    if (idatChunk.data[0] !== 0x78 || idatChunk.data[1] !== 0x01) {
      throw new Error('Invalid IDAT chunk')
    }
    // next should be the xlib block header 0x01
    if (idatChunk.data[2] !== 0x01) {
      throw new Error('Invalid IDAT chunk')
    }
    // next 4 bytes are LEN and NLEN
    const dataStart = 7
    // last 4 bytes are the adler32 checksum
    const dataEnd = idatChunk.data.length - 4

    const data: Uint8Array = idatChunk.data.slice(dataStart, dataEnd)

    // decompress the data

    const totalBytes = width * height * 4 + height
    if (totalBytes !== idatChunk.data.length - 7 - 4) {
      throw new Error(
        'Invalid IDAT chunk. Size does not match. Got ' + idatChunk.data.length + ' expected ' + totalBytes
      )
    }

    const widthBytes = width * 4
    const widthBytesPadded = widthBytes + 1
    const rgbaArray = new Uint8Array(width * height * 4)
    for (let y = 0; y < height; y++) {
      const rowStart = y * widthBytesPadded
      const filterByte = rowStart
      // should be 0x00
      if (data[filterByte] !== 0x00) {
        throw new Error('Invalid IDAT chunk: Filter byte should be 0x00. Got ' + idatChunk.data[filterByte])
      }
      let hexstring = '0x'
      for (let x = 0; x < width; x++) {
        const rowOffset = x * 4 + 1 // 1 for the filter byte
        const idatChunkIndex = rowStart + rowOffset
        const rgbaIndex = (y * width + x) * 4
        rgbaArray[rgbaIndex] = data[idatChunkIndex]
        rgbaArray[rgbaIndex + 1] = data[idatChunkIndex + 1]
        rgbaArray[rgbaIndex + 2] = data[idatChunkIndex + 2]
        rgbaArray[rgbaIndex + 3] = data[idatChunkIndex + 3]
        hexstring += data[idatChunkIndex].toString(16).padStart(2, '0')
        hexstring += data[idatChunkIndex + 1].toString(16).padStart(2, '0')
        hexstring += data[idatChunkIndex + 2].toString(16).padStart(2, '0')
        hexstring += data[idatChunkIndex + 3].toString(16).padStart(2, '0')
      }
      // console.log(hexstring)
    }

    let hexstring: `0x${string}` = `0x`
    for (let j = 0; j < rgbaArray.length; j++) {
      hexstring += rgbaArray[j].toString(16).padStart(2, '0')
    }

    return hexstring
  }
}
