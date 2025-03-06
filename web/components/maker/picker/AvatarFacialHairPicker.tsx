import {
  Avatar,
  AvatarDefinitions,
  AvatarLayerStack,
  LayerDescriptor,
  PatternPaletteDescriptor,
} from '@openavatar/types'
import styles from '../../../styles/maker/picker/AvatarHairPicker.module.scss'
import LabeledHr from '../LabeledHr'
import AvatarLayerTransformsPickerSection from './AvatarLayerTransformsPickerSection'
import AvatarPalettePicker from './AvatarPalettePicker'
import AvatarPickerHelpText from './AvatarPickerHelpText'
import { UIGridLayoutType } from './grid'

interface Props {
  avatar: Avatar
  onClickAvatar: (avatar: Avatar) => void
}

const AvatarFacialHairPicker = ({ avatar, onClickAvatar }: Props) => {
  const layer: LayerDescriptor = AvatarLayerStack.facial_hair
  const options: PatternPaletteDescriptor[] = AvatarDefinitions.getPatternPalettesByLayer(layer)

  const noneOption: PatternPaletteDescriptor[] = options.filter(
    (patternPalette) => patternPalette.palette.name === 'transparent'
  )

  // facial_hair styles
  // loop over the options and select the ones with the same palette as the current avatar facial_hair palette
  const matchCurrentFacialHairPaletteOptions = options.filter(
    (patternPalette) =>
      patternPalette.palette.name !== 'transparent' && patternPalette.palette.name === avatar.get(layer).palette.name
  )

  const hairColor = avatar.get(AvatarLayerStack.hair).palette.name
  const matchCurrentHairPaletteOptions = options.filter(
    (patternPalette) => patternPalette.palette.name !== 'transparent' && patternPalette.palette.name === hairColor
  )

  // if patternOptions is only one
  const patternOptions: PatternPaletteDescriptor[] = []
  // add none option
  patternOptions.push(noneOption[0])
  // preference #1 -> we already have a facial_hair style so show all the options in the same color
  if (matchCurrentFacialHairPaletteOptions.length > 0) {
    patternOptions.push(...matchCurrentFacialHairPaletteOptions)
  }
  // preference #2 -> we already have a hair style so show all the options in the same color
  else if (matchCurrentHairPaletteOptions.length > 0) {
    patternOptions.push(...matchCurrentHairPaletteOptions)
  } else {
    // we need to pick a hair color and show options in that color so lets pick the color of the 69th option
    // choose a random non-transparent one
    const nonTransparentReferenceColorSet = options.filter(
      (patternPalette) => patternPalette.palette.name !== 'transparent'
    )
    const randIndex = Math.floor(Math.random() * (nonTransparentReferenceColorSet.length - 1)) + 1
    const useReferenceForColor = options[randIndex].palette.name
    const matchReferenceColor = options.filter(
      (patternPalette) =>
        patternPalette.palette.name !== 'transparent' && patternPalette.palette.name === useReferenceForColor
    )
    patternOptions.push(...matchReferenceColor)
  }

  // facial_hair colors
  // loop over the options and select the ones with the same pattern as the current avatar facial_hair pattern
  const paletteOptions: PatternPaletteDescriptor[] = options.filter(
    (patternPalette) => patternPalette.pattern.name === avatar.get(layer).pattern.name
  )

  return (
    <div className={styles.container}>
      <AvatarPickerHelpText text="Select a style, then scroll down and select color." />
      <LabeledHr label="Facial Hair Style" />
      <AvatarLayerTransformsPickerSection
        key={`AvatarPickerSection-${layer.name}-pattern`}
        usePatternLabel={true}
        avatar={avatar}
        layer={layer}
        hideClothes={false}
        patternPalettes={patternOptions}
        onClickAvatar={onClickAvatar}
        showScrollToastOnClick={true}
        scrollToastMessage={'Scroll down to change facial hair color'}
        gridLayoutType={UIGridLayoutType.Compact}
        gridMaxColumns={6}
      />
      {avatar.get(layer).pattern.name === 'none' && (
        <AvatarPickerHelpText text="Colors will display if you choose a style." />
      )}
      {avatar.get(layer).pattern.name !== 'none' && <LabeledHr label="Facial Hair Color" />}
      {avatar.get(layer).pattern.name !== 'none' && (
        <AvatarPalettePicker
          layer={layer}
          avatar={avatar}
          patternPalettes={paletteOptions}
          onClickAvatar={onClickAvatar}
        />
      )}
    </div>
  )
}

export default AvatarFacialHairPicker
