import { expect } from 'chai'
import { ColorFormat, ImageProperties } from '../src/lib/ImageProperties'
import { Texture } from '../src/lib/Texture'

interface TestImage {
  imageData: Uint8Array
  imageProperties: ImageProperties
}

const RGB8_1x1: TestImage = {
  imageProperties: {
    size: {
      width: 1,
      height: 1,
    },
    colorFormat: ColorFormat.RGB8,
  },
  imageData: new Uint8Array([1, 2, 3]),
}

const RGBA8_1x1: TestImage = {
  imageProperties: {
    size: {
      width: 1,
      height: 1,
    },
    colorFormat: ColorFormat.RGBA8,
  },
  imageData: new Uint8Array([10, 11, 12, 13]),
}

const RGB8_1x2: TestImage = {
  imageProperties: {
    size: {
      width: 1,
      height: 2,
    },
    colorFormat: ColorFormat.RGB8,
  },
  imageData: new Uint8Array([1, 2, 3, 4, 5, 6]),
}

const RGBA8_1x2: TestImage = {
  imageProperties: {
    size: {
      width: 1,
      height: 2,
    },
    colorFormat: ColorFormat.RGBA8,
  },
  imageData: new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17]),
}

const RGB8_2x1: TestImage = {
  imageProperties: {
    size: {
      width: 2,
      height: 1,
    },
    colorFormat: ColorFormat.RGB8,
  },
  imageData: new Uint8Array([1, 2, 3, 4, 5, 6]),
}

const RGBA8_2x1: TestImage = {
  imageProperties: {
    size: {
      width: 2,
      height: 1,
    },
    colorFormat: ColorFormat.RGBA8,
  },
  imageData: new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17]),
}

const RGB8_2x2: TestImage = {
  imageProperties: {
    size: {
      width: 2,
      height: 2,
    },
    colorFormat: ColorFormat.RGB8,
  },
  imageData: new Uint8Array([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]),
}

const RGBA8_2x2: TestImage = {
  imageProperties: {
    size: {
      width: 2,
      height: 2,
    },
    colorFormat: ColorFormat.RGBA8,
  },
  imageData: new Uint8Array([40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]),
}

const RGB8_3x3: TestImage = {
  imageProperties: {
    size: {
      width: 3,
      height: 3,
    },
    colorFormat: ColorFormat.RGB8,
  },
  imageData: new Uint8Array([
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
  ]),
}

const RGBA8_3x3: TestImage = {
  imageProperties: {
    size: {
      width: 3,
      height: 3,
    },
    colorFormat: ColorFormat.RGBA8,
  },
  imageData: new Uint8Array([
    100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
    123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135,
  ]),
}

function hex(a: number[]) {
  return '#' + a.map((x) => x.toString(16).padStart(2, '0')).join('')
}

describe('Texture', function () {
  describe('Error Cases', function () {
    it('Should not be able to create Texture with negative height', function () {
      expect(() => {
        new Texture(
          {
            size: {
              width: 1,
              height: -1,
            },
            colorFormat: ColorFormat.RGB8,
          },
          new Uint8Array(3)
        )
      }).to.throw()
    })
    it('Should not be able to create Texture with negative width', function () {
      expect(() => {
        new Texture(
          {
            size: {
              width: -1,
              height: 1,
            },
            colorFormat: ColorFormat.RGB8,
          },
          new Uint8Array(3)
        )
      }).to.throw()
    })
    it('Should not be able to create Texture with 0 height', function () {
      expect(() => {
        new Texture(
          {
            size: {
              width: 1,
              height: 0,
            },
            colorFormat: ColorFormat.RGB8,
          },
          new Uint8Array(0)
        )
      }).to.throw()
    })

    it('Should not be able to create Texture with 0 width', function () {
      expect(() => {
        new Texture(
          {
            size: {
              width: 0,
              height: 1,
            },
            colorFormat: ColorFormat.RGB8,
          },
          new Uint8Array(0)
        )
      }).to.throw()
    })

    it('Should not be able to create Texture with inconsistent length', function () {
      const a = RGB8_1x1
      const b = RGB8_2x2
      expect(() => {
        new Texture(a.imageProperties, b.imageData)
      }).to.throw()
      expect(() => {
        new Texture(b.imageProperties, a.imageData)
      }).to.throw()
    })
  })

  describe('Constructor Test Cases', function () {
    it('Can construct 1x1 RGB8 texture', function () {
      const t = new Texture(RGB8_1x1.imageProperties, RGB8_1x1.imageData)
      expect(t.height).to.equal(1)
      expect(t.width).to.equal(1)
      expect(t.length).to.equal(3)
      expect(t.colorFormat).to.equal(ColorFormat.RGB8)
      expect(t.data).to.deep.equal(RGB8_1x1.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([1, 2, 3]))
    })

    it('Can construct 1x1 RGBA8 texture', function () {
      const t = new Texture(RGBA8_1x1.imageProperties, RGBA8_1x1.imageData)
      expect(t.height).to.equal(1)
      expect(t.width).to.equal(1)
      expect(t.length).to.equal(4)
      expect(t.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(t.data).to.deep.equal(RGBA8_1x1.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([10, 11, 12, 13]))
    })

    it('Can construct 1x2 RGB8 texture', function () {
      const t = new Texture(RGB8_1x2.imageProperties, RGB8_1x2.imageData)
      expect(t.height).to.equal(2)
      expect(t.width).to.equal(1)
      expect(t.length).to.equal(6)
      expect(t.colorFormat).to.equal(ColorFormat.RGB8)
      expect(t.data).to.deep.equal(RGB8_1x2.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([1, 2, 3]))
      expect(t.getPixel(0, 1)).to.deep.equal(hex([4, 5, 6]))
    })

    it('Can construct 1x2 RGBA8 texture', function () {
      const t = new Texture(RGBA8_1x2.imageProperties, RGBA8_1x2.imageData)
      expect(t.height).to.equal(2)
      expect(t.width).to.equal(1)
      expect(t.length).to.equal(8)
      expect(t.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(t.data).to.deep.equal(RGBA8_1x2.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([10, 11, 12, 13]))
      expect(t.getPixel(0, 1)).to.deep.equal(hex([14, 15, 16, 17]))
    })

    it('Can construct 2x1 RGB8 texture', function () {
      const t = new Texture(RGB8_2x1.imageProperties, RGB8_2x1.imageData)
      expect(t.height).to.equal(1)
      expect(t.width).to.equal(2)
      expect(t.length).to.equal(6)
      expect(t.colorFormat).to.equal(ColorFormat.RGB8)
      expect(t.data).to.deep.equal(RGB8_2x1.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([1, 2, 3]))
      expect(t.getPixel(1, 0)).to.deep.equal(hex([4, 5, 6]))
    })

    it('Can construct 2x1 RGBA8 texture', function () {
      const t = new Texture(RGBA8_2x1.imageProperties, RGBA8_2x1.imageData)
      expect(t.height).to.equal(1)
      expect(t.width).to.equal(2)
      expect(t.length).to.equal(8)
      expect(t.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(t.data).to.deep.equal(RGBA8_2x1.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([10, 11, 12, 13]))
      expect(t.getPixel(1, 0)).to.deep.equal(hex([14, 15, 16, 17]))
    })

    it('Can construct 2x2 RGB8 texture', function () {
      const t = new Texture(RGB8_2x2.imageProperties, RGB8_2x2.imageData)
      expect(t.height).to.equal(2)
      expect(t.width).to.equal(2)
      expect(t.length).to.equal(12)
      expect(t.colorFormat).to.equal(ColorFormat.RGB8)
      expect(t.data).to.deep.equal(RGB8_2x2.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([20, 21, 22]))
      expect(t.getPixel(1, 0)).to.deep.equal(hex([23, 24, 25]))
      expect(t.getPixel(0, 1)).to.deep.equal(hex([26, 27, 28]))
      expect(t.getPixel(1, 1)).to.deep.equal(hex([29, 30, 31]))
    })

    it('Can construct 2x2 RGBA8 texture', function () {
      const t = new Texture(RGBA8_2x2.imageProperties, RGBA8_2x2.imageData)
      expect(t.height).to.equal(2)
      expect(t.width).to.equal(2)
      expect(t.length).to.equal(16)
      expect(t.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(t.data).to.deep.equal(RGBA8_2x2.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([40, 41, 42, 43]))
      expect(t.getPixel(1, 0)).to.deep.equal(hex([44, 45, 46, 47]))
      expect(t.getPixel(0, 1)).to.deep.equal(hex([48, 49, 50, 51]))
      expect(t.getPixel(1, 1)).to.deep.equal(hex([52, 53, 54, 55]))
    })

    it('Can construct 3x3 RGB8 texture', function () {
      const t = new Texture(RGB8_3x3.imageProperties, RGB8_3x3.imageData)
      expect(t.height).to.equal(3)
      expect(t.width).to.equal(3)
      expect(t.length).to.equal(27)
      expect(t.colorFormat).to.equal(ColorFormat.RGB8)
      expect(t.data).to.deep.equal(RGB8_3x3.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([60, 61, 62]))
      expect(t.getPixel(1, 0)).to.deep.equal(hex([63, 64, 65]))
      expect(t.getPixel(2, 0)).to.deep.equal(hex([66, 67, 68]))
      expect(t.getPixel(0, 1)).to.deep.equal(hex([69, 70, 71]))
      expect(t.getPixel(1, 1)).to.deep.equal(hex([72, 73, 74]))
      expect(t.getPixel(2, 1)).to.deep.equal(hex([75, 76, 77]))
      expect(t.getPixel(0, 2)).to.deep.equal(hex([78, 79, 80]))
      expect(t.getPixel(1, 2)).to.deep.equal(hex([81, 82, 83]))
      expect(t.getPixel(2, 2)).to.deep.equal(hex([84, 85, 86]))
    })

    it('Can construct 3x3 RGBA8 texture', function () {
      const t = new Texture(RGBA8_3x3.imageProperties, RGBA8_3x3.imageData)
      expect(t.height).to.equal(3)
      expect(t.width).to.equal(3)
      expect(t.length).to.equal(36)
      expect(t.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(t.data).to.deep.equal(RGBA8_3x3.imageData)
      expect(t.getPixel(0, 0)).to.deep.equal(hex([100, 101, 102, 103]))
      expect(t.getPixel(1, 0)).to.deep.equal(hex([104, 105, 106, 107]))
      expect(t.getPixel(2, 0)).to.deep.equal(hex([108, 109, 110, 111]))
      expect(t.getPixel(0, 1)).to.deep.equal(hex([112, 113, 114, 115]))
      expect(t.getPixel(1, 1)).to.deep.equal(hex([116, 117, 118, 119]))
      expect(t.getPixel(2, 1)).to.deep.equal(hex([120, 121, 122, 123]))
      expect(t.getPixel(0, 2)).to.deep.equal(hex([124, 125, 126, 127]))
      expect(t.getPixel(1, 2)).to.deep.equal(hex([128, 129, 130, 131]))
      expect(t.getPixel(2, 2)).to.deep.equal(hex([132, 133, 134, 135]))
    })
  })

  describe('Crop Test Cases', function () {
    it('Can crop 2x2 RGB8 texture into 1x1 RGB8 texture', function () {
      const t = new Texture(RGB8_2x2.imageProperties, RGB8_2x2.imageData)
      const c0_0 = t.crop({ x: 0, y: 0, width: 1, height: 1 })
      expect(c0_0.height).to.equal(1)
      expect(c0_0.width).to.equal(1)
      expect(c0_0.length).to.equal(3)
      expect(c0_0.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c0_0.data).to.deep.equal(new Uint8Array([20, 21, 22]))
      expect(c0_0.getPixel(0, 0)).to.deep.equal(hex([20, 21, 22]))
      const c0_1 = t.crop({ x: 0, y: 1, width: 1, height: 1 })
      expect(c0_1.height).to.equal(1)
      expect(c0_1.width).to.equal(1)
      expect(c0_1.length).to.equal(3)
      expect(c0_1.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c0_1.data).to.deep.equal(new Uint8Array([26, 27, 28]))
      expect(c0_1.getPixel(0, 0)).to.deep.equal(hex([26, 27, 28]))
      const c1_0 = t.crop({ x: 1, y: 0, width: 1, height: 1 })
      expect(c1_0.height).to.equal(1)
      expect(c1_0.width).to.equal(1)
      expect(c1_0.length).to.equal(3)
      expect(c1_0.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c1_0.data).to.deep.equal(new Uint8Array([23, 24, 25]))
      expect(c1_0.getPixel(0, 0)).to.deep.equal(hex([23, 24, 25]))
      const c1_1 = t.crop({ x: 1, y: 1, width: 1, height: 1 })
      expect(c1_1.height).to.equal(1)
      expect(c1_1.width).to.equal(1)
      expect(c1_1.length).to.equal(3)
      expect(c1_1.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c1_1.data).to.deep.equal(new Uint8Array([29, 30, 31]))
      expect(c1_1.getPixel(0, 0)).to.deep.equal(hex([29, 30, 31]))
    })

    it('Can crop 2x2 RGBA8 texture into 1x1 RGBA8 texture', function () {
      const t = new Texture(RGBA8_2x2.imageProperties, RGBA8_2x2.imageData)
      const c0_0 = t.crop({ x: 0, y: 0, width: 1, height: 1 })
      expect(c0_0.height).to.equal(1)
      expect(c0_0.width).to.equal(1)
      expect(c0_0.length).to.equal(4)
      expect(c0_0.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c0_0.data).to.deep.equal(new Uint8Array([40, 41, 42, 43]))
      expect(c0_0.getPixel(0, 0)).to.deep.equal(hex([40, 41, 42, 43]))
      const c0_1 = t.crop({ x: 0, y: 1, width: 1, height: 1 })
      expect(c0_1.height).to.equal(1)
      expect(c0_1.width).to.equal(1)
      expect(c0_1.length).to.equal(4)
      expect(c0_1.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c0_1.data).to.deep.equal(new Uint8Array([48, 49, 50, 51]))
      expect(c0_1.getPixel(0, 0)).to.deep.equal(hex([48, 49, 50, 51]))
      const c1_0 = t.crop({ x: 1, y: 0, width: 1, height: 1 })
      expect(c1_0.height).to.equal(1)
      expect(c1_0.width).to.equal(1)
      expect(c1_0.length).to.equal(4)
      expect(c1_0.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c1_0.data).to.deep.equal(new Uint8Array([44, 45, 46, 47]))
      expect(c1_0.getPixel(0, 0)).to.deep.equal(hex([44, 45, 46, 47]))
      const c1_1 = t.crop({ x: 1, y: 1, width: 1, height: 1 })
      expect(c1_1.height).to.equal(1)
      expect(c1_1.width).to.equal(1)
      expect(c1_1.length).to.equal(4)
      expect(c1_1.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c1_1.data).to.deep.equal(new Uint8Array([52, 53, 54, 55]))
      expect(c1_1.getPixel(0, 0)).to.deep.equal(hex([52, 53, 54, 55]))
    })

    it('Can crop 3x3 RGB8 texture into 2x2 RGB8 texture', function () {
      const t = new Texture(RGB8_3x3.imageProperties, RGB8_3x3.imageData)
      const c0_0 = t.crop({ x: 0, y: 0, width: 2, height: 2 })
      expect(c0_0.height).to.equal(2)
      expect(c0_0.width).to.equal(2)
      expect(c0_0.length).to.equal(12)
      expect(c0_0.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c0_0.data).to.deep.equal(new Uint8Array([60, 61, 62, 63, 64, 65, 69, 70, 71, 72, 73, 74]))
      expect(c0_0.getPixel(0, 0)).to.deep.equal(hex([60, 61, 62]))
      expect(c0_0.getPixel(1, 0)).to.deep.equal(hex([63, 64, 65]))
      expect(c0_0.getPixel(0, 1)).to.deep.equal(hex([69, 70, 71]))
      expect(c0_0.getPixel(1, 1)).to.deep.equal(hex([72, 73, 74]))
      const c0_1 = t.crop({ x: 0, y: 1, width: 2, height: 2 })
      expect(c0_1.height).to.equal(2)
      expect(c0_1.width).to.equal(2)
      expect(c0_1.length).to.equal(12)
      expect(c0_1.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c0_1.data).to.deep.equal(new Uint8Array([69, 70, 71, 72, 73, 74, 78, 79, 80, 81, 82, 83]))
      expect(c0_1.getPixel(0, 0)).to.deep.equal(hex([69, 70, 71]))
      expect(c0_1.getPixel(1, 0)).to.deep.equal(hex([72, 73, 74]))
      expect(c0_1.getPixel(0, 1)).to.deep.equal(hex([78, 79, 80]))
      expect(c0_1.getPixel(1, 1)).to.deep.equal(hex([81, 82, 83]))
      const c1_0 = t.crop({ x: 1, y: 0, width: 2, height: 2 })
      expect(c1_0.height).to.equal(2)
      expect(c1_0.width).to.equal(2)
      expect(c1_0.length).to.equal(12)
      expect(c1_0.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c1_0.data).to.deep.equal(new Uint8Array([63, 64, 65, 66, 67, 68, 72, 73, 74, 75, 76, 77]))
      expect(c1_0.getPixel(0, 0)).to.deep.equal(hex([63, 64, 65]))
      expect(c1_0.getPixel(1, 0)).to.deep.equal(hex([66, 67, 68]))
      expect(c1_0.getPixel(0, 1)).to.deep.equal(hex([72, 73, 74]))
      expect(c1_0.getPixel(1, 1)).to.deep.equal(hex([75, 76, 77]))
      const c1_1 = t.crop({ x: 1, y: 1, width: 2, height: 2 })
      expect(c1_1.height).to.equal(2)
      expect(c1_1.width).to.equal(2)
      expect(c1_1.length).to.equal(12)
      expect(c1_1.colorFormat).to.equal(ColorFormat.RGB8)
      expect(c1_1.data).to.deep.equal(new Uint8Array([72, 73, 74, 75, 76, 77, 81, 82, 83, 84, 85, 86]))
      expect(c1_1.getPixel(0, 0)).to.deep.equal(hex([72, 73, 74]))
      expect(c1_1.getPixel(1, 0)).to.deep.equal(hex([75, 76, 77]))
      expect(c1_1.getPixel(0, 1)).to.deep.equal(hex([81, 82, 83]))
      expect(c1_1.getPixel(1, 1)).to.deep.equal(hex([84, 85, 86]))
    })

    it('Can crop 3x3 RGBA8 texture into 2x2 RGBA8 texture', function () {
      const t = new Texture(RGBA8_3x3.imageProperties, RGBA8_3x3.imageData)
      const c0_0 = t.crop({ x: 0, y: 0, width: 2, height: 2 })
      expect(c0_0.height).to.equal(2)
      expect(c0_0.width).to.equal(2)
      expect(c0_0.length).to.equal(16)
      expect(c0_0.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c0_0.data).to.deep.equal(
        new Uint8Array([100, 101, 102, 103, 104, 105, 106, 107, 112, 113, 114, 115, 116, 117, 118, 119])
      )
      expect(c0_0.getPixel(0, 0)).to.deep.equal(hex([100, 101, 102, 103]))
      expect(c0_0.getPixel(1, 0)).to.deep.equal(hex([104, 105, 106, 107]))
      expect(c0_0.getPixel(0, 1)).to.deep.equal(hex([112, 113, 114, 115]))
      expect(c0_0.getPixel(1, 1)).to.deep.equal(hex([116, 117, 118, 119]))
      const c0_1 = t.crop({ x: 0, y: 1, width: 2, height: 2 })
      expect(c0_1.height).to.equal(2)
      expect(c0_1.width).to.equal(2)
      expect(c0_1.length).to.equal(16)
      expect(c0_1.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c0_1.data).to.deep.equal(
        new Uint8Array([112, 113, 114, 115, 116, 117, 118, 119, 124, 125, 126, 127, 128, 129, 130, 131])
      )
      expect(c0_1.getPixel(0, 0)).to.deep.equal(hex([112, 113, 114, 115]))
      expect(c0_1.getPixel(1, 0)).to.deep.equal(hex([116, 117, 118, 119]))
      expect(c0_1.getPixel(0, 1)).to.deep.equal(hex([124, 125, 126, 127]))
      expect(c0_1.getPixel(1, 1)).to.deep.equal(hex([128, 129, 130, 131]))
      const c1_0 = t.crop({ x: 1, y: 0, width: 2, height: 2 })
      expect(c1_0.height).to.equal(2)
      expect(c1_0.width).to.equal(2)
      expect(c1_0.length).to.equal(16)
      expect(c1_0.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c1_0.data).to.deep.equal(
        new Uint8Array([104, 105, 106, 107, 108, 109, 110, 111, 116, 117, 118, 119, 120, 121, 122, 123])
      )
      expect(c1_0.getPixel(0, 0)).to.deep.equal(hex([104, 105, 106, 107]))
      expect(c1_0.getPixel(1, 0)).to.deep.equal(hex([108, 109, 110, 111]))
      expect(c1_0.getPixel(0, 1)).to.deep.equal(hex([116, 117, 118, 119]))
      expect(c1_0.getPixel(1, 1)).to.deep.equal(hex([120, 121, 122, 123]))
      const c1_1 = t.crop({ x: 1, y: 1, width: 2, height: 2 })
      expect(c1_1.height).to.equal(2)
      expect(c1_1.width).to.equal(2)
      expect(c1_1.length).to.equal(16)
      expect(c1_1.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(c1_1.data).to.deep.equal(
        new Uint8Array([116, 117, 118, 119, 120, 121, 122, 123, 128, 129, 130, 131, 132, 133, 134, 135])
      )
      expect(c1_1.getPixel(0, 0)).to.deep.equal(hex([116, 117, 118, 119]))
      expect(c1_1.getPixel(1, 0)).to.deep.equal(hex([120, 121, 122, 123]))
      expect(c1_1.getPixel(0, 1)).to.deep.equal(hex([128, 129, 130, 131]))
      expect(c1_1.getPixel(1, 1)).to.deep.equal(hex([132, 133, 134, 135]))
    })
  })

  describe('Overlay Test Cases', function () {
    it('Cannot overlay image with different color format', function () {
      const RGBA16_1x1: TestImage = {
        imageProperties: { size: { width: 1, height: 1 }, colorFormat: ColorFormat.RGBA16 },
        imageData: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]),
      }
      const t1 = new Texture(RGB8_1x1.imageProperties, RGB8_1x1.imageData)
      const t2 = new Texture(RGBA16_1x1.imageProperties, RGBA16_1x1.imageData)
      expect(() => t1.overlay(t2)).to.throw()
      expect(() => t2.overlay(t1)).to.throw()
    })

    it('Cannot overlay image with different size', function () {
      const t1 = new Texture(RGB8_1x1.imageProperties, RGB8_1x1.imageData)
      const t2 = new Texture(RGB8_2x2.imageProperties, RGB8_2x2.imageData)
      expect(() => t1.overlay(t2)).to.throw()
      expect(() => t2.overlay(t1)).to.throw()
    })

    it('Cannot overlay image with same size but different width and height', function () {
      // row vector
      const t1 = new Texture(RGB8_2x1.imageProperties, RGB8_2x1.imageData)
      // column vector
      const t2 = new Texture(RGB8_1x2.imageProperties, RGB8_1x2.imageData)
      expect(() => t1.overlay(t2)).to.throw()
      expect(() => t2.overlay(t1)).to.throw()
    })

    it('Can overlay 1x1 RGBA8 texture onto 1x1 RGBA8 texture', function () {
      const t1 = new Texture(RGBA8_1x1.imageProperties, new Uint8Array([1, 2, 3, 255]))
      const t2 = new Texture(RGBA8_1x1.imageProperties, new Uint8Array([4, 5, 6, 255]))
      const o = t1.overlay(t2)
      expect(o.height).to.equal(1)
      expect(o.width).to.equal(1)
      expect(o.length).to.equal(4)
      expect(o.colorFormat).to.equal(ColorFormat.RGBA8)
      expect(o.getPixel(0, 0)).to.deep.equal('#040506ff')
      expect(o.data).to.deep.equal(new Uint8Array([4, 5, 6, 255]))
    })
  })

  it('Can overlay 2x1 RGBA8 texture onto 2x1 RGBA8 texture', function () {
    const t1 = new Texture(RGBA8_2x1.imageProperties, new Uint8Array([1, 2, 3, 255, 4, 5, 6, 255]))
    const t2 = new Texture(RGBA8_2x1.imageProperties, new Uint8Array([0, 0, 0, 0, 10, 11, 12, 255]))
    const o = t1.overlay(t2)
    expect(o.height).to.equal(1)
    expect(o.width).to.equal(2)
    expect(o.length).to.equal(8)
    expect(o.colorFormat).to.equal(ColorFormat.RGBA8)
    expect(o.getPixel(0, 0)).to.deep.equal('#010203ff')
    expect(o.getPixel(1, 0)).to.deep.equal('#0a0b0cff')
    expect(o.data).to.deep.equal(new Uint8Array([1, 2, 3, 255, 10, 11, 12, 255]))
  })

  it('Can overlay 2x2 RGBA8 texture onto 2x2 RGBA8 texture', function () {
    const t1 = new Texture(
      RGBA8_2x2.imageProperties,
      new Uint8Array([1, 2, 3, 255, 4, 5, 6, 255, 7, 8, 9, 255, 10, 11, 12, 255])
    )
    const t2 = new Texture(
      RGBA8_2x2.imageProperties,
      new Uint8Array([0, 0, 0, 0, 16, 17, 18, 255, 19, 20, 21, 255, 0, 0, 0, 0])
    )
    const o = t1.overlay(t2)
    expect(o.height).to.equal(2)
    expect(o.width).to.equal(2)
    expect(o.length).to.equal(16)
    expect(o.colorFormat).to.equal(ColorFormat.RGBA8)
    expect(o.getPixel(0, 0)).to.deep.equal('#010203ff')
    expect(o.getPixel(1, 0)).to.deep.equal('#101112ff')
    expect(o.getPixel(0, 1)).to.deep.equal('#131415ff')
    expect(o.getPixel(1, 1)).to.deep.equal('#0a0b0cff')
    expect(o.data).to.deep.equal(new Uint8Array([1, 2, 3, 255, 16, 17, 18, 255, 19, 20, 21, 255, 10, 11, 12, 255]))
  })
})
