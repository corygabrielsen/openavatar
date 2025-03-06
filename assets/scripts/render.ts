#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { RenderArgs, RenderPalettesPipeline, RenderPatternsPipeline } from '../src/render/RenderPipeline'
import {
  PaletteArtifacts,
  PatternArtifacts,
  RenderPatternArtifacts,
  SpriteArtifacts,
} from '../src/render/write/ArtifactEncoder'

const ROOT = path.dirname(__dirname)
const GENERATED = path.join(ROOT, 'generated')

async function writeGeneratedFile(filepath: string, content: string) {
  const fd = fs.openSync(filepath, 'w')
  fs.writeSync(fd, `// Generated file. Do not edit it directly.\n`)
  fs.writeSync(fd, `//\n`)
  fs.writeSync(fd, content)
  fs.closeSync(fd)
  console.log(filepath.replace(ROOT, 'assets'))
}

// write the module file to export all the images
async function buildPalettesModuleFile(data: PaletteArtifacts[][]): Promise<void> {
  // write the palette file with all the palettes
  const palettes: PaletteArtifacts[] = data.flat()
  await writeGeneratedFile(path.join(GENERATED, 'palettes.ts'), palettes.map((p) => p.ts).join('\n'))
}

// write the module file to export all the images
async function buildModuleFile(data: RenderPatternArtifacts[]): Promise<void> {
  // write the patterns file with all the patterns
  const patterns: PatternArtifacts[] = data.map((d) => d.pattern)
  await writeGeneratedFile(path.join(GENERATED, 'patterns.ts'), patterns.map((p) => p.ts).join('\n'))

  // write the sprites file with all the base64 PNGs
  const sprites: SpriteArtifacts[] = data.map((d) => d.sprites).flat()
  await writeGeneratedFile(path.join(GENERATED, 'sprites.ts'), sprites.map((p) => p.ts).join('\n'))
}

async function main(): Promise<void> {
  // filter out non-TS files
  if (!fs.existsSync(GENERATED)) {
    fs.mkdirSync(GENERATED)
  }

  const renderArgs: RenderArgs = {
    // set png true for aesprite/photoshop export
    imageArtifactsPolicy: { hex: false, bmp: false, png: true, base64: false, ts: true },
    spritePolicy: true,
    spritesheetPolicy: false,
  }
  // palettes
  const paletteArtifacts: PaletteArtifacts[][] = await new RenderPalettesPipeline(renderArgs).run()
  await buildPalettesModuleFile(paletteArtifacts)

  // patterns
  const patternArtifacts: RenderPatternArtifacts[] = await new RenderPatternsPipeline(renderArgs).run()
  await buildModuleFile(patternArtifacts)
}

main()
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '🛠️   Done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
