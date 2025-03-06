import fs from 'fs'
import path from 'path'
import { ColorCode } from '../src/lib/ImageProperties'
import { extract, getPalettes } from './ScriptUtils'

function main(args: string[]): void {
  if (args.length !== 0) {
    console.error('Usage: sort_geohumans.ts')
    process.exit(1)
  }

  const palettes = getPalettes('assets/palettes/23:humanoid_geographic')

  const paletteScores: Record<string, number> = {}
  // output object as JSON
  for (const paletteName of Object.keys(palettes)) {
    const palette: ColorCode[] = palettes[paletteName]
    const colors: ColorCode[] = extract(palette)
    if (colors.length !== 4) {
      throw new Error(`Invalid palette: ${paletteName}`)
    }
    const a = colors[0]
    const b = colors[1]
    const main = colors[2]
    const d = colors[3]
    console.log(a, b, main, d)

    const main_r = parseInt(main.slice(1, 3), 16)
    const main_g = parseInt(main.slice(3, 5), 16)
    const main_b = parseInt(main.slice(5, 7), 16)
    const score = main_r + main_g + main_b
    paletteScores[paletteName] = score
  }

  // sort palettes by score
  const sortedPalettes = Object.keys(paletteScores).sort((a, b) => {
    return paletteScores[a] - paletteScores[b]
  })
  // reverse order
  sortedPalettes.reverse()

  const newPalettes: Record<string, ColorCode[]> = {}
  let sunburnIndex = 1
  let humanIndex = 1
  sortedPalettes.forEach((paletteName, index) => {
    const index3pad = index.toString().padStart(3, '0')
    console.log(`${index3pad} ${paletteName}: ${paletteScores[paletteName]}`)

    let newName = ''
    if (paletteName.includes('sunburn')) {
      newName = `sunburn${(sunburnIndex++).toString()}`
    } else {
      newName = `human${(humanIndex++).toString().padStart(3, '0')}`
    }
    const palette: ColorCode[] = palettes[paletteName]
    newPalettes[newName] = palette
  })

  // write new palettes as files
  const outDir = 'assets/palettes/2:humanoid_human'
  for (const paletteName of Object.keys(newPalettes)) {
    const palette: ColorCode[] = newPalettes[paletteName]
    const filePath = path.join(outDir, `${paletteName}.pal`)
    const fileContents = `JASC-PAL\n0100\n${palette.length}\n`
    const lines = palette.map((color) => {
      const colorValues = color.slice(1).match(/.{2}/g)
      if (!colorValues) {
        throw new Error(`Invalid color: ${color}`)
      }
      return colorValues.map((value) => parseInt(value, 16)).join(' ')
    })
    console.log(filePath)
    fs.writeFileSync(filePath, fileContents + lines.join('\n') + '\n')
  }

  // find pairwise differences
  const deltas: Record<string, number> = {}
  const check = newPalettes
  for (const paletteName1 of Object.keys(check)) {
    const palette1: ColorCode[] = check[paletteName1]
    const main1 = palette1[4]

    for (const paletteName2 of Object.keys(check)) {
      if (paletteName1 === paletteName2) {
        continue
      }
      if (`${paletteName2} ${paletteName1}` in deltas) {
        continue
      }
      const palette2: ColorCode[] = check[paletteName2]
      const main2 = palette2[4]

      const main1_r = parseInt(main1.slice(1, 3), 16)
      const main1_g = parseInt(main1.slice(3, 5), 16)
      const main1_b = parseInt(main1.slice(5, 7), 16)
      const main2_r = parseInt(main2.slice(1, 3), 16)
      const main2_g = parseInt(main2.slice(3, 5), 16)
      const main2_b = parseInt(main2.slice(5, 7), 16)
      const score = Math.abs(main1_r - main2_r) + Math.abs(main1_g - main2_g) + Math.abs(main1_b - main2_b)
      // console.log(`${paletteName1} ${paletteName2}: ${score}`)
      deltas[`${paletteName1} ${paletteName2}`] = score
    }
  }

  // sort deltas by score
  const sortedDeltas = Object.keys(deltas).sort((a, b) => {
    return deltas[a] - deltas[b]
  })

  // print the top 10
  for (let i = 0; i < 10; i++) {
    const deltaName = sortedDeltas[i]
    console.log(`${i + 1}. ${deltaName}: ${deltas[deltaName]}`)
  }
}

main(process.argv.slice(2))
