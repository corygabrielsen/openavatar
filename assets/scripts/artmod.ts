// print_args.ts
import fs from 'fs'

// Import process from Node.js to access command-line arguments
import { argv } from 'process'
import { ColorCode } from '../src/lib/ImageProperties'

function main(args: string[]): void {
  if (args.length != 2) {
    console.error('Error: Please provide exactly two arguments.')
    process.exit(1)
  }

  // reference file
  const reference = JSON.parse(fs.readFileSync('assets/patterns/hair/hair_afro.json', 'utf8'))
  const refColorCode = reference.palettes['cyan']
  console.log(refColorCode)

  // read the input file of the first arg
  const input = JSON.parse(fs.readFileSync(args[0], 'utf8'))
  const inputColorCode = input.palettes['cyan']
  console.log(inputColorCode)

  // now we are going to compute the index-to-index mapping from input to reference
  const mapping: Record<number, number> = {}
  const bad: string[] = []
  for (let i = 0; i < inputColorCode.length; i++) {
    const inputColor = inputColorCode[i]
    const refIndex = refColorCode.indexOf(inputColor)
    if (refIndex !== -1) {
      mapping[i] = refIndex
    } else {
      mapping[i] = refColorCode.length + bad.length
      bad.push(inputColor)
    }
  }
  console.log(mapping)
  console.log(bad)

  const oldIndexToNewIndexArray: number[] = []
  for (let i = 0; i < inputColorCode.length; i++) {
    oldIndexToNewIndexArray.push(mapping[i])
  }

  // now we are going to apply the mapping to the input file
  // "layer": "hair",
  // "patternName": "wild",
  // "imageProperties": {
  //   "size": {
  //     "width": 128,
  //     "height": 128
  //   },
  //   "colorFormat": {
  //     "bitsPerChannel": 8,
  //     "channels": 4,
  //     "alphaChannel": true
  //   }
  // },
  // "scanlines": [
  const modified: Record<string, any> = {}
  modified['layer'] = input['layer']
  modified['patternName'] = input['patternName']
  modified['imageProperties'] = input['imageProperties']

  const scanlines: `0x${string}`[] = input['scanlines']
  const newScanlines: `0x${string}`[] = []
  // transform the scanlines by applying the mapping
  for (let i = 0; i < scanlines.length; i++) {
    const scanline = scanlines[i]
    const newScanline = `0x${scanline
      .slice(2)
      .split('')
      .map((c) => mapping[parseInt(c, 16)])
      .map((i) => i.toString(16))
      .join('')}`
    // bug check should be same length
    if (newScanline.length !== scanline.length) {
      console.error('Error: new scanline length is not the same as the old one.')
      process.exit(1)
    }
    newScanlines.push(newScanline as `0x${string}`)
  }
  modified['scanlines'] = newScanlines

  const palettes: Record<string, ColorCode[]> = {}
  for (const key in input['palettes']) {
    const colorCodes = input['palettes'][key]
    // rearrange using the mapping above
    const rearrangedColorCodes: ColorCode[] = []
    for (let i = 0; i < oldIndexToNewIndexArray.length; i++) {
      rearrangedColorCodes[oldIndexToNewIndexArray[i]] = colorCodes[i]
    }
    palettes[key] = rearrangedColorCodes
  }
  modified['palettes'] = palettes

  // write modified file to args[1]
  fs.writeFileSync(args[1], JSON.stringify(modified, null, 2))
}

// Get the command-line arguments, excluding the first two (node and script path)
const [, , ...args] = argv

// Call the main function with the arguments
main(args)
