import fs from 'fs'

type RGB = [number, number, number]
type HSL = [number, number, number]

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const delta = max - min
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / delta + 2
        break
      case b:
        h = (r - g) / delta + 4
        break
    }
    h /= 6
  }

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b
  h /= 360
  s /= 100
  l /= 100

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

const originalPalette = [
  [122, 200, 255, 255],
  [122, 200, 255, 255],
  [82, 160, 218, 255],
  [92, 170, 228, 255],
]

const rotatePalette = (palette: number[][], rotationDegrees: number): number[][] => {
  return palette.map((color) => {
    const [r, g, b, a] = color
    const [h, s, l] = rgbToHsl(r, g, b)
    const rotatedHue = (h + rotationDegrees) % 360
    const [rotatedR, rotatedG, rotatedB] = hslToRgb(rotatedHue, s, l)
    return [rotatedR, rotatedG, rotatedB, a]
  })
}

const rotations = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

for (let i = 0; i < rotations.length; i++) {
  const rotation = rotations[i]
  const rotated = rotatePalette(originalPalette, rotation)
  let output = 'JASC-PAL\n'
  output += '0100\n'
  output += '6\n'
  output += '0 0 0 0\n'
  output += '0 0 0 255\n'
  rotated.forEach((color) => {
    output += color.join(' ') + '\n'
  })
  output += '\n'

  const filename = `special_mystic${i + 1}.pal`
  fs.writeFileSync(filename, output)
  console.log(`Written to: ${filename}`)
}
