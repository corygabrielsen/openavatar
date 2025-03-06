import { expect } from 'chai'
import { PNGData, PNGDecoder, PNGEncoder } from '../src/lib/PNG'

const WIDTH = 2
const HEIGHT = 2
const ALPHA = true
const RAW_DATA_2x2_1 = new Uint8Array([
  0xff,
  0x00,
  0x00,
  0xff, // Red
  0x00,
  0xff,
  0x00,
  0xff, // Green
  0x00,
  0x00,
  0xff,
  0xff, // Blue
  0xff,
  0xff,
  0xff,
  0xff, // White
])
const RAW_DATA_2x2_2: Buffer = Buffer.from('0x000000FF111111FF222222FF333333FF'.slice(2), 'hex')

describe('PNG', function () {
  describe('encodePNG', function () {
    it('Should throw an error if the data length is incorrect', function () {
      expect(() => PNGEncoder.encode(new Uint8Array([0xff, 0x00, 0x00]), WIDTH, HEIGHT, ALPHA)).to.throw(
        'Invalid image data length'
      )
    })

    function testEncodeDecode(buffer: Uint8Array, width: number, height: number, alpha: boolean) {
      const encoded: Uint8Array = PNGEncoder.encode(buffer, width, height, alpha)
      expect(encoded).to.be.instanceOf(Uint8Array)

      // Check the PNG signature
      expect(encoded.subarray(0, 8)).to.deep.equal(PNGEncoder.SIGNATURE)

      // check the IEND
      expect(encoded.subarray(encoded.length - 12, encoded.length)).to.deep.equal(PNGEncoder.IEND)

      // decode
      const decoded: PNGData = new PNGDecoder().decode(encoded)
      expect(decoded.width).to.equal(width)
      expect(decoded.height).to.equal(height)
      expect(decoded.alpha).to.equal(alpha)
      expect(decoded.data).to.deep.equal(buffer)
    }

    it('Should encode a PNG image from raw image data', function () {
      testEncodeDecode(RAW_DATA_2x2_1, WIDTH, HEIGHT, ALPHA)
      testEncodeDecode(RAW_DATA_2x2_2, WIDTH, HEIGHT, ALPHA)
    })

    function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
      let r = 0,
        g = 0,
        b = 0

      let i = Math.floor(h * 6)
      let f = h * 6 - i
      let p = v * (1 - s)
      let q = v * (1 - f * s)
      let t = v * (1 - (1 - f) * s)

      switch (i % 6) {
        case 0:
          r = v
          g = t
          b = p
          break
        case 1:
          r = q
          g = v
          b = p
          break
        case 2:
          r = p
          g = v
          b = t
          break
        case 3:
          r = p
          g = q
          b = v
          break
        case 4:
          r = t
          g = p
          b = v
          break
        case 5:
          r = v
          g = p
          b = q
          break
      }

      return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)]
    }

    function makeRainbowData(width: number, height: number, alpha: boolean): Uint8Array {
      const data: Uint8Array = new Uint8Array(width * height * (alpha ? 4 : 3))
      let idx = 0
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let hue = x / width
          let saturation = y / height
          let value = 1.0 // max value

          const [r, g, b] = hsvToRgb(hue, saturation, value)

          data[idx++] = r
          data[idx++] = g
          data[idx++] = b
          if (alpha) {
            data[idx++] = 255 // max alpha
          }
        }
      }
      return data
    }

    const sizes = [1, 2, 4, 8, 16, 32, 64, 128, 256]

    for (const width of sizes) {
      for (const height of sizes) {
        it(`Should be able to encode/encode a ${width}x${height} PNG`, async function () {
          // Create a 1000x1000 pixel image filled with deterministic noisy data
          const alpha = true
          const rawData = makeRainbowData(width, height, alpha)
          testEncodeDecode(rawData, width, height, alpha)
        })
      }
    }

    it('Should handle images large enough to require multiple deflate blocks', async function () {
      // Create a 1000x1000 pixel image filled with deterministic noisy data
      const width = 1000
      const height = 1000
      const alpha = true
      const rawData = makeRainbowData(width, height, alpha)
      testEncodeDecode(rawData, width, height, alpha)
    })
  })
})
