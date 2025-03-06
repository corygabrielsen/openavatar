import fs from 'fs'
import path from 'path'
import { ColorCode } from '../src/lib/ImageProperties'

export function getPalettes(paletteDir: string): Record<string, ColorCode[]> {
  // read all .pal files in the directory
  const files = fs.readdirSync(paletteDir).filter((file) => {
    return path.extname(file) === '.pal'
  })

  // process each file
  const palettes: Record<string, ColorCode[]> = {}
  files.forEach((file) => {
    const paletteName = path.basename(file, '.pal')
    const filePath = path.join(paletteDir, file)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const lines = fileContents.trim().split('\n')

    // convert colors to hex and store in array
    const colors: ColorCode[] = []
    for (let i = 3; i < lines.length; i++) {
      const colorValues = lines[i].trim().split(' ')
      const hexColor: ColorCode = ('#' +
        colorValues.map((value) => parseInt(value).toString(16).padStart(2, '0')).join('')) as ColorCode
      if (hexColor.length !== 9) {
        throw new Error(`Invalid color: ${hexColor}`)
      }
      colors.push(hexColor)
    }

    // store colors in object with palette name as key
    palettes[paletteName] = colors
  })

  return palettes
}

export type RGB = { r: number; g: number; b: number }
export type RGBA = RGB & { a: number }

export function toRGBA(color: ColorCode): RGBA {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const a = parseInt(color.slice(7, 9), 16)
  return { r, g, b, a }
}

export function normalize(colors: ColorCode[]): RGB {
  const rgbas = colors.map(toRGBA)

  const avg_r = Math.round(rgbas.reduce((acc, rgba) => acc + rgba.r, 0) / colors.length)
  const avg_g = Math.round(rgbas.reduce((acc, rgba) => acc + rgba.g, 0) / colors.length)
  const avg_b = Math.round(rgbas.reduce((acc, rgba) => acc + rgba.b, 0) / colors.length)
  const avg_a = Math.round(rgbas.reduce((acc, rgba) => acc + rgba.a, 0) / colors.length)
  if (avg_a !== 255) {
    throw new Error('Cannot normalize colors with alpha channel')
  }
  return { r: avg_r, g: avg_g, b: avg_b }
}

export type HSV = { h: number; s: number; v: number }

export function rgbToHsv(color: RGB): HSV {
  let rPrime = color.r / 255.0
  let gPrime = color.g / 255.0
  let bPrime = color.b / 255.0

  let cMax = Math.max(rPrime, gPrime, bPrime)
  let cMin = Math.min(rPrime, gPrime, bPrime)
  let delta = cMax - cMin
  let h = 0

  if (delta === 0) {
    h = 0
  } else if (cMax === rPrime) {
    h = 60 * (((gPrime - bPrime) / delta) % 6)
  } else if (cMax === gPrime) {
    h = 60 * ((bPrime - rPrime) / delta + 2)
  } else {
    h = 60 * ((rPrime - gPrime) / delta + 4)
  }

  let s = cMax === 0 ? 0 : delta / cMax
  let v = cMax

  return { h, s, v }
}

export function extract(palette: ColorCode[]): ColorCode[] {
  const transparent = palette[0]
  if (transparent !== '#00000000') {
    throw new Error(`Invalid transparent color: ${transparent}`)
  }
  const black = palette[1]
  if (black !== '#000000ff') {
    throw new Error(`Invalid black color: ${black}`)
  }
  return palette.slice(2)
}
