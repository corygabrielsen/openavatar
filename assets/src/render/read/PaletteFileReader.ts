import { AvatarDefinitions, PaletteDescriptor } from '@openavatar/types'
import fs from 'fs'
import path from 'path'
import { ColorCode, Palette } from '../../lib'
import { PROJECT_ASSETS_DIR } from '../../utils/FileUtils'

const SRC_PALETTES = path.join(PROJECT_ASSETS_DIR, 'assets', 'palettes')

function fmthex(n: number): string {
  return n.toString(16).padStart(2, '0')
}

/**
 * Utility class to read palette files
 */
export class PaletteFileReader {
  /**
   * Read a palette file
   * @param filepath the path to the palette file
   * @returns the color palette
   */
  static async readPaletteFile(filepath: string): Promise<ColorCode[]> {
    const contents = await fs.promises.readFile(filepath, 'utf8')
    try {
      return PaletteFileReader.decodePal(contents)
    } catch (e) {
      console.error(`Error reading palette file ${filepath}`)
      throw e
    }
  }

  private static async getPaletteDir(paletteCode: number): Promise<string> {
    // we need to find the subdir that starts with the paletteCode followed by a colon
    const paletteDirs: string[] = (await fs.promises.readdir(SRC_PALETTES)).filter((file) =>
      file.startsWith(`${paletteCode}:`)
    )
    if (paletteDirs.length === 0) {
      throw new Error(`No palette directory found for paletteCode ${paletteCode}`)
    } else if (paletteDirs.length > 1) {
      throw new Error(`Multiple palette directories found for paletteCode ${paletteCode}`)
    }
    return path.join(SRC_PALETTES, paletteDirs[0])
  }

  /**
   * Read all the palette files for a given palette code.
   * @param code the palette code
   * @returns the color palettes
   */
  static async readPaletteFilesByCode(code: number): Promise<Palette[]> {
    const paletteDir = await PaletteFileReader.getPaletteDir(code)

    // retrieve palettes from directory with *.pal files
    const files: string[] = await fs.promises.readdir(paletteDir)
    const paletteFilenames = files
      // match .pal extension to avoid the README.md file
      .filter((file) => file.match(/\.pal$/))
    const paletteFilepaths = paletteFilenames.map((filename) => path.join(paletteDir, filename))

    const indirectPaletteFiles = files.filter((file) => file.match(/\.pal\.indirect$/))
    // we have indirect palette files, we need to read them and replace the palette files
    for (const indirectPaletteFile of indirectPaletteFiles) {
      const ref: string = indirectPaletteFile.replace('.pal.indirect', '')
      const indirectPaletteDir = path.join(SRC_PALETTES, 'base', ref)
      const indirectFiles: string[] = await fs.promises.readdir(indirectPaletteDir)
      const indirectPaletteFiles = indirectFiles.filter((file) => file.match(/\.pal$/))
      if (indirectPaletteFiles.length === 0) {
        throw new Error(`No indirect palette file found for ${indirectPaletteDir}`)
      }
      // extend the list of paletteFiles with the indirect palette files
      paletteFilepaths.push(...indirectPaletteFiles.map((file) => path.join(indirectPaletteDir, file)))
    }

    const palettes: Record<string, Palette> = {}
    for (const paletteFilepath of paletteFilepaths) {
      const colors: ColorCode[] = await PaletteFileReader.readPaletteFile(paletteFilepath)
      const paletteName: string = path.basename(paletteFilepath).replace('.pal', '')
      let paletteDescriptor: PaletteDescriptor
      try {
        paletteDescriptor = AvatarDefinitions.getPalette(code, paletteName)
      } catch (e) {
        console.error(`Error reading palette descriptor for ${paletteFilepath}`)
        throw e
      }

      const palette: Palette = {
        descriptor: paletteDescriptor,
        colors,
      }
      palettes[paletteName] = palette
    }
    const palettesArray: Palette[] = Object.values(palettes)
    if (palettesArray.length === 0) {
      throw new Error(`No palettes found for palette code: ${code}`)
    }
    palettesArray.sort((a, b) => a.descriptor.index - b.descriptor.index)
    return palettesArray
  }

  /**
   * Read a .pal file of the form
   * ```
   * JASC-PAL
   * 0100
   * 8
   * 0 0 0 0
   * 47 18 33 255
   * 72 27 50 255
   * 84 31 58 255
   * 94 35 66 255
   * 120 44 83 255
   * 137 50 95 255
   * 191 78 136 255
   * ```
   * @param filepath string
   * @returns ColorCode[] the palette
   */
  static decodePal(contents: string): ColorCode[] {
    // header line should be JASC-PAL
    const lines = contents
      .split('\n')
      .map((line) => line.replace('\r', ''))
      .filter((line) => line.length > 0)
    if (lines[0] !== 'JASC-PAL') {
      console.error(lines[0])
      throw new Error(`invalid palette file line #1 (expected 'JASC-PAL' but got '${lines[0]}')`)
    }
    // second line should be 0100
    if (lines[1] !== '0100') {
      console.error(lines)
      throw new Error(`invalid palette file line #2 (expected '0100')`)
    }
    // third line should be the number of colors
    const numColors = parseInt(lines[2], 10)
    if (isNaN(numColors)) {
      console.error(lines)
      throw new Error(`invalid palette file line #3 (expected numColors)`)
    }
    // remaining lines should be the colors
    const colorCodes: ColorCode[] = []
    for (let i = 0; i < numColors; i++) {
      const color = lines[3 + i]
      const [r, g, b, a] = color.split(' ').map((c) => parseInt(c, 10))
      if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
        throw new Error(`invalid palette file line #${4 + i} (expected color RRR GGG BBB AAA but got '${color}')`)
      }
      // eslint-disable-next-line no-inner-declarations
      function is_uint8(n: number): boolean {
        return typeof n === 'number' && n >= 0 && n <= 255
      }
      if (!is_uint8(r) || !is_uint8(g) || !is_uint8(b) || !is_uint8(a) /*|| (a !== 0 && a !== 255)*/) {
        for (let j = 0; j < lines.length; j++) {
          if (j === 3 + i) {
            // highlight red with ANSIColor
            console.error(`\x1b[31m${lines[j]}\x1b[0m`)
          } else {
            console.log(lines[j])
          }
        }
        throw new Error(`invalid palette file line #${3 + i} (expected color)`)
      }
      const colorCode: ColorCode = `#${fmthex(r)}${fmthex(g)}${fmthex(b)}${fmthex(a)}`
      colorCodes.push(colorCode)
    }
    // if there are anymore lines, fail
    if (lines.length > 3 + numColors) {
      // print allowed lines in white then extra lines in red
      for (let i = 0; i < lines.length; i++) {
        if (i < 3 + numColors) {
          console.log(lines[i])
        } else {
          console.error(`\x1b[31m${lines[i]}\x1b[0m`)
        }
      }
      throw new Error(`invalid palette file (too many lines)`)
    }

    // the first color should be #00000000
    if (colorCodes[0] !== '#00000000') {
      throw new Error(`invalid palette file (first color should be #00000000)`)
    }

    // the second color, if it exists, should be #000000ff
    if (colorCodes.length > 1 && colorCodes[1] !== '#000000ff') {
      throw new Error(`invalid palette file (second color should be #000000ff)`)
    }

    return colorCodes
  }
}
