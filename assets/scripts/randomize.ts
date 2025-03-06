#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

import { AvatarPaletteAssets, Palette } from '@openavatar/assets'
import { AvatarDefinitions } from '@openavatar/types'

function toUint8Array(scanline: `0x${string}`): Uint8Array {
  const scanlineBuffer = Buffer.from(scanline.slice(2), 'hex')
  return new Uint8Array(scanlineBuffer)
}

function to2DArray(scanlines: `0x${string}`[]): Uint8Array[] {
  return scanlines.map(toUint8Array)
}

function largestByte(array: Uint8Array[]): number {
  let largestByte = 0
  for (let i = 0; i < array.length; i++) {
    const scanline = array[i]
    for (let j = 0; j < scanline.length; j++) {
      const byte = scanline[j]
      if (byte > largestByte) {
        largestByte = byte
      }
    }
  }
  return largestByte
}

function randomizeAsPrettyToHuman(x: number, y: number, array: Uint8Array[], min: number, max: number): number {
  // x and y are our index in the grid
  // random range is 2-max
  // we want to make it look as diverse as possible.

  // so we first want to ensure that we do not match the same value as
  // a direct neighbor pixel
  const up = y > 0 ? array[y - 1][x] : 0
  const down = y < array.length - 1 ? array[y + 1][x] : 0
  const left = x > 0 ? array[y][x - 1] : 0
  const right = x < array[y].length - 1 ? array[y][x + 1] : 0

  const upleft = y > 0 && x > 0 ? array[y - 1][x - 1] : 0
  const upright = y > 0 && x < array[y].length - 1 ? array[y - 1][x + 1] : 0
  const downleft = y < array.length - 1 && x > 0 ? array[y + 1][x - 1] : 0
  const downright = y < array.length - 1 && x < array[y].length - 1 ? array[y + 1][x + 1] : 0

  const neighbors = [up, down, left, right, upleft, upright, downleft, downright]
  const directNeighbors = [up, down, left, right]

  function randomCandidate(): number {
    return Math.floor(Math.random() * (max - min)) + min
  }

  let check = randomCandidate()
  const limit = 100
  let i = 0
  while (neighbors.includes(check)) {
    // console.log(`(${x}, ${y}) -> ${randomCandidate} is a neighbor ${neighbors}`)
    check = randomCandidate()
    if (i++ > limit) {
      break
    }
  }

  // try finding one that's different from our direct neighbors if we couldn't find one that's different from all neighbors
  i = 0
  while (directNeighbors.includes(check)) {
    check = randomCandidate()

    if (i++ > limit) {
      throw new Error(`Could not find a random candidate for (${x}, ${y})`)
    }
  }

  console.log(`(${x}, ${y}) -> ${check} (neighbors: ${JSON.stringify({ left, right, up, down })})`)
  return check
}

function shuffle_<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    // this will give us a random number between 0 and i
    // then we swap the current element with the random element
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function main(): Promise<void> {
  // read input file from provide args
  const args = process.argv.slice(2)
  if (args.length !== 1 && args.length !== 2) {
    console.error('Usage: randomize.ts <input file> <output file>')
    process.exit(1)
  }
  const input = args[0]
  // read file contents as JSON
  const contents: any = JSON.parse(fs.readFileSync(input, 'utf8'))
  //   console.log(contents)

  const scanlines: `0x${string}`[] = contents.scanlines as `0x${string}`[]
  const array: Uint8Array[] = to2DArray(scanlines)
  const max: number = Math.max(9, largestByte(array))

  const output: Uint8Array[] = []
  // stub output as all zeros first
  for (let y = 0; y < array.length; y++) {
    output.push(new Uint8Array(array[y].length))
  }

  // now we are going to find the list of (x,y) coordinates that are not 0 or 1
  let coords: { x: number; y: number }[] = []
  for (let y = 0; y < array.length; y++) {
    const scanlineArray = array[y]
    for (let x = 0; x < scanlineArray.length; x++) {
      const existingByte = scanlineArray[x]
      if (existingByte >= 2) {
        coords.push({ x, y })
      }
    }
  }

  // now we are going to loop through the coords in random order and randomize each one
  let done = false

  while (!done) {
    try {
      coords = shuffle_(coords)
      for (let i = 0; i < coords.length; i++) {
        const { x, y } = coords[i]
        const randomByte = randomizeAsPrettyToHuman(x, y, output, max - 4, max)
        output[y][x] = randomByte
      }
      done = true
    } catch (e) {
      console.error(e)
      continue
    }
  }

  let maxval = 0
  // scan and update max once more in case new value is higher
  for (let y = 0; y < output.length; y++) {
    for (let x = 0; x < output[y].length; x++) {
      if (output[y][x] > maxval) {
        maxval = output[y][x]
      }
    }
  }
  // maxval should be <= 15
  if (maxval > 15) {
    throw new Error('Max value is too high: ' + maxval)
  }

  // scan and update max once more in case new value is higher
  const used = new Set<number>()
  for (let y = 2; y < output.length; y++) {
    for (let x = 0; x < output[y].length; x++) {
      used.add(output[y][x])
      if (output[y][x] > maxval) {
        maxval = output[y][x]
      }
    }
  }

  contents.patternName = args[2] || 'speckled'
  contents.paletteCode = 1
  const palette: Palette = AvatarPaletteAssets.getPalette(AvatarDefinitions.getPalette(contents.paletteCode, 0))
  const numColors = palette.colors.length

  // fill in the first y columns of the first row with 00 01 02 03 ... maxval
  for (let i = 0; i <= output[0].length; i++) {
    if (i > numColors) {
      output[0][i] = 0
    } else {
      output[0][i] = i
    }
  }
  // for the second row, stub only the used columns else set to zero
  for (let i = 0; i <= output[1].length; i++) {
    if (used.has(i)) {
      output[1][i] = i
    } else {
      output[1][i] = 0
    }
  }
  // write file contents as JSON if output arg give
  if (args.length === 2) {
    const output = args[1]
    const basename = path.basename(output)
    contents.patternName = basename.replace('.json', '')
    fs.writeFileSync(output, JSON.stringify(contents, null, 2))
  }
}

main()
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '🛠️   Done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
