#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

function toUint8Array(scanline: `0x${string}`): Uint8Array {
  const scanlineBuffer = Buffer.from(scanline.slice(2), 'hex')
  return new Uint8Array(scanlineBuffer)
}

type Uint8Array2D = Uint8Array[]

function to2DArray(scanlines: `0x${string}`[]): Uint8Array2D {
  return scanlines.map(toUint8Array)
}

function toScanlines(array: Uint8Array2D): `0x${string}`[] {
  return array.map((scanline) => {
    const scanlineBuffer = Buffer.from(scanline)
    return `0x${scanlineBuffer.toString('hex')}` as `0x${string}`
  })
}

async function main(): Promise<void> {
  // read input file from provide args
  const args = process.argv.slice(2)
  if (args.length !== 3) {
    console.error('Usage: swaps.ts <input file> <mask file> <output file>')
    process.exit(1)
  }
  const inpuFilepath = args[0]
  // read file contents as JSON
  const contents: any = JSON.parse(fs.readFileSync(inpuFilepath, 'utf8'))
  const scanlines: `0x${string}`[] = contents.scanlines as `0x${string}`[]
  const array: Uint8Array2D = to2DArray(scanlines)

  const maskFilepath = args[1]
  const maskContents: any = JSON.parse(fs.readFileSync(maskFilepath, 'utf8'))
  const maskScanlines: `0x${string}`[] = maskContents.scanlines as `0x${string}`[]
  const maskArray: Uint8Array2D = to2DArray(maskScanlines)

  // output
  const outputFilepath = args[2]
  const outputArray = array.map((scanline, y) => {
    return scanline.map((pixel, x) => {
      const maskPixel = maskArray[y][x]
      // if maskPixel is > 00 then we want to keep it
      // if maskPixel is 00 then we want to mask it
      if (maskPixel === 0) {
        return 0
      }
      return pixel
    })
  })

  const newScanlines = toScanlines(outputArray)
  contents.scanlines = newScanlines
  // write file contents back to the provide file
  // write file contents back to the provide file
  const basename = path.basename(outputFilepath)
  contents.patternName = basename.replace('.json', '')
  fs.writeFileSync(outputFilepath, JSON.stringify(contents, null, 2) + '\n')
}

main()
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '🛠️   Done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
