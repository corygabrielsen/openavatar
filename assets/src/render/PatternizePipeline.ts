import { AvatarLayerStack, LayerDescriptor } from '@openavatar/types'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { PatternFile, PatternHex, PatternName } from '../lib/PatternFile'
import { PatternTexture, Texture } from '../lib/Texture'
import { JimpReader } from './read/ImageReader'

const ROOT = path.join(path.dirname(__dirname), '..')
const SPRITESHEETS = path.join(ROOT, 'spritesheets')

function logColor(color: string, msg: string, ...args: any[]): void {
  console.log(`\x1b[${color}m${msg}\x1b[0m`, ...args)
}

function logGreen(msg: string, ...args: any[]): void {
  logColor('32', msg, ...args)
}

/******************************************************
 * Patternize Pipeline
 * 1. map layers to spritesheet filepaths
 * 2. filter out spritesheets that should be skipped
 * 3. read spritesheets
 * 4. map spritesheets to pattern artifacts
 * 5. group by pattern string
 * 6. write unique patterns
 ******************************************************/

/******************************************************
 * 1. map layers to spritesheet filepaths
 ******************************************************/

interface LayerStyleSpritesheetFilepath {
  layer: string
  pattern: string
  palette: string
  filepath: string
}

function getSpritesheetsForLayer(layer: LayerDescriptor): string[] {
  // TODO try reading from the outputted spritesheets at artifacts/spritesheets/<layer_name>/*.png
  const globStr: string = path.join(ARTIFACTS, 'spritesheets', layer.name, '**/*.png')
  console.log(globStr)
  const spritesheetFiles = glob.sync(globStr)
  if (spritesheetFiles.length === 0) {
    throw new Error(`No images found in ${SPRITESHEETS}`)
  }
  return spritesheetFiles
}

function toSpritesheets(layer: LayerDescriptor): LayerStyleSpritesheetFilepath[] {
  return getSpritesheetsForLayer(layer).map((f) => {
    const filenameNoExt = path.basename(f, path.extname(f))
    const split = filenameNoExt.split('__')
    const layer = split[0]
    const pattern = split[1]
    const palette = split[2]
    return { layer, pattern, palette, filepath: f }
  })
}

/******************************************************
 * 2. read spritesheets
 ******************************************************/

interface LayerStyleSpritesheetTexture extends LayerStyleSpritesheetFilepath {
  texture: Texture
}

async function readSpritesheet(input: LayerStyleSpritesheetFilepath): Promise<LayerStyleSpritesheetTexture> {
  const texture: Texture = await new JimpReader(input.filepath).read()
  return { ...input, texture }
}

/******************************************************
 * 3. map spritesheets to pattern artifacts
 ******************************************************/

interface LayerStylePatternTexture extends LayerStyleSpritesheetTexture {
  patternTexture: PatternTexture
}

function toPattern(input: LayerStyleSpritesheetTexture): LayerStylePatternTexture {
  return {
    ...input,
    // patternize
    patternTexture: PatternTexture.from(input.texture),
  }
}

/******************************************************
 * 4. group by pattern hex string
 ******************************************************/

function groupByPattern(input: LayerStylePatternTexture[]): Map<PatternHex, PatternFile> {
  return input.reduce((map: Map<PatternHex, PatternFile>, element: LayerStylePatternTexture) => {
    const existing = map.get(element.patternTexture.patternHex)
    // corresponds to the map above which only overrides the first one for brevity since we de-dupe here
    const patternNameToUse = existing?.patternName || element.pattern
    const paletteName = element.palette
    console.log(`(${element.layer}, ${patternNameToUse}) -> ${paletteName}`)
    // If this is the first time we've encountered this pattern for this layer, add it to the pattern map
    if (!existing) {
      map.set(
        element.patternTexture.patternHex,
        new PatternFile(
          element.layer,
          patternNameToUse,
          -1,
          element.patternTexture.properties,
          PatternFile.splitScanlines(element.patternTexture.patternHex, element.patternTexture.width)
        )
      )
      if (element.patternTexture.palette.length > 32) {
        console.log(`Palette length is > 32 for ${patternNameToUse} ${element.patternTexture.palette}`)
      }
    } else {
      // we've already encountered this pattern for this layer
    }
    return map
  }, new Map<PatternHex, PatternFile>())
}

/******************************************************
 * 5. write resulting unique patterns
 ******************************************************/
const ARTIFACTS = path.join(ROOT, 'artifacts')
const ARTIFACTS_PATTERNS = path.join(ARTIFACTS, '__patterns__')

async function getOutputFilepathForPatternJSONArtifactsNoExt(
  layerName: string,
  patternName: PatternName
): Promise<string> {
  const outputDir = path.join(ARTIFACTS_PATTERNS, layerName)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  // override from lookup if needed
  return path.join(outputDir, `${layerName}__${patternName}`)
}

// write all the patterns for a layer
async function writePatternFile(input: PatternFile): Promise<string> {
  const patternFilepath = `${await getOutputFilepathForPatternJSONArtifactsNoExt(input.layer, input.patternName)}.json`
  fs.writeFileSync(patternFilepath, JSON.stringify(input, null, 2))
  logGreen(path.relative(ROOT, patternFilepath))
  return patternFilepath
}

type WrittenPatternFile = {
  filepath: string
  patternFile: PatternFile
}

// write all the patterns for a layer
async function writeArtifacts(groupedPatterns: Map<PatternHex, PatternFile>): Promise<WrittenPatternFile[]> {
  const written: WrittenPatternFile[] = []
  for (const patternFile of groupedPatterns.values()) {
    const filepath: string = await writePatternFile(patternFile)
    written.push({ filepath, patternFile })
  }
  return written
}

export class PatternizeLayerPipeline {
  constructor(public layer: LayerDescriptor) {}
  async run(): Promise<PatternFile[]> {
    // 1. map layers to spritesheet filepaths
    // 2. read spritesheets
    const input: LayerStyleSpritesheetFilepath[] = toSpritesheets(this.layer)
    const spritesheets: LayerStyleSpritesheetTexture[] = await Promise.all(input.map(readSpritesheet))

    // 3. map spritesheets to pattern artifacts
    const patterns: LayerStylePatternTexture[] = spritesheets.map(toPattern)

    // const artTemplates: LayerStylePatternTexture[] = patterns.map(toArtTemplate)

    // 4. group by pattern string
    const groupedPatterns: Map<PatternHex, PatternFile> = groupByPattern(patterns)

    // 5. write unique patterns
    const out: WrittenPatternFile[] = await writeArtifacts(groupedPatterns)

    return out.map((o) => o.patternFile)
  }
}

export class PatternizePipeline {
  async run(): Promise<Map<string, PatternFile[]>> {
    const filepathsByLayer: Map<string, PatternFile[]> = new Map()
    for (const layer of AvatarLayerStack.iter()) {
      filepathsByLayer.set(layer.name, await new PatternizeLayerPipeline(layer).run())
    }
    return filepathsByLayer
  }
}
