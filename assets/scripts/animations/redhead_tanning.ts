import { Avatar, PatternPaletteNames } from '@openavatar/types'

const frame0: Avatar = new Avatar({
  body: {
    patternName: 'bare_chest',
    paletteName: 'european0',
  },
  makeup: {
    patternName: 'none',
    paletteName: 'transparent',
  },
  left_eye: {
    patternName: 'square',
    paletteName: 'black',
  },
  right_eye: {
    patternName: 'square',
    paletteName: 'black',
  },
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
  jewelry: {
    patternName: 'none',
    paletteName: 'transparent',
  },
  facewear: {
    patternName: 'none',
    paletteName: 'transparent',
  },
  hair: {
    patternName: 'wild',
    paletteName: 'natural_redhead',
  },
})

const transforms: Record<string, PatternPaletteNames>[] = [
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'summer_tan0',
    },
  },
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'summer_tan0',
    },
  },
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'summer_tan1',
    },
  },
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'summer_tan2',
    },
  },
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'sunburn1',
    },
  },
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'sunburn2',
    },
  },
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'sunburn3',
    },
  },
  {
    body: {
      patternName: 'bare_chest',
      paletteName: 'sunburn4',
    },
  },
]
const frames: Avatar[] = [frame0]
for (const transform of transforms) {
  frames.push(frames[frames.length - 1].transform(transform))
}

export default {
  name: 'redhead_tanning',
  frames,
}
