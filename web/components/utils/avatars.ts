import { Avatar } from '@openavatar/types'

export function getDefaultAvatars(limit?: number): Avatar[] {
  return [
    new Avatar({
      body: { patternName: 'inner_chest', paletteName: 'human005' },
      bottomwear: { patternName: 'naked', paletteName: 'transparent' },
      topwear: { patternName: 'naked', paletteName: 'transparent' },
      left_eye: { patternName: 'square', paletteName: 'black' },
      right_eye: { patternName: 'square', paletteName: 'black' },
      makeup: { patternName: 'none', paletteName: 'transparent' },
      eyewear: { patternName: 'none', paletteName: 'transparent' },
      hair: { patternName: 'bald', paletteName: 'transparent' },
    }),
    new Avatar({
      body: { patternName: 'bare_chest', paletteName: 'human010' },
      bottomwear: { patternName: 'naked', paletteName: 'transparent' },
      // topwear: { patternName: 'tshirt_gradient3', paletteName: 'color__013__red' },
      left_eye: { patternName: 'square', paletteName: 'black' },
      right_eye: { patternName: 'square', paletteName: 'black' },
      makeup: { patternName: 'none', paletteName: 'transparent' },
      eyewear: { patternName: 'none', paletteName: 'transparent' },
      hair: { patternName: 'bald', paletteName: 'transparent' },
    }),
    new Avatar({
      body: { patternName: 'bare_chest', paletteName: 'human015' },
      bottomwear: { patternName: 'naked', paletteName: 'transparent' },
      // topwear: { patternName: 'tshirt_gradient3', paletteName: 'color__061__blue' },
      left_eye: { patternName: 'square', paletteName: 'black' },
      right_eye: { patternName: 'square', paletteName: 'black' },
      makeup: { patternName: 'none', paletteName: 'transparent' },
      // eyewear: { patternName: 'eyescreen_right', paletteName: 'red' },
      hair: { patternName: 'bald', paletteName: 'transparent' },
    }),
    new Avatar({
      body: { patternName: 'bare_chest', paletteName: 'human002' },
      bottomwear: { patternName: 'naked', paletteName: 'transparent' },
      topwear: { patternName: 'naked', paletteName: 'transparent' },
      left_eye: { patternName: 'square', paletteName: 'black' },
      right_eye: { patternName: 'square', paletteName: 'black' },
      makeup: { patternName: 'none', paletteName: 'transparent' },
      eyewear: { patternName: 'sunshield', paletteName: 'sun_reflection' },
      hair: { patternName: 'bald', paletteName: 'transparent' },
    }),
  ].slice(0, limit)
}
