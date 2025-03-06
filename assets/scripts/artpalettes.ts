import fs from 'fs'
import path from 'path'
import { ColorCode } from '../src/lib/ImageProperties'

function getHairPalettes(hairPaletteDir: string): Record<string, ColorCode[]> {
  // read all .pal files in the directory
  const files = fs.readdirSync(hairPaletteDir).filter((file) => {
    return path.extname(file) === '.pal'
  })

  // process each file
  const palettes: Record<string, ColorCode[]> = {}
  files.forEach((file) => {
    const paletteName = path.basename(file, '.pal')
    const filePath = path.join(hairPaletteDir, file)
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

function main(args: string[]): void {
  if (args.length !== 0) {
    console.error('Usage: artpalettes.ts')
    process.exit(1)
  }

  const palettes = getHairPalettes('assets/palettes/hair')

  // now loop through every pattern files in the assets/patterns/hair directory
  const patternDir = 'assets/patterns/hair'
  const files = fs.readdirSync(patternDir).filter((file) => {
    return path.extname(file) === '.json'
  })
  files.forEach((file) => {
    const filePath = path.join(patternDir, file)

    // read the file
    const contents = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    contents.palettes = palettes

    // write the file
    fs.writeFileSync(filePath, JSON.stringify(contents, null, 2))
  })

  // output object as JSON
  for (const paletteName of Object.keys(palettes)) {
    console.log(paletteName)
  }
}

main(process.argv.slice(2))
