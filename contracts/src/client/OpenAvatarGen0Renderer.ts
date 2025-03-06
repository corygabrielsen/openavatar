import { DNA } from '@openavatar/types'
import { OpenAvatarGen0AssetsCanvasLayerCompositor } from './core/render/OpenAvatarGen0AssetsCanvasLayerCompositor'

export interface Render {
  hex: string
  png: string
  base64PNG: string
  svg: string
  base64SVG: string
  html: string
}

export class OpenAvatarGen0Renderer extends OpenAvatarGen0AssetsCanvasLayerCompositor {
  async getCanvasId(): Promise<number> {
    return parseInt(await this._contract.getCanvasId())
  }

  async renderURI(dna: { buffer: Buffer }): Promise<string> {
    return await this._contract.renderURI(dna.buffer)
  }

  async renderHex(code: DNA): Promise<string> {
    const hexstring: string = await this._contract.renderHex(code.buffer)
    return hexstring
  }

  async renderPNG(code: DNA): Promise<string> {
    return await this._contract.renderPNG(code.buffer)
  }

  async renderBase64PNG(code: DNA): Promise<string> {
    return await this._contract.renderBase64PNG(code.buffer)
  }

  async renderSVG(code: DNA): Promise<string> {
    return await this._contract.renderSVG(code.buffer)
  }

  async renderBase64SVG(code: DNA): Promise<string> {
    return await this._contract.renderBase64SVG(code.buffer)
  }

  async renderHTML(code: DNA): Promise<string> {
    return await this._contract.renderHTML(code.buffer)
  }

  async renderAll(code: DNA): Promise<Render> {
    const hex = await this.renderHex(code)
    const png = await this.renderPNG(code)
    const base64PNG = await this.renderBase64PNG(code)
    const svg = await this.renderSVG(code)
    const base64SVG = await this.renderBase64SVG(code)
    const html = await this.renderHTML(code)
    return {
      hex,
      png,
      base64PNG,
      svg,
      base64SVG,
      html,
    }
  }
}
