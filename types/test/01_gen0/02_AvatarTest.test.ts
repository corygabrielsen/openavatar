import { expect } from 'chai'
import { LayerDescriptor } from '../../src/core'
import { PatternPaletteDescriptor } from '../../src/core/Palette'
import { PatternDescriptor } from '../../src/core/Pattern'
import { Avatar, AvatarLike, PatternPaletteNames } from '../../src/gen0/Avatar'
import { AvatarDefinitions } from '../../src/gen0/AvatarDefinitions'
import { AvatarLayerStack } from '../../src/gen0/AvatarLayerStack'
import { DNA } from '../../src/gen0/DNA'

describe('Avatar', function () {
  function toPatternPaletteName(
    pattern: PatternDescriptor,
    patternPalette: PatternPaletteDescriptor
  ): PatternPaletteNames {
    return {
      patternName: pattern.name,
      paletteName: patternPalette.palette.name,
    }
  }

  it('Should be able to create zero Avatar', function () {
    const properties: Record<string, PatternPaletteNames> = {}
    for (const layer of AvatarLayerStack.iter()) {
      const firstPattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, 0)
      const firstPatternFirstPalette: PatternPaletteDescriptor = AvatarDefinitions.getPatternPalette(
        layer,
        firstPattern.index,
        0
      )
      properties[layer.name] = toPatternPaletteName(firstPattern, firstPatternFirstPalette)
    }
    const avatar: Avatar = new Avatar(properties as any as AvatarLike)
    expect(avatar.dna.hex).to.equal(DNA.ZERO.hex)
  })

  it('Should be able to create all-ones pattern Avatar', function () {
    const properties: Record<string, PatternPaletteNames> = {}
    for (const layer of AvatarLayerStack.iter()) {
      const secondPattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, 1)
      const secondPatternFirstPalette: PatternPaletteDescriptor = AvatarDefinitions.getPatternPalette(
        layer,
        secondPattern.index,
        0
      )
      properties[layer.name] = toPatternPaletteName(secondPattern, secondPatternFirstPalette)
    }
    const avatar: Avatar = new Avatar(properties as any as AvatarLike)

    const transform: any = {}
    for (const layer of AvatarLayerStack.iter()) {
      transform[layer.name] = {
        pattern: 1,
      }
    }
    expect(avatar.dna.hex).to.equal(DNA.ZERO.replace(transform).hex)
  })

  function testSerde(avatar: Avatar) {
    const serialized = avatar.dna.toString()
    const deserialized = new Avatar(new DNA(serialized))
    expect(deserialized.dna.hex).to.equal(avatar.dna.hex)
    expect(deserialized.dna.toString()).to.equal(avatar.dna.toString())
    expect(deserialized.equals(avatar)).to.equal(true)
  }

  it('Should be able to create avatars with longhand syntax', function () {
    testSerde(
      new Avatar({
        body: { patternName: 'bare_chest', paletteName: 'human004' },
        topwear: { patternName: 'naked', paletteName: 'transparent' },
      })
    )
  })

  it('Should be able to create avatars with longhand syntax with regex', function () {
    testSerde(
      new Avatar({
        body: { patternName: 'bare_chest', paletteName: 'human004' },
        topwear: { patternName: 'tshirt_gradient3', paletteLike: /__blue$/ },
      })
    )
  })

  it('Should be able to create avatars with shorthand syntax', function () {
    testSerde(
      new Avatar({
        body: ['bare_chest', 'human005'],
        eyes: ['square', 'special_glisten'],
        eyewear: ['vr_rainbow', 'rainbow_silver'],
        hair: ['wild', /__blue_green$/],
      })
    )
  })

  it('Should be able to create avatars with mixed syntax', function () {
    testSerde(
      new Avatar({
        body: ['bare_chest', 'human005'],
        eyes: ['square', 'special_glisten'],
        eyewear: { patternName: 'vr_rainbow', paletteName: 'rainbow_silver' },
        topwear: { patternName: 'tshirt_gradient3', paletteLike: /__blue$/ },
      })
    )
  })

  it('Should be able to create Zero Avatar from DNA from hex', function () {
    new Avatar(new DNA(DNA.ZERO.hex))
    new Avatar(new DNA(DNA.ZERO.toString()))
    new Avatar(new DNA('0x0000000000000000000000000000000000000000000000000000000000000000'))
  })

  function makeDna(entry: string, layers: LayerDescriptor[]): DNA {
    if (entry.length !== 4) {
      throw new Error(`Invalid entry ${entry}`)
    }
    let s: `0x${string}` = '0x'
    const known: LayerDescriptor[] = [...AvatarLayerStack.iter()]
    for (let i = 0; i < known.length; i++) {
      const useLayer: boolean = layers.map((l) => l.name).includes(known[i].name)
      if (useLayer) {
        s += entry
      } else {
        s += '0000'
      }
    }
    // fill rest until it is 32 bytes
    while (s.length < 66) {
      s += '00'
    }
    return new DNA(s)
  }

  it('Should be able to create all-ones pattern Avatar from DNA from hex', function () {
    const layers: LayerDescriptor[] = [...AvatarLayerStack.iter()]
    for (let i = 0; i < layers.length; i++) {
      new Avatar(makeDna('0100', [layers[i]]))
    }
    new Avatar(makeDna('0100', layers))
  })

  it('Should be able to create all-ones pattern + palette Avatar from DNA from hex', function () {
    const layers: LayerDescriptor[] = [...AvatarLayerStack.iter()]
    for (let i = 0; i < layers.length; i++) {
      new Avatar(makeDna('0101', [layers[i]]))
    }
    new Avatar(makeDna('0101', layers))
  })
})
