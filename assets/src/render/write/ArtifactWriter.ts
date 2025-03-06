import { PaletteDescriptor, PatternDescriptor, PatternPaletteDescriptor } from '@openavatar/types'
import fs from 'fs'
import path from 'path'
import { ASSETS_ARTIFACTS_DIR, PROJECT_ASSETS_DIR } from '../../utils/FileUtils'
import { ImageArtifacts, ImageArtifactsPolicy, PaletteArtifacts, PatternArtifacts } from './ArtifactEncoder'

export class ArtifactWriter {
  ///////////////////////////////////////////////////////////////////////////////////////////
  // Pattern
  ///////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Get the filepath prefix for the artifacts.
   * @param pattern The pattern descriptor.
   * @param subdir The subdirectory to write to.
   * @returns The filepath prefix.
   */
  static patternArtifactsFilepathPrefix(pattern: PatternDescriptor): string {
    return path.relative(
      PROJECT_ASSETS_DIR,
      path.join(ASSETS_ARTIFACTS_DIR, 'patterns', pattern.layer.name, `${pattern.layer.name}__${pattern.name}`)
    )
  }

  /**
   * Write the artifacts to the filesystem.
   * @param filepathNoExt The filepath without the extension.
   * @param artifacts The artifacts to write.
   */
  static async writePatternArtifacts(filepathNoExt: string, artifacts: PatternArtifacts): Promise<void> {
    if (!fs.existsSync(path.dirname(filepathNoExt))) {
      fs.mkdirSync(path.dirname(filepathNoExt), { recursive: true })
    }
    await fs.promises.writeFile(`${filepathNoExt}.ts`, artifacts.ts)
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  // Pattern
  ///////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Get the filepath prefix for the artifacts.
   * @param pattern The pattern descriptor.
   * @param subdir The subdirectory to write to.
   * @returns The filepath prefix.
   */
  static paletteArtifactsFilepathPrefix(palette: PaletteDescriptor): string {
    return path.relative(
      PROJECT_ASSETS_DIR,
      path.join(ASSETS_ARTIFACTS_DIR, 'palettes', 'code', palette.code.toString().padStart(3, '0'), palette.name)
    )
  }

  /**
   * Get the filepath prefix for the artifacts.
   * @param pattern The pattern descriptor.
   * @param patternPalette The palette descriptor.
   * @param subdir The subdirectory to write to.
   * @returns The filepath prefix.
   */
  static paletteArtifactsFilepathPrefixByPattern(
    pattern: PatternDescriptor,
    patternPalette: PatternPaletteDescriptor
  ): string {
    return path.relative(
      PROJECT_ASSETS_DIR,
      path.join(ASSETS_ARTIFACTS_DIR, 'palettes', pattern.layer.name, pattern.name, patternPalette.palette.name)
    )
  }

  /**
   * Write the artifacts to the filesystem.
   * @param filepathNoExt The filepath without the extension.
   * @param artifacts The artifacts to write.
   */
  static async writePaletteArtifacts(filepathNoExt: string, artifacts: PaletteArtifacts): Promise<void> {
    if (!fs.existsSync(path.dirname(filepathNoExt))) {
      fs.mkdirSync(path.dirname(filepathNoExt), { recursive: true })
    }
    await fs.promises.writeFile(`${filepathNoExt}.ts`, artifacts.ts)
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  // Image
  ///////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Get the filepath prefix for the artifacts.
   * @param pattern The pattern descriptor.
   * @param patternPalette The palette descriptor.
   * @param subdir The subdirectory to write to.
   * @returns The filepath prefix.
   */
  static imageArtifactsFilepathPrefix(
    pattern: PatternDescriptor,
    patternPalette: PatternPaletteDescriptor,
    subdir: string
  ): string {
    return path.relative(
      PROJECT_ASSETS_DIR,
      path.join(
        ASSETS_ARTIFACTS_DIR,
        subdir,
        pattern.layer.name,
        `${pattern.layer.name}__${pattern.name}__${patternPalette.palette.name}`
      )
    )
  }

  /**
   * Write the artifacts to the filesystem.
   * @param filepathNoExt The filepath without the extension.
   * @param artifacts The artifacts to write.
   */
  static async writeImageArtifacts(
    filepathNoExt: string,
    artifacts: ImageArtifacts,
    policy: ImageArtifactsPolicy
  ): Promise<void> {
    if (!fs.existsSync(path.dirname(filepathNoExt))) {
      fs.mkdirSync(path.dirname(filepathNoExt), { recursive: true })
    }

    const routines: Promise<void>[] = []
    if (policy.hex) {
      routines.push(fs.promises.writeFile(`${filepathNoExt}.hex`, artifacts.hex))
    }
    if (policy.bmp) {
      routines.push(fs.promises.writeFile(`${filepathNoExt}.bmp`, artifacts.bmp))
    }
    if (policy.png) {
      routines.push(fs.promises.writeFile(`${filepathNoExt}.png`, artifacts.png))
    }
    if (policy.base64) {
      routines.push(fs.promises.writeFile(`${filepathNoExt}.png.base64`, artifacts.base64))
    }
    if (policy.ts) {
      routines.push(fs.promises.writeFile(`${filepathNoExt}.ts`, artifacts.ts))
    }
    await Promise.all(routines)
  }
}
