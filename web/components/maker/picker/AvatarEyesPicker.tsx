import {
  Avatar,
  AvatarDefinitions,
  AvatarLayerStack,
  PatternDescriptor,
  PatternPaletteDescriptor,
  PatternPaletteNames,
} from '@openavatar/types'

import { useState } from 'react'
import styles from '../../../styles/maker/picker/AvatarEyesPicker.module.scss'
import AvatarButton from '../AvatarButton'
import LabeledHr from '../LabeledHr'
import AvatarEyesPickerSection from './AvatarEyesPickerSection'
import AvatarTwoPartPicker from './AvatarLayerTwoPartPicker'
import AvatarPickerHelpText from './AvatarPickerHelpText'
import AvatarTransformsPickerSection from './AvatarTransformsPickerSection'
import { UIGridLayoutType } from './grid'

interface UIAvatarTransform {
  label: string
  transform: Record<string, PatternPaletteNames>
}

enum Section {
  LEFT_EYE = 'left_eye',
  BOTH_EYES = 'both_eyes',
  RIGHT_EYE = 'right_eye',
}

interface Props {
  avatar: Avatar
  onClickAvatar: (avatar: Avatar) => void
}

const AvatarEyesPickerSelectorBar = ({ avatar, section, setSection }: any) => {
  return (
    <div className={styles.bar}>
      <AvatarButton
        onClick={() => setSection(Section.LEFT_EYE)}
        label={'left'}
        showLayers={[AvatarLayerStack.body, AvatarLayerStack.left_eye]}
        avatar={avatar}
        selected={section === Section.LEFT_EYE}
      />
      <AvatarButton
        onClick={() => setSection(Section.BOTH_EYES)}
        label={'both'}
        showLayers={[AvatarLayerStack.body, AvatarLayerStack.left_eye, AvatarLayerStack.right_eye]}
        avatar={avatar}
        selected={section === Section.BOTH_EYES}
      />
      <AvatarButton
        onClick={() => setSection(Section.RIGHT_EYE)}
        label={'right'}
        showLayers={[AvatarLayerStack.body, AvatarLayerStack.right_eye]}
        avatar={avatar}
        selected={section === Section.RIGHT_EYE}
      />
    </div>
  )
}

const AvatarEyesPicker = ({ avatar, onClickAvatar }: Props) => {
  const [section, setSection] = useState(Section.BOTH_EYES)

  const patterns: PatternDescriptor[] = AvatarDefinitions.getPatternsByLayer(AvatarLayerStack.left_eye)

  // we will choose one UITransform to display for each pattern
  const bothEyesPatternTransforms: UIAvatarTransform[] = []
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i]
    const patternPalettes: PatternPaletteDescriptor[] = AvatarDefinitions.getPatternPalettesByPattern(pattern)
    if (patternPalettes.length == 0) {
      throw new Error('pattern has no palettes')
    }
    // first try to match the palette to either left or right eye if we have a partial match already
    if (avatar.get(AvatarLayerStack.left_eye).pattern.name == pattern.name) {
      for (let j = 0; j < patternPalettes.length; j++) {
        const patternPalette = patternPalettes[j]
        if (patternPalette.palette.name == avatar.get(AvatarLayerStack.left_eye).palette.name) {
          bothEyesPatternTransforms.push({
            label: pattern.name,
            transform: {
              [AvatarLayerStack.left_eye.name]: {
                patternName: pattern.name,
                paletteName: patternPalette.palette.name,
              },
              [AvatarLayerStack.right_eye.name]: {
                patternName: pattern.name,
                paletteName: patternPalette.palette.name,
              },
            },
          })
          break
        }
      }
    } else if (avatar.get(AvatarLayerStack.right_eye).pattern.name == pattern.name) {
      for (let j = 0; j < patternPalettes.length; j++) {
        const patternPalette = patternPalettes[j]
        if (patternPalette.palette.name == avatar.get(AvatarLayerStack.right_eye).palette.name) {
          bothEyesPatternTransforms.push({
            label: pattern.name,
            transform: {
              [AvatarLayerStack.left_eye.name]: {
                patternName: pattern.name,
                paletteName: patternPalette.palette.name,
              },
              [AvatarLayerStack.right_eye.name]: {
                patternName: pattern.name,
                paletteName: patternPalette.palette.name,
              },
            },
          })
          break
        }
      }
    }
    // if we didn't find a match, just use the first palette (except for the square pattern which we will use pearly)
    if (bothEyesPatternTransforms.length < i + 1) {
      bothEyesPatternTransforms.push({
        label: pattern.name,
        transform: {
          [AvatarLayerStack.left_eye.name]: {
            patternName: pattern.name,
            paletteName: pattern.name == 'square' ? 'black' : patternPalettes[0].palette.name,
          },
          [AvatarLayerStack.right_eye.name]: {
            patternName: pattern.name,
            paletteName: pattern.name == 'square' ? 'black' : patternPalettes[0].palette.name,
          },
        },
      })
    }
  }

  // now for the currently selected pattern, we will also build up a list of palette options for both eyes
  const bothEyesPaletteTransforms: UIAvatarTransform[] = []

  const bothEyesMatch: boolean =
    avatar.get(AvatarLayerStack.left_eye).pattern.name == avatar.get(AvatarLayerStack.right_eye).pattern.name
  // but we will only do this if the current avatar actually has both eyes set to the same pattern
  if (bothEyesMatch) {
    // find the current pattern
    const currentPattern = AvatarDefinitions.getPattern(
      AvatarLayerStack.left_eye,
      avatar.get(AvatarLayerStack.left_eye).pattern.name
    )
    const currentPatternPalettes = AvatarDefinitions.getPatternPalettesByPattern(currentPattern)
    for (let i = 0; i < currentPatternPalettes.length; i++) {
      const patternPalette = currentPatternPalettes[i]
      bothEyesPaletteTransforms.push({
        label: patternPalette.palette.name,
        transform: {
          [AvatarLayerStack.left_eye.name]: {
            patternName: currentPattern.name,
            paletteName: patternPalette.palette.name,
          },
          [AvatarLayerStack.right_eye.name]: {
            patternName: currentPattern.name,
            paletteName: patternPalette.palette.name,
          },
        },
      })
    }
  }

  return (
    <div className={styles.container}>
      <AvatarPickerHelpText text="Choose eyes or cyborg hardware in any color" />
      <AvatarEyesPickerSelectorBar avatar={avatar} section={section} setSection={setSection} />
      {section === Section.LEFT_EYE && (
        <AvatarTwoPartPicker layer={AvatarLayerStack.left_eye} avatar={avatar} onClickAvatar={onClickAvatar} />
      )}
      {section === Section.BOTH_EYES && (
        <AvatarPickerHelpText text="Select a style, then scroll down and select color." />
      )}
      {section === Section.BOTH_EYES && <LabeledHr label="Eyes" />}
      {section === Section.BOTH_EYES && (
        <AvatarTransformsPickerSection
          avatar={avatar}
          transforms={bothEyesPatternTransforms}
          gridLayoutType={UIGridLayoutType.Compact}
          hideClothes={false}
          onClickAvatar={onClickAvatar}
          showScrollToastOnClick={true}
          scrollToastMessage={'Scroll down to change eye colors'}
        />
      )}
      {section === Section.BOTH_EYES && <LabeledHr label="Eye Color" />}
      {section === Section.BOTH_EYES && bothEyesMatch && (
        <AvatarEyesPickerSection
          section={Section.BOTH_EYES}
          avatar={avatar}
          transforms={bothEyesPaletteTransforms}
          onClickAvatar={onClickAvatar}
        />
      )}
      {section === Section.RIGHT_EYE && (
        <AvatarTwoPartPicker layer={AvatarLayerStack.right_eye} avatar={avatar} onClickAvatar={onClickAvatar} />
      )}
    </div>
  )
}

export default AvatarEyesPicker
