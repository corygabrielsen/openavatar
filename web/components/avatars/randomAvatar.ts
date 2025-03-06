import {
  Avatar,
  AvatarDefinitions,
  AvatarLayerStack,
  LayerDescriptor,
  PaletteDescriptor,
  PatternPaletteDescriptor,
  PatternPaletteNames,
} from '@openavatar/types'
import { FIRST_100 } from './First100'

export function randomNice(): Avatar {
  let avatar: Avatar = Avatar.random()
  const body = avatar.get(AvatarLayerStack.body)
  if (body.pattern.name === 'invisible' || body.palette.name === 'transparent') {
    return randomNice()
  }

  // now match the eyes so the right matches the left
  avatar = avatar.transform({
    left_eye: {
      patternName: 'square',
      paletteName: 'black',
    },
    right_eye: {
      patternName: 'square',
      paletteName: 'black',
    },
  })

  // match the hair color to the facial hair color
  const facial_hair_pattern = avatar.get(AvatarLayerStack.facial_hair).pattern
  if (facial_hair_pattern.index > 0) {
    avatar = avatar.transform({
      facial_hair: {
        patternName: avatar.get(AvatarLayerStack.facial_hair).pattern.name,
        paletteName: avatar.get(AvatarLayerStack.hair).palette.name,
      },
    })
  }

  // remove facial hair 50% of the time
  const isFem = body.pattern.name.includes('feminine') || body.pattern.name.includes('breasts')
  if (isFem || Math.random() < 0.5) {
    avatar = avatar.transform({
      facial_hair: {
        patternName: 'none',
        paletteName: 'transparent',
      },
    })
  }

  // remove makeup
  const makeupName = avatar.get(AvatarLayerStack.makeup).pattern.name
  if (!isFem || makeupName.includes('warpaint') || Math.random() < 0.5) {
    avatar = avatar.transform({
      makeup: {
        patternName: 'none',
        paletteName: 'transparent',
      },
    })
  }

  // remove any facewear, eyewear, tattoos, jewelry
  avatar = avatar.transform({
    eyewear: {
      patternName: 'none',
      paletteName: 'transparent',
    },
    facewear: {
      patternName: 'none',
      paletteName: 'transparent',
    },
    tattoos: {
      patternName: 'none',
      paletteName: 'transparent',
    },
    jewelry: {
      patternName: 'none',
      paletteName: 'transparent',
    },
  })

  // remove clothes
  avatar = avatar.transform({
    bottomwear: {
      patternName: 'naked',
      paletteName: 'transparent',
    },
    footwear: {
      patternName: 'none',
      paletteName: 'transparent',
    },
    topwear: {
      patternName: 'naked',
      paletteName: 'transparent',
    },
    handwear: {
      patternName: 'none',
      paletteName: 'transparent',
    },
    outerwear: {
      patternName: 'none',
      paletteName: 'transparent',
    },
  })
  return avatar
}

export function randomClean(): Avatar {
  let avatar: Avatar = randomNice()

  // remove hair
  avatar = avatar.transform({
    hair: {
      patternName: 'bald',
      paletteName: 'transparent',
    },
  })
  // remove facial hair
  avatar = avatar.transform({
    facial_hair: {
      patternName: 'none',
      paletteName: 'transparent',
    },
  })
  // remove makeup
  avatar = avatar.transform({
    makeup: {
      patternName: 'none',
      paletteName: 'transparent',
    },
  })
  return avatar
}

const PALETTE_CODE_BODY = 2
const PALETTE_CODE_HAIR = 3

function randomizeBody(avatar: Avatar): Avatar {
  const body: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.body)
  const allBodyPalettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(PALETTE_CODE_BODY)
  const randBodyPalette = () => {
    return Math.floor(Math.random() * allBodyPalettes.length)
  }
  let randomBodyIndex: number = randBodyPalette()
  randomBodyIndex = randomBodyIndex < 50 ? randomBodyIndex : randBodyPalette()
  const randomBodyPalette: PaletteDescriptor = allBodyPalettes[randomBodyIndex]
  const transformBody: Record<string, PatternPaletteNames> = {
    [AvatarLayerStack.body.name]: {
      patternName: body.pattern.name,
      paletteName: randomBodyPalette.name,
    },
  }
  avatar = avatar.transform(transformBody)
  return avatar
}

function randomizeHairColor(avatar: Avatar): PatternPaletteNames {
  const hairPalettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(PALETTE_CODE_HAIR)
  const naturalHairPalettes: PaletteDescriptor[] = hairPalettes.filter((palette) => {
    return palette.name.includes('natural')
  })
  const themeHairPalettes: PaletteDescriptor[] = hairPalettes.filter((palette) => {
    return palette.name.includes('theme')
  })
  const hair: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.hair)

  let result: PatternPaletteNames = {
    patternName: hair.pattern.name,
    paletteName: hair.palette.name,
  }

  if (hair.palette.name.includes('natural')) {
    const randomHairIndex = Math.floor(Math.random() * naturalHairPalettes.length)
    const randomHairPalette: PaletteDescriptor = naturalHairPalettes[randomHairIndex]
    result = {
      patternName: hair.pattern.name,
      paletteName: randomHairPalette.name,
    }
  } else if (hair.palette.name.includes('theme')) {
    const randomHairIndex = Math.floor(Math.random() * themeHairPalettes.length)
    const randomHairPalette: PaletteDescriptor = themeHairPalettes[randomHairIndex]
    result = {
      patternName: hair.pattern.name,
      paletteName: randomHairPalette.name,
    }
  }
  return result
}

function randomizeFacialHairColor(avatar: Avatar, hairColorTransform: PatternPaletteNames): PatternPaletteNames {
  const facialHair: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.facial_hair)

  // if no facial hair, then return the same option which will do nothing when applied
  if (facialHair.pattern.index === 0) {
    return {
      patternName: facialHair.pattern.name,
      paletteName: facialHair.palette.name,
    }
  }

  const hair: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.hair)
  // if the hair is the same color as the facial hair, then return the same transform as the hair
  if (hair.palette.name === facialHair.palette.name) {
    return {
      patternName: facialHair.pattern.name,
      paletteName: hairColorTransform.paletteName,
    }
  }

  const facialHairPalettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(PALETTE_CODE_HAIR)
  const naturalHairOptions: PaletteDescriptor[] = facialHairPalettes.filter((palette) => {
    return palette.name.includes('natural')
  })
  const themeHairOptions: PaletteDescriptor[] = facialHairPalettes.filter((palette) => {
    return palette.name.includes('theme')
  })

  let result: PatternPaletteNames = {
    patternName: facialHair.pattern.name,
    paletteName: facialHair.palette.name,
  }

  if (facialHair.palette.name.includes('natural')) {
    const randomHairIndex = Math.floor(Math.random() * naturalHairOptions.length)
    const randomHairPalette: PaletteDescriptor = naturalHairOptions[randomHairIndex]
    result = {
      patternName: facialHair.pattern.name,
      paletteName: randomHairPalette.name,
    }
  } else if (facialHair.palette.name.includes('theme')) {
    const randomHairIndex = Math.floor(Math.random() * themeHairOptions.length)
    const randomHairPalette: PaletteDescriptor = themeHairOptions[randomHairIndex]
    result = {
      patternName: facialHair.pattern.name,
      paletteName: randomHairPalette.name,
    }
  }
  return result
}

function randomPaletteOfSameCode(palette: PaletteDescriptor): PaletteDescriptor {
  // first we use the code to get the list of all palettes for this code
  const palettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(palette.code)
  // randomly choose one of the palettes
  const randomIndex = Math.floor(Math.random() * palettes.length)
  const randomPalette: PaletteDescriptor = palettes[randomIndex]
  return randomPalette
}

function randomizeClothingColor(
  avatar: Avatar,
  hairColorTransform: PatternPaletteNames
): Record<string, PatternPaletteNames> {
  // clothing layers:
  // topwear
  // bottomwear
  // handwear
  // footwear

  // each of the clothing could have different colors, but generally there will be coordination
  // for each of the different colors, we want to map them consistently to a new color
  // to do so we will figure out all the colors, then find their transforms, then apply them

  const topwear: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.topwear)
  const bottomwear: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.bottomwear)
  const handwear: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.handwear)
  const footwear: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.footwear)

  const clothing: PatternPaletteDescriptor[] = [topwear, bottomwear, handwear, footwear].filter((layer) => {
    return layer.pattern.name !== 'none' && layer.pattern.name !== 'naked' && layer.palette.name !== 'transparent'
  })
  // const clothingPalettes: PaletteDescriptor[] = clothing.map((patternPalette) => {
  //   return patternPalette.palette
  // })

  // old to new mapping
  const oldToNewPalettes: Record<string, PaletteDescriptor> = {}
  // cache the hair color transform in the oldToNewPalettes so we use that if possible
  const hair: PatternPaletteDescriptor = avatar.get(AvatarLayerStack.hair)
  if (hair.pattern.index > 0) {
    const newHairColorPalette = AvatarDefinitions.getPalette(PALETTE_CODE_HAIR, hairColorTransform.paletteName)
    // even though it's hair color code the names will match the ones used for clothing sometimes
    oldToNewPalettes[avatar.get(AvatarLayerStack.hair).palette.name] = newHairColorPalette
  }
  for (const clothingPatternPalette of clothing) {
    // check if we already have a mapping for this palette
    if (oldToNewPalettes[clothingPatternPalette.palette.name]) {
      continue
    }
    // if not, then find a new palette that isn't already in the mapping
    const newPalette: PaletteDescriptor = randomPaletteOfSameCode(clothingPatternPalette.palette)
    oldToNewPalettes[clothingPatternPalette.palette.name] = newPalette
  }

  // now we have a mapping of old to new palettes
  // we need to apply the mapping to the avatar
  const transforms: Record<string, PatternPaletteNames> = {}
  const clothingLayers: LayerDescriptor[] = [
    AvatarLayerStack.topwear,
    AvatarLayerStack.bottomwear,
    AvatarLayerStack.handwear,
    AvatarLayerStack.footwear,
  ]
  for (const clothingLayer of clothingLayers) {
    const patternPalette: PatternPaletteDescriptor = avatar.get(clothingLayer)
    const newPalette: PaletteDescriptor = oldToNewPalettes[patternPalette.palette.name]
    if (!newPalette) {
      continue
    }
    transforms[clothingLayer.name] = {
      patternName: patternPalette.pattern.name,
      paletteName: newPalette.name,
    }
  }

  return transforms
}

function randomizeLayer(avatar: Avatar, layer: LayerDescriptor): PatternPaletteNames {
  const patternPalette: PatternPaletteDescriptor = avatar.get(layer)
  if (patternPalette.pattern.index === 0) {
    return {
      patternName: patternPalette.pattern.name,
      paletteName: patternPalette.palette.name,
    }
  }

  const palettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(patternPalette.palette.code)
  const randomPaletteIndex = Math.floor(Math.random() * palettes.length)
  const randomPalette: PaletteDescriptor = palettes[randomPaletteIndex]
  return {
    patternName: patternPalette.pattern.name,
    paletteName: randomPalette.name,
  }
}

const disallowedIndices: number[] = [57, 59, 91, 93].map((index) => {
  return index - 1
})
export function randomNiceFirst100(): Avatar {
  const candidates = FIRST_100
  const randomIndex = Math.floor(Math.random() * candidates.length)
  if (disallowedIndices.includes(randomIndex)) {
    return randomNiceFirst100()
  }
  let avatar: Avatar = candidates[randomIndex]

  // now we're going to change the body color randomly
  avatar = randomizeBody(avatar)

  // hair color
  const hairColorTransform: PatternPaletteNames = randomizeHairColor(avatar)
  avatar = avatar.transform({
    [AvatarLayerStack.hair.name]: hairColorTransform,
  })

  // facial hair color
  const facialHairColorTransform: PatternPaletteNames = randomizeFacialHairColor(avatar, hairColorTransform)
  avatar = avatar.transform({
    [AvatarLayerStack.facial_hair.name]: facialHairColorTransform,
  })

  // clothing
  const clothingColorTransforms: Record<string, PatternPaletteNames> = randomizeClothingColor(
    avatar,
    hairColorTransform
  )
  avatar = avatar.transform(clothingColorTransforms)

  // jewelry
  avatar = avatar.transform({
    [AvatarLayerStack.jewelry.name]: randomizeLayer(avatar, AvatarLayerStack.jewelry),
  })

  // tattoos
  avatar = avatar.transform({
    [AvatarLayerStack.tattoos.name]: randomizeLayer(avatar, AvatarLayerStack.tattoos),
  })

  // eyewear
  avatar = avatar.transform({
    [AvatarLayerStack.eyewear.name]: randomizeLayer(avatar, AvatarLayerStack.eyewear),
  })

  return avatar
}
