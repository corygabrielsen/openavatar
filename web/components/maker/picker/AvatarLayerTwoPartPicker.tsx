import {
  Avatar,
  AvatarDefinitions,
  AvatarLayerStack,
  LayerDescriptor,
  PatternDescriptor,
  PatternPaletteDescriptor,
} from '@openavatar/types'
import AvatarLayerTransformsPickerSection from './AvatarLayerTransformsPickerSection'

import { useEffect, useState } from 'react'
import styles from '../../../styles/maker/picker/AvatarTwoPartPicker.module.scss'
import { capitalizeWords } from '../../utils/strings'
import LabeledHr from '../LabeledHr'
import { selectPreferredMatchingPalette } from '../paletteHelpers'
import SearchView from '../search/SearchView'
import AvatarPalettePicker from './AvatarPalettePicker'
import AvatarPickerHelpText from './AvatarPickerHelpText'

import { reorderOptionsForPatternPicker } from '../patternHelpers'
import { UIGridLayoutType } from './grid'

interface Props {
  layer: LayerDescriptor
  avatar: Avatar
  onClickAvatar: (avatar: Avatar) => void
  excludePatternNames?: string[]
  suggestedSearchTerms?: string[]
  maxPatternCols?: number
}

const AvatarLayerTwoPartPicker = ({
  layer,
  avatar,
  onClickAvatar,
  excludePatternNames,
  suggestedSearchTerms,
  maxPatternCols,
}: Props) => {
  const [randValue, setRandValue] = useState(0)

  useEffect(() => {
    setRandValue(Math.random())
  }, [])

  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Do something when searchTerm changes.
  }, [searchTerm])

  const avatarLayerPattern: PatternDescriptor = AvatarDefinitions.getPattern(layer, avatar.get(layer).pattern.name)
  let layerPatterns: PatternDescriptor[] = AvatarDefinitions.getPatternsByLayer(layer)
  // filter excluded patterns
  layerPatterns = layerPatterns.filter((pattern) => !(excludePatternNames || []).includes(pattern.name))

  // now we have a list of layer patterns, but each layer pattern can have multiple palettes
  // we want to be consistent and methodical when determining which palette to display for
  // each of the pattern options

  // the first picker section will show all the available patterns
  const unfilteredOptionsForPatternPicker: PatternPaletteDescriptor[] = []

  let randPaletteInUse: string = ''
  for (const pattern of layerPatterns) {
    const patternPalettes: PatternPaletteDescriptor[] = AvatarDefinitions.getPatternPalettesByPattern(pattern)

    let palette: PatternPaletteDescriptor | null = selectPreferredMatchingPalette(patternPalettes, avatar, layer)

    // else randomly pick a palette
    if (!palette) {
      const randIndex = Math.floor(randValue * patternPalettes.length)
      palette = patternPalettes[randIndex]
      // the first pass in this will be the naked option and we want to grab the one after
      if (randPaletteInUse === '' && pattern.index !== 0) {
        randPaletteInUse = palette?.palette.name
      }
    }
    // we will add the palette to the list of options for the pattern picker
    unfilteredOptionsForPatternPicker.push(palette)
  }
  // filter the options by the search term
  const filteredOptionsForPatternPicker = unfilteredOptionsForPatternPicker.filter((patternPalette) =>
    patternPalette.pattern.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  let reorderedOptionsForPatternPicker: PatternPaletteDescriptor[] = reorderOptionsForPatternPicker(
    avatar,
    layer,
    filteredOptionsForPatternPicker
  )

  // then for the current avatar's pattern, we also show all the available palettes
  const optionsForPalettePicker: PatternPaletteDescriptor[] = AvatarDefinitions.getPatternPalettesByPattern(
    AvatarDefinitions.getPattern(layer, avatar.get(layer).pattern.name)
  )

  const uiPatternCategory = capitalizeWords(layer.name.replace(/_/g, ' '))

  const showSearch = unfilteredOptionsForPatternPicker.length > 1
  const showColorPalettes = avatarLayerPattern.index !== 0 // not naked/empty option
  const showColorPaletteHintAbovePatterns = randPaletteInUse && !searchTerm.startsWith('space')
  const hideClothes = [AvatarLayerStack.body.name, AvatarLayerStack.tattoos.name].includes(layer.name)
  const showRandColorInfoText =
    showColorPaletteHintAbovePatterns &&
    ![AvatarLayerStack.makeup.name, AvatarLayerStack.eyewear.name, AvatarLayerStack.jewelry.name].includes(layer.name)

  let patternGridLayoutType = UIGridLayoutType.Compact
  if ([AvatarLayerStack.bottomwear.name, AvatarLayerStack.topwear.name].includes(layer.name)) {
    patternGridLayoutType = UIGridLayoutType.GroupByRows
  }
  return (
    <div className={styles.container}>
      <AvatarPickerHelpText text="Select a style, then scroll down and select color." />
      <LabeledHr label={`${uiPatternCategory} Style`} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', width: '100%' }}>
        {showSearch && (
          // Step 3: Replace with SearchView
          <SearchView
            suggestedSearchTerms={suggestedSearchTerms || []} // Step 4: Pass required props
            searchTerm={searchTerm}
            onChange={setSearchTerm}
          />
        )}

        {showRandColorInfoText &&
          randPaletteInUse.startsWith('theme__') &&
          ![AvatarLayerStack.left_eye.name, AvatarLayerStack.right_eye.name].includes(layer.name) && (
            <AvatarPickerHelpText
              text={`Displaying options in ${capitalizeWords(
                randPaletteInUse.replace('theme__', '') || 'random'
              )} color. Scroll down to change color palette.`}
            />
          )}
        <AvatarLayerTransformsPickerSection
          key={`AvatarPickerSection-${layer.name}-pattern`}
          layer={layer}
          hideClothes={hideClothes}
          label={undefined}
          avatar={avatar}
          patternPalettes={reorderedOptionsForPatternPicker}
          usePatternLabel={true}
          showScrollToastOnClick={true}
          scrollToastMessage={layer.name === AvatarLayerStack.body.name ? 'Scroll down to change skin tone' : undefined}
          onClickAvatar={onClickAvatar}
          gridMaxColumns={maxPatternCols}
          gridLayoutType={patternGridLayoutType}
        />
      </div>
      {!showColorPalettes && <AvatarPickerHelpText text="Colors will display if you choose a style." />}
      {showColorPalettes && (
        <>
          <LabeledHr label={`${uiPatternCategory} Colors`} />
          <AvatarPalettePicker
            layer={layer}
            avatar={avatar}
            patternPalettes={optionsForPalettePicker}
            onClickAvatar={onClickAvatar}
          />
        </>
      )}
    </div>
  )
}

export default AvatarLayerTwoPartPicker
