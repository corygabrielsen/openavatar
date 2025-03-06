import { AvatarLayerStack, LayerDescriptor, PatternPaletteDescriptor } from '@openavatar/types'

interface GroupRegex {
  name: string // The name of the group, e.g., "naturalBlackWhite"
  regex: RegExp // The regular expression to filter items for the group, e.g., /^natural(black|white)/
}

interface GroupConfig {
  [layerName: string]: {
    patternGroups?: GroupRegex[]
    paletteGroups?: GroupRegex[]
  }
}

const hairColorGroups: GroupRegex[] = [
  {
    name: 'Black / White',
    regex: /^natural_.*(black|white)/,
  },
  {
    name: 'Gray',
    regex: /^natural_.*gray/,
  },
  {
    name: 'Brown',
    regex: /^natural_.*brown/,
  },
  {
    name: 'Blonde',
    regex: /^natural_((?!strawberry).)*blonde/,
  },
  {
    name: 'Red',
    regex: /^natural_.*(red|ginger|strawberry)/,
  },
  {
    name: 'Themes',
    regex: /^theme__/,
  },
]

const eyeColorGroups: GroupRegex[] = [
  {
    name: 'Black',
    regex: /^black/,
  },
  {
    name: 'Special',
    regex: /^special_/,
  },
  {
    name: 'Gray',
    regex: /^gray[0-9]/,
  },
  {
    name: 'Brown',
    regex: /^brown[0-9]/,
  },
  {
    name: 'Hazel',
    regex: /^hazel[0-9]/,
  },
  {
    name: 'Red',
    regex: /^red[0-9]/,
  },
  {
    name: 'Rose Gold',
    regex: /^rose_gold[0-9]/,
  },
  {
    name: 'Coral',
    regex: /^coral[0-9]/,
  },
  {
    name: 'Orange',
    regex: /^orange[0-9]/,
  },
  {
    name: 'Amber',
    regex: /^amber[0-9]/,
  },
  {
    name: 'Yellow',
    regex: /^yellow[0-9]/,
  },
  {
    name: 'Green',
    regex: /^green[0-9]/,
  },
  {
    name: 'Green Gray',
    regex: /^green_gray[0-9]/,
  },
  {
    name: 'Blue Green',
    regex: /^blue_green[0-9]/,
  },
  {
    name: 'Teal',
    regex: /^teal[0-9]/,
  },
  {
    name: 'Blue Gray',
    regex: /^blue_gray[0-9]/,
  },
  {
    name: 'Cyan',
    regex: /^cyan[0-9]/,
  },
  {
    name: 'Turquoise',
    regex: /^turquoise[0-9]/,
  },
  {
    name: 'Blue',
    regex: /^blue[0-9]/,
  },
  {
    name: 'Periwinkle',
    regex: /^periwinkle[0-9]/,
  },
  {
    name: 'Lavender',
    regex: /^lavender[0-9]/,
  },
  {
    name: 'Violet',
    regex: /^violet[0-9]/,
  },
  {
    name: 'Magenta',
    regex: /^magenta[0-9]/,
  },
  {
    name: 'Fuchsia',
    regex: /^fuchsia[0-9]/,
  },
  {
    name: 'Pink',
    regex: /^pink[0-9]/,
  },
]

export const UI_GROUPS: GroupConfig = {
  [AvatarLayerStack.hair.name]: {
    paletteGroups: hairColorGroups,
  },
  [AvatarLayerStack.facial_hair.name]: {
    paletteGroups: hairColorGroups,
  },
  [AvatarLayerStack.left_eye.name]: {
    paletteGroups: eyeColorGroups,
  },
  [AvatarLayerStack.right_eye.name]: {
    paletteGroups: eyeColorGroups,
  },
  both_eyes: {
    paletteGroups: eyeColorGroups,
  },
}

export interface UIGroup {
  name: string
  patternPalettes: PatternPaletteDescriptor[]
}

function groupBy(
  patternPalettes: PatternPaletteDescriptor[],
  groupRegexes: GroupRegex[]
): { [groupName: string]: UIGroup } {
  const groups: { [groupName: string]: UIGroup } = {}
  // initialize groups in proper order
  for (const groupRegex of groupRegexes) {
    groups[groupRegex.name] = { name: groupRegex.name, patternPalettes: [] }
  }

  const addToGroup = (groupName: string, patternPalette: PatternPaletteDescriptor) => {
    if (!groups[groupName]) {
      groups[groupName] = { name: groupName, patternPalettes: [] }
    }
    groups[groupName].patternPalettes.push(patternPalette)
  }

  for (const patternPalette of patternPalettes) {
    let found = false
    for (const groupRegex of groupRegexes) {
      if (groupRegex.regex.test(patternPalette.palette.name)) {
        addToGroup(groupRegex.name, patternPalette)
        found = true
        break
      }
    }
    if (!found) {
      addToGroup('Remaining', patternPalette)
    }
  }

  return groups
}

export function groupByLayer(
  patternPalettes: PatternPaletteDescriptor[],
  layer: LayerDescriptor
): { [groupName: string]: UIGroup } {
  const groups: GroupRegex[] = UI_GROUPS[layer.name]?.paletteGroups || []
  return groupBy(patternPalettes, groups)
}
