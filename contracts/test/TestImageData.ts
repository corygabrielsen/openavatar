import { ColorFormat, ImageSize, PatternTexture, Texture } from '@openavatar/assets'
import { AvatarLayerStack } from '@openavatar/types'

const BG = 0
const OPAQUE = 255

export class TestImageData {
  private layers: Texture[]
  private patterns: PatternTexture[]
  private overlays: Texture[]

  public static PALETTE_ONE_COLOR_TRANSPARENT: Buffer[] = [Buffer.from('00000000', 'hex')]
  public static PALETTE_TWO_COLOR_TRANSPARENT_BLACK: Buffer[] = [
    Buffer.from('00000000', 'hex'),
    Buffer.from('000000FF', 'hex'),
  ]

  constructor(public size: ImageSize, layers: number) {
    if (layers < 1) {
      throw new Error('Must be positive number of layers')
    }
    this.layers = new Array(layers)
    // transparent base layer
    this.layers[0] = this.constructBackgroundLayer()

    // for testing we need to make it match the way the avatar data works
    const nonTransparentLayerNumbers: number[] = []
    for (const layer of AvatarLayerStack.iter()) {
      nonTransparentLayerNumbers.push(layer.index)
    }
    for (let layer = 1; layer <= layers; layer++) {
      if (nonTransparentLayerNumbers.includes(layer)) {
        this.layers[layer] = new Texture({ size: this.size, colorFormat: ColorFormat.RGBA8 }, this.uniquePattern(layer))
      } else {
        this.layers[layer] = new Texture(
          { size: this.size, colorFormat: ColorFormat.RGBA8 },
          new Uint8Array(this.size.width * this.size.height * 4)
        )
      }
    }
    this.patterns = new Array(layers)
    for (let layer = 1; layer <= layers; layer++) {
      this.patterns[layer] = PatternTexture.from(this.layers[layer])
    }

    this.overlays = new Array(layers)
    this.overlays[0] = this.layers[0]
    for (let layer = 1; layer <= layers; layer++) {
      this.overlays[layer] = this.overlays[layer - 1].overlay(this.layers[layer])
    }
  }

  private constructBackgroundLayer(): Texture {
    return new Texture(
      { size: this.size, colorFormat: ColorFormat.RGBA8 },
      new Uint8Array(this.size.width * this.size.height * 4)
    )
  }

  private uniquePattern(layer: number): Uint8Array {
    if (layer < 1) {
      throw new Error('Must be positive layer number >= 1')
    }
    const data = new Uint8Array(this.size.width * this.size.height * 4)
    // now we need to fill in a unique pattern of pixels based on the layer number
    // some will stay transparent so that we can test overlapping
    // the remaining will be set with the pixel value equal to the layer number e.g. 0x030303FF for layer 3
    for (let px = 0; px < this.size.width * this.size.height; px++) {
      const index = px * 4
      // we can use the layer number to determine the color of the pixel
      // this isn't perfect but we can write a test to check that the pixels are correct easily
      if (px % layer === 0) {
        data[index] = layer
        data[index + 1] = layer
        data[index + 2] = layer
        data[index + 3] = OPAQUE
      }
    }
    return data
  }

  getLayer(layer: number): Texture {
    return this.layers[layer]
  }

  getLayerPattern(layer: number): PatternTexture {
    return this.patterns[layer]
  }

  renderOverlay(layer: number): Texture {
    return this.overlays[layer]
    // // now remove the transparent pixels and just show the RGB values
    // const data = new Uint8Array(this.size.width * this.size.height * 4)
    // for (let px = 0; px < this.size.width * this.size.height; px++) {
    //   const index = px * 4
    //   if (raw[index + 3] == 255) {
    //     data[index] = raw[index]
    //     data[index + 1] = raw[index + 1]
    //     data[index + 2] = raw[index + 2]
    //   } else {
    //     throw new Error(`Pixel ${px} is not opaque`)
    //   }
    // }
    // return new Texture({ size: this.size, colorFormat: ColorFormat.RGBA8 }, data)
  }
}
