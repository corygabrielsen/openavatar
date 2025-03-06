import { Avatar, AvatarDefinitions, AvatarLayerStack, PatternPaletteDescriptor } from '@openavatar/types'
import { useEffect, useState } from 'react'
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

const AvatarHairPicker = ({ avatar, onClickAvatar }: Props) => {
  const [randValue, setRandValue] = useState(0)

  useEffect(() => {
    setRandValue(Math.random())
  }, [])

  const options: PatternPaletteDescriptor[] = AvatarDefinitions.getPatternPalettesByLayer(AvatarLayerStack.hair)

  // hair styles
  // loop over the options and select the ones with the same palette as the current avatar hair palette
  let hairPatternOptions = options.filter(
    (patternPalette) =>
      patternPalette.palette.name === avatar.get(AvatarLayerStack.hair).palette.name ||
      patternPalette.pattern.name === 'bald'
  )
  // unless we are actually bald in which case pick a random hair palette and show all the styles
  if (avatar.get(AvatarLayerStack.hair).palette.name === 'transparent') {
    const randIndexNotBald = Math.floor(randValue * (options.length - 1)) + 1
    const randomPaletteName = options[randIndexNotBald].palette.name
    hairPatternOptions = options.filter(
      (patternPalette) => patternPalette.palette.name === randomPaletteName || patternPalette.pattern.name === 'bald'
    )
  }

  // hair colors
  // loop over the options and select the ones with the same pattern as the current avatar hair pattern
  const hairPaletteOptions: PatternPaletteDescriptor[] = options.filter(
    (patternPalette) => patternPalette.pattern.name === avatar.get(AvatarLayerStack.hair).pattern.name
  )

  return (
    <div className={styles.container}>
      <AvatarPickerHelpText text="Select a style, then scroll down and select color." />
      <LabeledHr label="Hair Style" />
      <AvatarLayerTransformsPickerSection
        key={`AvatarPickerSection-hair-pattern`}
        usePatternLabel={true}
        layer={AvatarLayerStack.hair}
        avatar={avatar}
        patternPalettes={hairPatternOptions}
        hideClothes={false}
        onClickAvatar={onClickAvatar}
        showScrollToastOnClick={true}
        gridLayoutType={UIGridLayoutType.Compact}
        gridMaxColumns={8}
      />
      {avatar.get(AvatarLayerStack.hair).pattern.name === 'bald' && (
        <AvatarPickerHelpText text="Hair colors will display if you choose non-bald hair style." />
      )}
      {avatar.get(AvatarLayerStack.hair).pattern.name !== 'bald' && <LabeledHr label="Hair Color" />}
      {avatar.get(AvatarLayerStack.hair).pattern.name !== 'bald' && (
        <AvatarPalettePicker
          layer={AvatarLayerStack.hair}
          avatar={avatar}
          patternPalettes={hairPaletteOptions}
          onClickAvatar={onClickAvatar}
        />
      )}
    </div>
  )
}

export default AvatarHairPicker
