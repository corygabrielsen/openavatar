import { Avatar, LayerDescriptor, PatternPaletteDescriptor, PatternPaletteNames } from '@openavatar/types'

import AvatarTransformsPickerSection from './AvatarTransformsPickerSection'
import { makeLabel } from './Labels'
import { UIGridLayoutType } from './grid'

interface UIAvatarTransform {
  label?: string
  transform: Record<string, PatternPaletteNames>
}

interface Props {
  label?: string

  avatar: Avatar
  gridLayoutType: UIGridLayoutType
  hideClothes: boolean

  onClickAvatar: (avatar: Avatar) => void
  showScrollToastOnClick: boolean
  scrollToastMessage?: string

  layer: LayerDescriptor
  patternPalettes: PatternPaletteDescriptor[]
  usePatternLabel?: boolean

  gridMaxColumns?: number
}

const AvatarLayerTransformsPickerSection: React.FC<Props> = ({
  label,
  avatar,
  gridLayoutType,
  hideClothes,
  onClickAvatar,
  showScrollToastOnClick,
  scrollToastMessage,
  layer,
  patternPalettes,
  usePatternLabel,
  gridMaxColumns,
}: Props) => {
  const transforms: UIAvatarTransform[] = patternPalettes.map((patternPalette) => ({
    label: makeLabel(patternPalette, usePatternLabel),
    transform: {
      [layer.name]: {
        patternName: patternPalette.pattern.name,
        paletteName: patternPalette.palette.name,
      },
    },
  }))

  return (
    <AvatarTransformsPickerSection
      avatar={avatar}
      hideClothes={hideClothes}
      transforms={transforms}
      label={label}
      showScrollToastOnClick={showScrollToastOnClick}
      scrollToastMessage={scrollToastMessage}
      onClickAvatar={onClickAvatar}
      gridLayoutType={gridLayoutType}
      gridMaxColumns={gridMaxColumns}
    />
  )
}

export default AvatarLayerTransformsPickerSection
