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
  if (args.length !== 1 && args.length !== 2) {
    console.error('Usage: swaps.ts <input file> <swapstring>')
    process.exit(1)
  }
  const input_filepath = args[0]
  // read file contents as JSON
  const contents: any = JSON.parse(fs.readFileSync(input_filepath, 'utf8'))
  const scanlines: `0x${string}`[] = contents.scanlines as `0x${string}`[]
  const array: Uint8Array2D = to2DArray(scanlines)

  let maxval = 0
  // scan and update max once more in case new value is higher
  for (let y = 0; y < array.length; y++) {
    for (let x = 0; x < array[y].length; x++) {
      if (array[y][x] > maxval) {
        maxval = array[y][x]
      }
    }
  }
  // maxval should be <= 22
  if (maxval > 22) {
    throw new Error('Max value is too high: ' + maxval)
  }

  // now parse the swap string
  const swapstring = args[1]
  const swaps = swapstring.split(',')
  const swap_pairs = swaps.map((swap) => {
    const pair = swap.split('->')
    if (pair.length !== 2) {
      throw new Error('Invalid swap pair')
    }
    if (pair[0].length !== 2 || pair[1].length !== 2) {
      throw new Error('Invalid swap pair')
    }
    return pair
  })

  for (const [from, to] of swap_pairs) {
    const fromInt = parseInt(from, 16)
    const toInt = parseInt(to, 16)
    for (let y = 0; y < array.length; y++) {
      for (let x = 0; x < array[y].length; x++) {
        if (array[y][x] === fromInt) {
          array[y][x] = toInt
        }
      }
    }
  }

  // scan and update max once more in case new value is higher
  const used = new Set<number>()
  for (let y = 2; y < array.length; y++) {
    for (let x = 0; x < array[y].length; x++) {
      used.add(array[y][x])
      if (array[y][x] > maxval) {
        maxval = array[y][x]
      }
    }
  }

  // fill in the first y columns of the first row with 00 01 02 03 ... maxval
  for (let i = 0; i <= array[0].length; i++) {
    if (i > maxval) {
      array[0][i] = 0
    } else {
      array[0][i] = i
    }
  }
  // for the second row, stub only the used columns else set to zero
  for (let i = 0; i <= array[1].length; i++) {
    if (i > maxval) {
      array[1][i] = 0
    } else if (used.has(i)) {
      array[1][i] = i
    } else {
      array[1][i] = 0
    }
  }

  const newScanlines = toScanlines(array)
  contents.scanlines = newScanlines
  // write file contents back to the provide file
  const basename = path.basename(input_filepath)
  contents.patternName = basename.replace('.json', '')
  fs.writeFileSync(input_filepath, JSON.stringify(contents, null, 2) + '\n')
}

main()
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '🛠️   Done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
