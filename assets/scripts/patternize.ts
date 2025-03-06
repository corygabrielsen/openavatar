#!/usr/bin/env node

import { AvatarDefinitions, LayerDescriptor } from '@openavatar/types'
import fs from 'fs'
import path from 'path'
import { PatternFile } from '../src/lib'
import { PatternTexture, Texture } from '../src/lib/Texture'
import { PatternizePipeline } from '../src/render/PatternizePipeline'
import { JimpReader } from '../src/render/read/ImageReader'

async function processSingleFile(
  inputFile: string,
  outputFile: string,
  layer: LayerDescriptor,
  paletteCode: number
): Promise<void> {
  const texture: Texture = await new JimpReader(inputFile).read()
  const patternTexture: PatternTexture = PatternTexture.from(texture)
  const patternData = {
    layer: layer.name,
    patternName: path.basename(inputFile, '.png'),
    paletteCode,
    imageProperties: patternTexture.properties,
    scanlines: PatternFile.splitScanlines(patternTexture.patternHex, patternTexture.width),
  }

  fs.writeFileSync(outputFile, JSON.stringify(patternData, null, 2))
}

async function main(args: string[]) {
  if (args.length !== 3) {
    console.error('Usage: patternize.ts [file] [layer] [paletteCode]')
    process.exit(1)
  }

  const file = args[0]
  if (!file) {
    // no specific file specified so do everything
    await new PatternizePipeline().run()
  } else {
    // read and parse only the file we want
    const output = file.replace('.png', '.json')
    await processSingleFile(file, output, AvatarDefinitions.getLayer(args[1]), parseInt(args[2]))
  }
}

main(process.argv.slice(2))
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '🛠️   Done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
