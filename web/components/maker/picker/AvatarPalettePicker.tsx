import { Avatar, AvatarLayerStack, LayerDescriptor, PatternPaletteDescriptor } from '@openavatar/types'
import { useEffect, useMemo, useState } from 'react'
import styles from '../../../styles/maker/picker/AvatarPalettePicker.module.scss'
import { UIGroup, groupByLayer } from '../groups'
import SearchBox from '../search/SearchBox'
import AvatarLayerTransformsPickerSection from './AvatarLayerTransformsPickerSection'
import { UIGridLayoutType } from './grid'

interface Props {
  layer: LayerDescriptor
  avatar: Avatar
  patternPalettes: PatternPaletteDescriptor[]
  onClickAvatar: (avatar: Avatar) => void
}

function filterPatternPalettes(patternPalettes: PatternPaletteDescriptor[], searchTerm: string) {
  return patternPalettes.filter((patternPalette) =>
    patternPalette.palette.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

const AvatarPalettePicker: React.FC<Props> = ({ layer, avatar, patternPalettes, onClickAvatar }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Do something when searchTerm changes.
  }, [searchTerm])

  // filteredPatternPalettes are now used in place of patternPalettes
  const filteredPatternPalettes = useMemo(() => {
    return filterPatternPalettes(patternPalettes, searchTerm)
  }, [patternPalettes, searchTerm])

  const groups: { [groupName: string]: UIGroup } = groupByLayer(filteredPatternPalettes, layer)

  // certain layers have a specific number of columns to display their avatar palette options for
  const isThreeCols =
    AvatarLayerStack.eyewear.name === layer.name &&
    ['sunglasses_retro', 'ar_vr_visor'].includes(avatar.get(AvatarLayerStack.eyewear).pattern.name)
  const isFourCols = layer.name === AvatarLayerStack.makeup.name
  const isFiveCols = layer.name === AvatarLayerStack.outerwear.name

  // special case which can be refactored later maybe, needs to be generalized a bit
  const hideClothes = [AvatarLayerStack.body.name, AvatarLayerStack.tattoos.name].includes(layer.name)

  let gridLayoutType = UIGridLayoutType.Compact
  if (AvatarLayerStack.left_eye.name === layer.name) {
    const leftEye = avatar.get(AvatarLayerStack.left_eye)
    if (!['cyborg', 'terminator'].includes(leftEye.pattern.name)) {
      gridLayoutType = UIGridLayoutType.GroupByRows
    }
  }
  if (AvatarLayerStack.right_eye.name === layer.name) {
    const rightEye = avatar.get(AvatarLayerStack.right_eye)
    if (!['cyborg', 'terminator'].includes(rightEye.pattern.name)) {
      gridLayoutType = UIGridLayoutType.GroupByRows
    }
  }

  return (
    <div className={styles.container}>
      {patternPalettes.length > 1 && layer.name !== AvatarLayerStack.body.name && (
        <SearchBox searchTerm={searchTerm} onChange={setSearchTerm} />
      )}
      {Object.values(groups).map((group) => (
        <AvatarLayerTransformsPickerSection
          key={`AvatarPickerSection-${layer.name}-${group.name}`}
          layer={layer}
          hideClothes={hideClothes}
          label={
            gridLayoutType === UIGridLayoutType.Compact && Object.values(groups).length > 1 ? group.name : undefined
          }
          avatar={avatar}
          patternPalettes={group.patternPalettes}
          showScrollToastOnClick={false}
          onClickAvatar={onClickAvatar}
          gridLayoutType={gridLayoutType}
          gridMaxColumns={isFiveCols ? 5 : isFourCols ? 4 : isThreeCols ? 3 : undefined}
        />
      ))}
    </div>
  )
}

export default AvatarPalettePicker
