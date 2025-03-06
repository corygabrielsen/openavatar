import { AvatarLayerStack, PatternPaletteDescriptor } from '@openavatar/types'

export function makeLabel(patternPalette: PatternPaletteDescriptor, usePatternLabel?: boolean): string | undefined {
  let label: string | undefined = usePatternLabel ? patternPalette.pattern.name : patternPalette.palette.name
  // console.log('makeLabel', label)
  // remove "uiCategory" prefix from label, if present
  //   label = label.replace(`${label}`, '')
  // if the label starts with _ we can remove it
  if (label.match(/^_/)) {
    label = label.replace(/^_/, '')
  }
  // if the label is now just an integer, we don't need to show it
  // if (label.match(/^\d+$/)) {
  //   label = undefined
  // }
  if (!usePatternLabel) {
    if (label.startsWith('natural_') && patternPalette.pattern.layer.name !== AvatarLayerStack.makeup.name) {
      label = label.replace('natural_', '')
    }
    if (label.startsWith('human') && patternPalette.pattern.layer.name === AvatarLayerStack.body.name) {
      label = label.replace('human', '')
    }
    const replacePrefixes = ['theme__', 'metal_alloy_', 'metal_', 'crystal_', 'carbon_']
    for (const prefix of replacePrefixes) {
      if (label.startsWith(prefix)) {
        label = label.replace(prefix, '')
      }
    }
  }
  if (label === '') {
    label = undefined
  }
  return label
}
