import { LayerDescriptor } from '@openavatar/types'
import fs from 'fs'
import path from 'path'
import { ColorFormat } from '../../lib/ImageProperties'
import { PatternFile } from '../../lib/PatternFile'
import { PROJECT_ASSETS_DIR } from '../../utils/FileUtils'

const SRC_PATTERNS = path.join(PROJECT_ASSETS_DIR, 'assets', 'patterns')

/**
 * Utility class to read pattern files
 */
export class PatternFileReader {
  /**
   * Read a pattern file
   * @param patternFilepath the path to the pattern file
   * @returns the pattern file
   */
  static async readPatternFile(filepath: string): Promise<PatternFile> {
    const contents = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    if (!filepath.includes(contents.patternName)) {
      throw new Error(`Expected file contents patternName "${contents.patternName}" in ${filepath}`)
    }
    return new PatternFile(
      contents.layer,
      contents.patternName,
      contents.paletteCode,
      {
        size: {
          width: contents.imageProperties.size.width,
          height: contents.imageProperties.size.height,
        },
        colorFormat: ColorFormat.valueOf(contents.imageProperties.colorFormat),
      },
      contents.scanlines
    )
  }

  /**
   * Read all the pattern files for a given layer
   * @param layer the layer to read
   * @returns the patterns for the layer
   */
  static async readPatternFilesByLayer(layer: LayerDescriptor): Promise<PatternFile[]> {
    const dir: string = path.join(SRC_PATTERNS, layer.name)
    const filepaths: string[] = fs.readdirSync(dir).map((filename) => path.join(dir, filename))
    if (filepaths.length === 0) {
      throw new Error(`No pattern files found for ${layer.name}`)
    }
    // check they all end in .json
    for (const filepath of filepaths) {
      if (!filepath.endsWith('.json')) {
        throw new Error(`Expected pattern file to end in .json: ${filepath}`)
      }
    }
    // now we can read them
    return await Promise.all(
      filepaths.map(async (filepath) => {
        return await PatternFileReader.readPatternFile(filepath)
      })
    )
  }
}
