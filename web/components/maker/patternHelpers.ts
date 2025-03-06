import { Avatar, AvatarLayerStack, LayerDescriptor, PatternPaletteDescriptor } from '@openavatar/types'

/**
 * Filters the list of patterns by a given name.
 *
 * @param patternName - The name to search for within the pattern list.
 * @param list - The list of pattern descriptors to search through.
 * @returns A filtered list of pattern descriptors containing the search name.
 */
function filterBy(patternName: string, list: PatternPaletteDescriptor[]): PatternPaletteDescriptor[] {
  return list.filter((patternPalette) => patternPalette.pattern.name.includes(patternName))
}

/**
 * Reorders the pattern options based on various conditions for the avatar.
 *
 * @param avatar - The Avatar object.
 * @param layer - The layer descriptor for the given AvatarLayerStack.
 * @param options - The list of pattern descriptors.
 * @returns A reordered list of pattern descriptors based on the conditions.
 */
export function reorderOptionsForPatternPicker(
  avatar: Avatar,
  layer: LayerDescriptor,
  options: PatternPaletteDescriptor[]
): PatternPaletteDescriptor[] {
  let result: PatternPaletteDescriptor[] = []
  const body = avatar.get(AvatarLayerStack.body)

  if (body.pattern.name.includes('breasts') || body.pattern.name.includes('feminine')) {
    if (layer.name === AvatarLayerStack.topwear.name) {
      result = [
        ...filterBy('naked', options),
        ...filterBy('dress', options),
        ...filterBy('croptop', options),
        ...filterBy('bra', options),
        ...filterBy('tanktop', options),
        ...filterBy('vneck', options),
      ]
      const remaining = options.filter((option) => !result.some((o) => o.pattern.name === option.pattern.name))
      result = [...result, ...remaining]
    } else if (layer.name === AvatarLayerStack.bottomwear.name) {
      result = [...filterBy('naked', options), ...filterBy('skirt', options)]
      const remaining = options.filter((option) => !result.some((o) => o.pattern.name === option.pattern.name))
      result = [...result, ...remaining]
    } else {
      result = options
    }
  } else {
    result = options
  }

  return result
}
