import {
  Avatar,
  AvatarDefinitions,
  AvatarLayerStack,
  AvatarLike,
  DNA,
  PatternDescriptor,
  PatternPaletteDescriptor,
} from '@openavatar/types'
import { FIRST_100 } from './First100'
import { FIRST_100_BACKGROUND_COLORS } from './First100Backgrounds'

let allOnes = DNA.ZERO
for (const layer of AvatarLayerStack.iter()) {
  allOnes = allOnes.replace({
    [layer.name]: {
      pattern: 1,
      palette: 1,
    },
  })
}

// max index for each layer
let allMaxDna = DNA.ZERO
const maxPatternDnas: DNA[] = []
for (const layer of AvatarLayerStack.iter()) {
  const numPatterns = AvatarDefinitions.getPatternCount(layer)
  const pattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, numPatterns - 1)
  const numPalettes = AvatarDefinitions.getPaletteCount(pattern)
  const patternPalette: PatternPaletteDescriptor = AvatarDefinitions.getPatternPalette(layer, pattern, numPalettes - 1)

  const dna = DNA.ZERO.replace({
    [layer.name]: {
      pattern: pattern.index,
      palette: patternPalette.palette.index,
    },
  })
  allMaxDna = allMaxDna.or(dna)
  maxPatternDnas.push(dna)
}
maxPatternDnas.push(allMaxDna)

const COOL_TOPLESS_WILD_HAIR_MARINE_BLUE: Avatar = new Avatar({
  body: ['bare_chest', 'human005'],
  eyes: ['square', 'black'],
  bottomwear: ['pants_speckled1', /__marine_blue$/],
  eyewear: ['ar_vr_visor', 'transluscent_cyan'],
  hair: ['wild', /__marine_blue$/],
})

const COOL_TOPLESS_CYBERCOTTON = new Avatar({
  body: ['bare_chest', 'human005'],
  eyes: ['square', 'black'],
  bottomwear: ['pants_speckled1', /__cybercotton$/],
  eyewear: ['ar_vr_visor', 'semi_transluscent_cyan'],
  hair: ['wild', /__cybercotton$/],
})

const COOL_TOPLESS_LONG_HAIR_AZURE_ESCAPE: Avatar = new Avatar({
  body: ['bare_chest', 'human005'],
  eyes: ['square', 'black'],
  bottomwear: ['pants_speckled1', /__azure_escape$/],
  makeup: ['eye_shadow_square', 'subtle_cyan'],
  facial_hair: ['bushy_beard', /__azure_escape$/],
  hair: ['long', /__azure_escape$/],
})

const REDHEAD: Avatar = new Avatar({
  body: ['bare_chest', 'human005'],
  eyes: ['square', 'black'],
  hair: ['wild', 'natural_redhead'],
})

const SUNBURN: Avatar = new Avatar({
  body: ['bare_chest', 'sunburn4'],
  eyes: ['square', 'black'],
  hair: ['wild', 'natural_redhead'],
})

const BOXER: Avatar = new Avatar({
  body: ['broad_chest', 'sunburn2'],
  eyes: ['square', 'black'],
  bottomwear: ['shorts_solid4', /__red$/],
  handwear: ['gloves7', /__blood_red$/],
  outerwear: ['big_belt', 'brown_gold'],
  facial_hair: ['bushy_beard', 'natural_lightest_brown'],
  hair: ['fohawk', 'natural_light_brown'],
})

export type PartialOpenAvatarProfilePictureSettings = {
  rendererKey?: string
  overrideBackground?: boolean
  backgroundColor?: `#${string}`
  maskBelowTheNeck?: boolean
}

export class TestAvatars {
  public static readonly MAX_PATTERN_PALETTES: Avatar[] = maxPatternDnas.map((dna) => new Avatar(dna))
}

export class NPCAvatar extends Avatar {
  constructor(input: Avatar | AvatarLike, public readonly pfpSettings: PartialOpenAvatarProfilePictureSettings) {
    if (input instanceof Avatar) {
      input = input.dna
    }
    super(input)
  }
}

function getPfpSettingsForFirst100(index: number): PartialOpenAvatarProfilePictureSettings {
  if (index >= FIRST_100_BACKGROUND_COLORS.length) {
    return {
      overrideBackground: false,
    }
  }
  const backgroundColor: `#${string}` | undefined = FIRST_100_BACKGROUND_COLORS[index]
  if (!backgroundColor) {
    return {
      overrideBackground: false,
    }
  }
  return {
    overrideBackground: !!backgroundColor,
    backgroundColor,
  }
}

export class NPC {
  public static readonly ZERO: NPCAvatar = new NPCAvatar(DNA.ZERO, { overrideBackground: false })
  public static readonly ALL_ONES = new NPCAvatar(allOnes, { overrideBackground: false })
  public static readonly COOL_TOPLESS_WILD_HAIR_MARINE_BLUE = new NPCAvatar(COOL_TOPLESS_WILD_HAIR_MARINE_BLUE, {
    overrideBackground: true,
    backgroundColor: '#00FFFF',
  })
  public static readonly COOL_TOPLESS_CYBERCOTTON = new NPCAvatar(COOL_TOPLESS_CYBERCOTTON, {
    overrideBackground: true,
    backgroundColor: '#FF00FF',
  })
  public static readonly COOL_TOPLESS_LONG_HAIR_AZURE_ESCAPE = new NPCAvatar(COOL_TOPLESS_LONG_HAIR_AZURE_ESCAPE, {
    overrideBackground: true,
    backgroundColor: '#3CB5E6',
    maskBelowTheNeck: true,
  })
  public static readonly REDHEAD = new NPCAvatar(REDHEAD, {
    overrideBackground: true,
    backgroundColor: '#DD6154',
    maskBelowTheNeck: true,
  })
  public static readonly SUNBURN = new NPCAvatar(SUNBURN, {
    rendererKey: 'base',
    overrideBackground: true,
    backgroundColor: '#DD6154',
    maskBelowTheNeck: true,
  })
  public static readonly BOXER = new NPCAvatar(BOXER, {
    overrideBackground: false,
  })

  public static readonly FIRST_100 = FIRST_100.map(
    (avatar: Avatar, index: number) => new NPCAvatar(avatar, getPfpSettingsForFirst100(index))
  )
}
