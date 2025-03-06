import { AvatarDefinitions, AvatarLayerStack, PatternDescriptor } from '@openavatar/types'

export type Outfit = {
  label: string
  bottomwear: PatternDescriptor
  topwear: PatternDescriptor
}

export const OUTFITS_NAKED: Outfit[] = [
  {
    label: 'naked',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'naked'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'naked'),
  },
]

export const OUTFITS_MATCHING: Outfit[] = [
  {
    label: 'simple',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_solid4'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_solid7'),
  },
  {
    label: 'simple2',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_solid2'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_solid5'),
  },
  {
    label: 'work',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_solid5'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_pocket4'),
  },
  {
    label: 'work2',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_solid5'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_pocket6'),
  },
  {
    label: 'work3',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_solid6'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_pocket7'),
  },
  {
    label: 'workout',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'shorts_gradient3'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_gradient3'),
  },
  {
    label: 'jumpsuit1',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_speckled1'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_speckled1'),
  },
  {
    label: 'jumpsuit2',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_speckled2'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_speckled2'),
  },
  {
    label: 'jumpsuit3',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_speckled3'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_speckled3'),
  },
  {
    label: 'jumpsuit4',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_speckled4'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_speckled4'),
  },
]

export const OUTFITS_SPACE_SUIT_COLORS: string[] = [
  'light',
  'dark',
  'diamond',
  'gold',
  'silver',
  'black_hole',
  'milky_way',
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'asteroid_belt',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'supernova',
  'quasar',
  'cosmic_void',
  'cosmic_void2',
  'cyberpunk',
  'tech_blue',
  'cybernetic',
  'military_green',
  'alien_green',
  'matrix',
  'red_dwarf',
  'red_orange',
  'red',
  'pink',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
]

export const OUTFITS_SPACE_SHIRT_SHORTS: Outfit[] = OUTFITS_SPACE_SUIT_COLORS.map((color) => ({
  label: `space_shirt_${color}`,
  bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'space_shorts'),
  topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'space_shirt'),
}))

export const OUTFITS_SPACE_SHIRTS: Outfit[] = OUTFITS_SPACE_SUIT_COLORS.map((color) => ({
  label: `space_shirt_${color}`,
  bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'space_suit'),
  topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'space_shirt'),
}))

export const OUTFITS_SPACE_SUITS: Outfit[] = OUTFITS_SPACE_SUIT_COLORS.map((color) => ({
  label: `space_suit_${color}`,
  bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'space_suit'),
  topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'space_suit'),
}))

export const OUTFITS_FEMININE: Outfit[] = [
  {
    label: 'dress_gradient1',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'naked'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'dress_gradient1'),
  },
  {
    label: 'dress_gradient2',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'naked'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'dress_gradient2'),
  },
  {
    label: 'dress_lowcut_gradient1',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'naked'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'dress_lowcut_gradient1'),
  },
  {
    label: 'dress_lowcut_gradient2',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'naked'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'dress_lowcut_gradient2'),
  },
  {
    label: 'tanktop_and_skirt',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'skirt_gradient4'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tanktop_solid6'),
  },
  {
    label: 'tshirt_and_skirt',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'skirt_gradient4'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_solid6'),
  },
  {
    label: 'tennis',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'skirt_gradient2'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'vneck_gradient1'),
  },
  {
    label: 'midriff',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'skirt_gradient2'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'croptop_gradient3'),
  },
  {
    label: 'two_piece_gradient',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'skirt_gradient1'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'vneck_gradient1'),
  },
  {
    label: 'two_piece_radial',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'skirt_radial_gradient3'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_gradient3'),
  },
  {
    label: 'free_the_nipple',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'skirt_gradient2'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'naked'),
  },
]

export const OUTFITS_COORDINATED: Outfit[] = [
  {
    label: 'swim',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'shorts_gradient4'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'naked'),
  },
  {
    label: 'sunbathe',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'shorts_speckled1'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'naked'),
  },
  {
    label: 'cool',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_solid5'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_gradient3'),
  },
  {
    label: 'stylish',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_solid5'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'tshirt_speckled3'),
  },
  {
    label: 'sixpack_abs',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_speckled1'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'croptop_gradient3'),
  },
  {
    label: 'rockstar',
    bottomwear: AvatarDefinitions.getPattern(AvatarLayerStack.bottomwear, 'pants_speckled4'),
    topwear: AvatarDefinitions.getPattern(AvatarLayerStack.topwear, 'naked'),
  },
]
