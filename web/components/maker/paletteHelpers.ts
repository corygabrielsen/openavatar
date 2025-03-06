import { Avatar, AvatarLayerStack, LayerDescriptor, PatternPaletteDescriptor } from '@openavatar/types'

// the preference is hierarchical for each layer pattern option:
// 1. if the pattern is the current avatar pattern, use the current avatar palette
// 2a. if the layer is bottomwear/handwear, try to match the topwear palette if not naked
// 2b. else if the layer is topwear/footwear, try to match the bottomwear palette if not naked
// 3. else try to match the hair palette if not bald
export function selectPreferredMatchingPalette(
  patternPalettes: PatternPaletteDescriptor[],
  avatar: Avatar,
  layer: LayerDescriptor
): PatternPaletteDescriptor | null {
  // first we will see if there is a palette that has the same name as the current avatar
  // that would allow us to show it in the same theme as the current avatar
  let palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === avatar.get(layer).palette.name)

  const topwearPaletteName = avatar.get(AvatarLayerStack.topwear).palette.name
  const handwearPaletteName = avatar.get(AvatarLayerStack.handwear).palette.name
  const bottomwearPaletteName = avatar.get(AvatarLayerStack.bottomwear).palette.name
  const footwearPaletteName = avatar.get(AvatarLayerStack.footwear).palette.name
  // this is a special case for the clothings
  if (!palette) {
    if (layer.name === AvatarLayerStack.bottomwear.name) {
      // try to match the topwear similar to how we tried to match the hair
      if (topwearPaletteName !== 'naked') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === topwearPaletteName)
      }

      if (handwearPaletteName !== 'none') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === handwearPaletteName)
      }

      if (footwearPaletteName !== 'none') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === footwearPaletteName)
      }
    }

    if (layer.name === AvatarLayerStack.topwear.name) {
      if (bottomwearPaletteName !== 'naked') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === bottomwearPaletteName)
      }

      if (footwearPaletteName !== 'none') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === handwearPaletteName)
      }

      if (handwearPaletteName !== 'none') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === footwearPaletteName)
      }
    }

    if (layer.name === AvatarLayerStack.handwear.name) {
      if (bottomwearPaletteName !== 'naked') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === topwearPaletteName)
      }

      if (footwearPaletteName !== 'none') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === footwearPaletteName)
      }

      if (topwearPaletteName !== 'naked') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === bottomwearPaletteName)
      }
    }

    if (layer.name === AvatarLayerStack.footwear.name) {
      if (topwearPaletteName !== 'naked') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === bottomwearPaletteName)
      }

      if (handwearPaletteName !== 'none') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === handwearPaletteName)
      }

      if (bottomwearPaletteName !== 'naked') {
        palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === topwearPaletteName)
      }
    }
  }

  // if we didn't find a palette with the same name, try matching the hair name
  if (!palette) {
    const hairPaletteName = avatar.get(AvatarLayerStack.hair).palette.name
    if (hairPaletteName !== 'transparent') {
      palette = patternPalettes.find((patternPalette) => patternPalette.palette.name === hairPaletteName)
    }
  }

  return palette || null
}
