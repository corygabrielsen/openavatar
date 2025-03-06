import {
  AvatarDefinitions,
  AvatarLayerStack,
  LayerDescriptor,
  PatternDescriptor,
  PatternPaletteDescriptor,
} from '@openavatar/types'
import { Palette, PatternFile, PatternHex, PatternMaster, PatternTexture, Texture } from '../lib'
import { PaletteFileReader } from './read/PaletteFileReader'
import { PatternFileReader } from './read/PatternFileReader'
import {
  ArtifactEncoder,
  ImageArtifacts,
  ImageArtifactsPolicy,
  PaletteArtifacts,
  PatternArtifacts,
  PatternPaletteData,
  RenderPatternArtifacts,
  SpriteArtifacts,
  SpritesheetArtifacts,
} from './write/ArtifactEncoder'
import { ArtifactWriter } from './write/ArtifactWriter'

export type RenderArgs = {
  imageArtifactsPolicy: ImageArtifactsPolicy
  spritePolicy: boolean
  spritesheetPolicy: boolean
}

abstract class BaseRenderPipeline {
  constructor(public readonly args: RenderArgs) {}
  ///////////////////////////////////////////////////////////////////////////////////////////
  // Palette
  ///////////////////////////////////////////////////////////////////////////////////////////

  async readPalettes(): Promise<Palette[][]> {
    const palettes: Palette[][] = []

    const n: number = AvatarDefinitions.getNumPaletteCodes()
    for (let i = 0; i < n; i++) {
      palettes.push(await PaletteFileReader.readPaletteFilesByCode(i))
    }
    return palettes
  }
}

/**
 * Render all patterns for all layers
 * @returns the pattern palette data
 */
export class RenderPalettesPipeline extends BaseRenderPipeline {
  /**
   * Render all patterns for all layers
   * @returns the pattern palette data
   */
  async run(): Promise<PaletteArtifacts[][]> {
    // palettes
    const palettes: Palette[][] = await this.readPalettes()
    return await this.renderPalettes(palettes)
  }

  async renderPalettes(palettes: Palette[][]): Promise<PaletteArtifacts[][]> {
    const artifacts: PaletteArtifacts[][] = []

    const n: number = AvatarDefinitions.getNumPaletteCodes()
    for (let i = 0; i < n; i++) {
      artifacts.push([])
      for (let j = 0; j < palettes[i].length; j++) {
        const palette: Palette = palettes[i][j]
        const paletteArtifacts: PaletteArtifacts = ArtifactEncoder.encodePalette(palette)
        ArtifactWriter.writePaletteArtifacts(
          ArtifactWriter.paletteArtifactsFilepathPrefix(palette.descriptor),
          paletteArtifacts
        )
        artifacts[i].push(paletteArtifacts)
      }
    }
    return artifacts
  }
}

/**
 * Render all patterns for all layers
 * @returns the pattern palette data
 */
export class RenderPatternsPipeline extends BaseRenderPipeline {
  /**
   * Render all patterns for all layers
   * @returns the pattern palette data
   */
  async run(): Promise<RenderPatternArtifacts[]> {
    // palettes
    const palettes: Palette[][] = await this.readPalettes()

    // patterns
    const patternArtifacts: RenderPatternArtifacts[] = []
    for (const layer of AvatarLayerStack.iter()) {
      patternArtifacts.push(...(await this.renderLayer(layer, palettes)))
    }

    return patternArtifacts
  }

  async runParalellized(): Promise<RenderPatternArtifacts[]> {
    console.log('TODO')
    return []
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  // Layer
  ///////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Render all patterns for a layer
   * @param layer the layer to render
   * @param palettes the palettes to use, by (palette code, index)
   * @returns the pattern palette data
   */
  async renderLayer(layer: LayerDescriptor, palettes: Palette[][]): Promise<RenderPatternArtifacts[]> {
    const patternFiles: PatternFile[] = await PatternFileReader.readPatternFilesByLayer(layer)

    const artifacts: RenderPatternArtifacts[] = []
    for (const patternFile of patternFiles) {
      // pattern
      if (
        ['arrowhawk', 'cross', 'plus', 'rainbow', 'trenchcoat', 'two_faced', 'ultra_spiky', 'warpaint_arrow'].includes(
          patternFile.patternName
        ) ||
        patternFile.patternName.includes('eyescreen')
      ) {
        // ANSI orange log
        console.log('\x1b[33m%s\x1b[0m', `Skip pattern ${layer.name}__${patternFile.patternName}`)
        continue
      }

      const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, patternFile.patternName)
      const patternArtifacts: PatternArtifacts = await this.encodeWritePattern(patternFile)

      const paletteCodePalettes: Palette[] = palettes[patternFile.paletteCode]
      if (paletteCodePalettes === undefined) {
        throw new Error(`Palette code ${patternFile.paletteCode} not found. Known: ${Object.keys(palettes)}`)
      }
      const palettesByName = paletteCodePalettes.reduce((acc, palette) => {
        acc[palette.descriptor.name] = palette
        return acc
      }, {} as Record<string, Palette>)

      // images
      const renderedImages: { sprite: SpriteArtifacts; spritesheet: SpritesheetArtifacts }[] = await this.renderImages(
        pattern,
        patternFile,
        palettesByName
      )

      // summary
      const renderArtifacts: RenderPatternArtifacts = {
        pattern: patternArtifacts,
        // palettes: paletteArtifactsArray,
        sprites: this.args.spritePolicy ? renderedImages.map((r) => r.sprite) : [],
        spritesheets: this.args.spritesheetPolicy ? renderedImages.map((r) => r.spritesheet) : [],
      }

      artifacts.push(renderArtifacts)
    }
    return artifacts
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  // Pattern
  ///////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Encode and write the pattern definition without palette info.
   * @param patternFile the pattern file to render
   */
  async encodeWritePattern(patternFile: PatternFile): Promise<PatternArtifacts> {
    const layer: LayerDescriptor = AvatarDefinitions.getLayer(patternFile.layer)
    const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, patternFile.patternName)
    const patternMaster: PatternMaster = PatternMaster.fromPatternFile(pattern, patternFile)
    const patternArtifacts: PatternArtifacts = ArtifactEncoder.encodePattern(patternMaster)
    ArtifactWriter.writePatternArtifacts(ArtifactWriter.patternArtifactsFilepathPrefix(pattern), patternArtifacts)

    return patternArtifacts
  }

  ///////////////////////////////////////////////////////////////////////////////////////////
  // Images
  ///////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Render all images for a pattern file
   * @param pattern the pattern to render
   * @param patternFile the pattern file to render
   * @param palettes the palettes to render
   * @returns the pattern palette data
   */
  async renderImages(
    pattern: PatternDescriptor,
    patternFile: PatternFile,
    palettes: Record<string, Palette>
  ): Promise<{ sprite: SpriteArtifacts; spritesheet: SpritesheetArtifacts }[]> {
    const artifacts: { sprite: SpriteArtifacts; spritesheet: SpritesheetArtifacts }[] = []
    for (const paletteName of Object.keys(palettes)) {
      const patternPalette: PatternPaletteDescriptor = AvatarDefinitions.getPatternPalette(
        pattern.layer,
        pattern,
        paletteName
      )
      const data: { sprite: SpriteArtifacts; spritesheet: SpritesheetArtifacts } = await this.encodeWriteImages({
        // copy pattern info
        pattern,
        scanlines: patternFile.scanlines,
        imageProperties: patternFile.imageProperties,
        // extract palette info
        patternPalette: patternPalette,
        colors: palettes[paletteName].colors,
      })
      artifacts.push(data)
    }
    if (artifacts.length === 0) {
      throw new Error(`No palettes found for ${patternFile.layer}__${patternFile.patternName}`)
    }
    console.log(`\x1b[32m${patternFile.layer}__${patternFile.patternName}: ${artifacts.length}\x1b[0m`)
    return artifacts
  }

  static async createAndEncodeSpritesheet(
    data: PatternPaletteData
  ): Promise<{ spritesheet: PatternTexture; spritesheetArtifacts: ImageArtifacts }> {
    const patternHex = `0x${data.scanlines.map((scanline) => scanline.slice(2)).join('')}` as PatternHex

    const spritesheet: PatternTexture = new PatternTexture(data.imageProperties, patternHex, data.colors)

    const spritesheetArtifacts: ImageArtifacts = ArtifactEncoder.encodeImage(
      spritesheet,
      data.pattern,
      data.patternPalette
    )

    return { spritesheet, spritesheetArtifacts }
  }

  async writeSpritesheet(data: PatternPaletteData, spritesheetArtifacts: ImageArtifacts) {
    await ArtifactWriter.writeImageArtifacts(
      ArtifactWriter.imageArtifactsFilepathPrefix(data.pattern, data.patternPalette, 'spritesheets'),
      spritesheetArtifacts,
      this.args.imageArtifactsPolicy
    )
  }

  static createAndEncodeSprite(spritesheet: PatternTexture, data: PatternPaletteData): ImageArtifacts {
    const sprite: Texture = spritesheet.crop({
      x: 32,
      y: 0,
      width: 32,
      height: 32,
    })

    const spriteArtifacts: ImageArtifacts = ArtifactEncoder.encodeImage(sprite, data.pattern, data.patternPalette)

    return spriteArtifacts
  }

  async writeSprite(data: PatternPaletteData, spriteArtifacts: ImageArtifacts) {
    await ArtifactWriter.writeImageArtifacts(
      ArtifactWriter.imageArtifactsFilepathPrefix(data.pattern, data.patternPalette, 'sprites'),
      spriteArtifacts,
      this.args.imageArtifactsPolicy
    )
  }

  async encodeWriteImages(
    data: PatternPaletteData
  ): Promise<{ sprite: SpriteArtifacts; spritesheet: SpritesheetArtifacts }> {
    const { spritesheet, spritesheetArtifacts } = await RenderPatternsPipeline.createAndEncodeSpritesheet(data)
    await this.writeSpritesheet(data, spritesheetArtifacts)

    const spriteArtifacts = RenderPatternsPipeline.createAndEncodeSprite(spritesheet, data)
    await this.writeSprite(data, spriteArtifacts)

    return { spritesheet: spritesheetArtifacts, sprite: spriteArtifacts }
  }
}
