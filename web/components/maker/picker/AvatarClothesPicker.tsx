import {
  Avatar,
  AvatarDefinitions,
  AvatarLayerStack,
  PaletteDescriptor,
  PatternDescriptor,
  PatternPaletteDescriptor,
  PatternPaletteNames,
} from '@openavatar/types'

import { useEffect, useState } from 'react'
import styles from '../../../styles/maker/picker/AvatarClothesPicker.module.scss'
import AvatarButton from '../AvatarButton'
import LabeledHr from '../LabeledHr'
import AvatarTwoPartPicker from './AvatarLayerTwoPartPicker'
import AvatarPickerHelpText from './AvatarPickerHelpText'
import AvatarTransformsPickerSection from './AvatarTransformsPickerSection'
import {
  OUTFITS_COORDINATED,
  OUTFITS_FEMININE,
  OUTFITS_MATCHING,
  OUTFITS_NAKED,
  OUTFITS_SPACE_SHIRTS,
  OUTFITS_SPACE_SHIRT_SHORTS,
  OUTFITS_SPACE_SUITS,
  OUTFITS_SPACE_SUIT_COLORS,
  Outfit,
} from './Outfits'
import { UIGridLayoutType } from './grid'

interface UIAvatarTransform {
  label: string
  transform: Record<string, PatternPaletteNames>
}

enum Section {
  OUTFITS,
  TOP,
  BOTTOM,
  HANDWEAR,
  FOOTWEAR,
  OUTERWEAR,
}

interface Props {
  avatar: Avatar
  onClickAvatar: (avatar: Avatar) => void
}

const AvatarClothesPickerSelectorBar = ({ avatar, section, setSection, flashing }: any) => {
  return (
    <div className={styles.bar}>
      <div className={styles.leftbar}>
        <AvatarButton
          onClick={() => setSection(Section.OUTFITS)}
          label={'Outfits'}
          showLayers={[AvatarLayerStack.body, AvatarLayerStack.bottomwear, AvatarLayerStack.topwear]}
          avatar={avatar}
          selected={section === Section.OUTFITS}
        />
      </div>
      <div className={styles.helptext}>
        <div className={styles.helpchild}>
          <AvatarPickerHelpText text="Try an outfit and/or customize" />
        </div>
      </div>
      {/* show a unicode dot like in a dot product */}
      <div className={styles.spacer}>
        <span className={styles.dot}>•</span>
        <hr className={styles.line} />
      </div>
      <div className={styles.rightbar}>
        <AvatarButton
          onClick={() => setSection(Section.TOP)}
          label={'Top'}
          showLayers={[AvatarLayerStack.body, AvatarLayerStack.topwear]}
          avatar={avatar}
          selected={section === Section.TOP}
          flash={flashing.includes(Section.TOP)}
        />
        <AvatarButton
          onClick={() => setSection(Section.BOTTOM)}
          label={'Bottom'}
          showLayers={[AvatarLayerStack.body, AvatarLayerStack.bottomwear]}
          avatar={avatar}
          selected={section === Section.BOTTOM}
          flash={flashing.includes(Section.BOTTOM)}
        />
        <AvatarButton
          onClick={() => setSection(Section.HANDWEAR)}
          label={'Hands'}
          showLayers={[AvatarLayerStack.body, AvatarLayerStack.handwear]}
          avatar={avatar}
          selected={section === Section.HANDWEAR}
        />
        <AvatarButton
          onClick={() => setSection(Section.FOOTWEAR)}
          label={'Feet'}
          showLayers={[AvatarLayerStack.body, AvatarLayerStack.footwear]}
          avatar={avatar}
          selected={section === Section.FOOTWEAR}
        />
        <AvatarButton
          onClick={() => setSection(Section.OUTERWEAR)}
          label={'Extras'}
          showLayers={[AvatarLayerStack.body, AvatarLayerStack.outerwear]}
          avatar={avatar}
          selected={section === Section.OUTERWEAR}
        />
      </div>
    </div>
  )
}

function toUITransform(avatar: Avatar, outfits: Outfit[], randomValueFallback: number): UIAvatarTransform[] {
  const output: UIAvatarTransform[] = []
  for (const outfitPattern of outfits) {
    // special case naked to also handle handwear, etc. which is the only case we care about removing it
    if (outfitPattern.label === 'naked') {
      output.push({
        label: outfitPattern.label,
        transform: {
          [AvatarLayerStack.topwear.name]: {
            patternName: 'naked',
            paletteName: 'transparent',
          },
          [AvatarLayerStack.bottomwear.name]: {
            patternName: 'naked',
            paletteName: 'transparent',
          },
          [AvatarLayerStack.handwear.name]: {
            patternName: 'none',
            paletteName: 'transparent',
          },
          [AvatarLayerStack.footwear.name]: {
            patternName: 'none',
            paletteName: 'transparent',
          },
          [AvatarLayerStack.outerwear.name]: {
            patternName: 'none',
            paletteName: 'transparent',
          },
        },
      })
      continue
    }
    // create a preview avatar with the outfit pattern
    // select the top palette
    const availableTopPalettes: PatternPaletteDescriptor[] = AvatarDefinitions.getPatternPalettesByPattern(
      outfitPattern.topwear
    )
    const availableBottomPalettes: PatternPaletteDescriptor[] = AvatarDefinitions.getPatternPalettesByPattern(
      outfitPattern.bottomwear
    )

    // try to find one that matches our current top palette
    const currentTopwearPalette = avatar.get(AvatarLayerStack.topwear).palette.name
    const currentBottomwearPalette = avatar.get(AvatarLayerStack.bottomwear).palette.name
    let matchingTopPalette = availableTopPalettes.find(
      (patternPalette) => patternPalette.palette.name === currentTopwearPalette
    )
    if (!matchingTopPalette) {
      // else try to match our bottoms
      if (currentBottomwearPalette !== 'transparent') {
        matchingTopPalette = availableTopPalettes.find(
          (patternPalette) => patternPalette.palette.name === currentBottomwearPalette
        )
      }

      // else try to match our hair
      if (!matchingTopPalette) {
        const hairPaletteName = avatar.get(AvatarLayerStack.hair).palette.name
        if (hairPaletteName !== 'transparent') {
          matchingTopPalette = availableTopPalettes.find(
            (patternPalette) => patternPalette.palette.name === hairPaletteName
          )
        }
      }
    }

    // select the bottom palette
    let matchingBottomPalette = availableBottomPalettes.find(
      (patternPalette) => patternPalette.palette.name === avatar.get(AvatarLayerStack.bottomwear).palette.name
    )
    if (!matchingBottomPalette) {
      matchingBottomPalette = availableBottomPalettes.find(
        (patternPalette) => patternPalette.palette.name === avatar.get(AvatarLayerStack.topwear).palette.name
      )

      // else try to match our hair
      if (!matchingBottomPalette) {
        const hairPaletteName = avatar.get(AvatarLayerStack.hair).palette.name
        if (hairPaletteName !== 'transparent') {
          matchingBottomPalette = availableBottomPalettes.find(
            (patternPalette) => patternPalette.palette.name === hairPaletteName
          )
        }
      }
    }

    // except for space_* we need to manually coordinate the space_suit colors
    if (outfitPattern.label.startsWith('space')) {
      const splitOnFirstUnderScore = outfitPattern.label.replace('space_', '').split('_')
      const joinAllButFirstToken = splitOnFirstUnderScore.slice(1).join('_')
      let spaceSuitIndex = OUTFITS_SPACE_SUIT_COLORS.indexOf(joinAllButFirstToken)
      if (spaceSuitIndex === -1) {
        throw new Error(`Invalid space pattern name ${outfitPattern.label}`)
      }

      if (!matchingTopPalette) {
        matchingTopPalette = availableTopPalettes[spaceSuitIndex]
      }
      if (!matchingBottomPalette) {
        matchingBottomPalette = availableBottomPalettes[spaceSuitIndex]
      }
    }

    // else just pick the first one
    if (!matchingTopPalette) {
      const randIndex = Math.floor(randomValueFallback * availableTopPalettes.length)
      matchingTopPalette = availableTopPalettes[randIndex]
    }

    if (!matchingBottomPalette) {
      // else just pick the first one
      const randIndex = Math.floor(randomValueFallback * availableBottomPalettes.length)
      matchingBottomPalette = availableBottomPalettes[randIndex]
    }

    // now we can construct the UI Transform
    output.push({
      label: outfitPattern.label,
      transform: {
        [AvatarLayerStack.topwear.name]: {
          patternName: outfitPattern.topwear.name,
          paletteName: matchingTopPalette.palette.name,
        },
        [AvatarLayerStack.bottomwear.name]: {
          patternName: outfitPattern.bottomwear.name,
          paletteName: matchingBottomPalette.palette.name,
        },
        [AvatarLayerStack.handwear.name]: {
          patternName: AvatarDefinitions.getPattern(AvatarLayerStack.handwear, 'none').name,
          paletteName: AvatarDefinitions.getPatternPalette(AvatarLayerStack.handwear, 'none', 'transparent').palette
            .name,
        },
        [AvatarLayerStack.footwear.name]: {
          patternName: AvatarDefinitions.getPattern(AvatarLayerStack.footwear, 'none').name,
          paletteName: AvatarDefinitions.getPatternPalette(AvatarLayerStack.footwear, 'none', 'transparent').palette
            .name,
        },
        [AvatarLayerStack.outerwear.name]: {
          patternName: AvatarDefinitions.getPattern(AvatarLayerStack.outerwear, 'none').name,
          paletteName: AvatarDefinitions.getPatternPalette(AvatarLayerStack.outerwear, 'none', 'transparent').palette
            .name,
        },
      },
    })
  }
  return output
}

const AvatarClothesPicker = ({ avatar, onClickAvatar }: Props) => {
  const [randValue, setRandValue] = useState(0)

  useEffect(() => {
    setRandValue(Math.random())
  }, [])

  const [section, setSection] = useState(Section.OUTFITS)
  const [flashingSections, setFlashingSections] = useState<Section[]>([])
  const [flashTimeout, setFlashTimeout] = useState<NodeJS.Timeout | undefined>(undefined)

  const flashTopwearAndBottomwearOnClick = (clickedAvatar: Avatar) => {
    onClickAvatar(clickedAvatar)
    const flashingSections: Section[] = []
    if (clickedAvatar.get(AvatarLayerStack.topwear).pattern.name !== 'naked') {
      flashingSections.push(Section.TOP)
    }
    if (clickedAvatar.get(AvatarLayerStack.bottomwear).pattern.name !== 'naked') {
      flashingSections.push(Section.BOTTOM)
    }
    if (flashTimeout) {
      clearTimeout(flashTimeout)
      setFlashTimeout(undefined)
      setFlashingSections([])
    }
    // Force re-render with cleared flash before starting a new one
    setTimeout(() => {
      setFlashingSections(flashingSections)
      setFlashTimeout(
        setTimeout(() => {
          setFlashingSections([]) // stop flashing after 2 seconds
          setFlashTimeout(undefined)
        }, 2000)
      )
    }, 0)
  }

  const topwearPattern: PatternDescriptor = avatar.get(AvatarLayerStack.topwear).pattern
  const bottomwearPattern: PatternDescriptor = avatar.get(AvatarLayerStack.bottomwear).pattern
  const topwearPatternName = topwearPattern.name
  const bottomwearPatternName = bottomwearPattern.name
  const topwearPalette: PaletteDescriptor = avatar.get(AvatarLayerStack.topwear).palette
  const bottomwearPalette: PaletteDescriptor = avatar.get(AvatarLayerStack.bottomwear).palette
  const topwearPaletteName = topwearPalette.name
  const bottomwearPaletteName = bottomwearPalette.name
  const body = avatar.get(AvatarLayerStack.body)

  const isFem = body.pattern.name.includes('breasts') || body.pattern.name.includes('feminine')

  const nakedOutfitPatternTransform = toUITransform(avatar, OUTFITS_NAKED, randValue)
  const matchingOutfitPatternTransforms = toUITransform(avatar, OUTFITS_MATCHING, randValue)
  const coordinatedOutfitPatternTransforms = toUITransform(avatar, OUTFITS_COORDINATED, randValue)
  const spaceShirtShortsOutfitPatternTransforms = toUITransform(avatar, OUTFITS_SPACE_SHIRT_SHORTS, randValue)
  const spaceShirtOutfitPatternTransforms = toUITransform(avatar, OUTFITS_SPACE_SHIRTS, randValue)
  const spaceSuitOutfitPatternTransforms = toUITransform(avatar, OUTFITS_SPACE_SUITS, randValue)
  const feminineOutfitPatternTransforms = toUITransform(avatar, OUTFITS_FEMININE, randValue)
  let allOutfitPatternTransforms = [] as UIAvatarTransform[]
  allOutfitPatternTransforms.push(...nakedOutfitPatternTransform)
  if (isFem) {
    allOutfitPatternTransforms = allOutfitPatternTransforms.concat(feminineOutfitPatternTransforms)
  }
  allOutfitPatternTransforms = allOutfitPatternTransforms
    .concat(matchingOutfitPatternTransforms)
    .concat(coordinatedOutfitPatternTransforms)

  const findSpacesuitIndex = (topwearPatternName: string, bottomwearPatternName: string) => {
    let spacesuitIndexToUse = -1
    if (topwearPatternName.startsWith('space_')) {
      spacesuitIndexToUse = OUTFITS_SPACE_SUIT_COLORS.indexOf(topwearPaletteName)
    }
    if (spacesuitIndexToUse === -1 && bottomwearPatternName.startsWith('space_')) {
      spacesuitIndexToUse = OUTFITS_SPACE_SUIT_COLORS.indexOf(bottomwearPaletteName)
    }
    if (spacesuitIndexToUse === -1) {
      spacesuitIndexToUse = 0
    }
    return spacesuitIndexToUse
  }
  const spacesuitIndexToUse = findSpacesuitIndex(topwearPatternName, bottomwearPatternName)
  allOutfitPatternTransforms = allOutfitPatternTransforms
    .concat({
      label: 'space_suit',
      transform: spaceSuitOutfitPatternTransforms[spacesuitIndexToUse].transform,
    })
    .concat({ label: 'space_shirt', transform: spaceShirtOutfitPatternTransforms[spacesuitIndexToUse].transform })
    .concat({
      label: 'space_shirt_shorts',
      transform: spaceShirtShortsOutfitPatternTransforms[spacesuitIndexToUse].transform,
    })

  // figure out if avatar is wearing an outfit
  let indexOfAvatarOutfit = -1
  let selectedAvatarLabel = ''
  for (let i = 0; i < allOutfitPatternTransforms.length; i++) {
    const outfitPattern = allOutfitPatternTransforms[i]
    if (outfitPattern.label === 'naked') {
      continue
    }
    const topwearMatches = outfitPattern.transform[AvatarLayerStack.topwear.name].patternName === topwearPatternName
    const bottomwearMatches =
      outfitPattern.transform[AvatarLayerStack.bottomwear.name].patternName === bottomwearPatternName
    if (topwearMatches && bottomwearMatches) {
      indexOfAvatarOutfit = i
      selectedAvatarLabel = outfitPattern.label
      break
    }
  }
  const isAvatarWearingAnOutfit = indexOfAvatarOutfit != -1

  // if wearing an outfit, then coordinate the other outfits displayed to match colors
  let currentOutfitSelectedInOtherColorsTransforms: UIAvatarTransform[] = []
  if (isAvatarWearingAnOutfit) {
    const currentOutfitTransform = allOutfitPatternTransforms[indexOfAvatarOutfit]

    const paletteCodesMatch = topwearPalette.code === bottomwearPalette.code

    if (
      Math.max(topwearPalette.code, bottomwearPalette.code) > 0 &&
      (paletteCodesMatch || topwearPalette.code === 0 || bottomwearPalette.code === 0)
    ) {
      const palettes = AvatarDefinitions.getPalettesByCode(
        bottomwearPalette.code !== 0 ? bottomwearPalette.code : topwearPalette.code
      )
      // fill up currentOutfitSelectedInOtherColorsTransforms with all the other colors
      for (const palette of palettes) {
        const transform: Record<string, PatternPaletteNames> = {}
        if (bottomwearPalette.code !== 0) {
          transform[AvatarLayerStack.bottomwear.name] = {
            ...currentOutfitTransform.transform[AvatarLayerStack.bottomwear.name],
            paletteName: palette.name,
          }
        } else {
          transform[AvatarLayerStack.bottomwear.name] = {
            patternName: 'naked',
            paletteName: 'transparent',
          }
        }
        if (topwearPalette.code !== 0) {
          transform[AvatarLayerStack.topwear.name] = {
            ...currentOutfitTransform.transform[AvatarLayerStack.topwear.name],
            paletteName: palette.name,
          }
        } else {
          transform[AvatarLayerStack.topwear.name] = {
            patternName: 'naked',
            paletteName: 'transparent',
          }
        }
        // label via the palette name
        currentOutfitSelectedInOtherColorsTransforms.push({
          label: palette.name.replace('theme__', ''),
          transform: transform,
        })
      }
    }
  }

  return (
    <div className={styles.container}>
      <AvatarClothesPickerSelectorBar
        avatar={avatar}
        section={section}
        setSection={setSection}
        flashing={flashingSections}
      />
      {section === Section.OUTFITS && (
        <>
          <AvatarPickerHelpText text="Change garmet colors by selecting [top], [bottom], [hands], [feet], etc." />
          <LabeledHr label={'Outfits'} />
          <AvatarTransformsPickerSection
            avatar={avatar}
            transforms={allOutfitPatternTransforms}
            gridLayoutType={UIGridLayoutType.Compact}
            hideClothes={false}
            onClickAvatar={flashTopwearAndBottomwearOnClick}
            showScrollToastOnClick={false}
          />
        </>
      )}
      {section === Section.OUTFITS && currentOutfitSelectedInOtherColorsTransforms.length > 0 && (
        <>
          <LabeledHr label={`${selectedAvatarLabel} colors`} />
          <AvatarTransformsPickerSection
            avatar={avatar}
            transforms={currentOutfitSelectedInOtherColorsTransforms}
            gridLayoutType={UIGridLayoutType.Compact}
            hideClothes={false}
            onClickAvatar={flashTopwearAndBottomwearOnClick}
            showScrollToastOnClick={false}
          />
        </>
      )}
      {section === Section.BOTTOM && (
        <AvatarTwoPartPicker
          layer={AvatarLayerStack.bottomwear}
          avatar={avatar}
          onClickAvatar={onClickAvatar}
          maxPatternCols={8}
          suggestedSearchTerms={[
            'gradient',
            'naked',
            'pants',
            'shorts',
            'skirt',
            'solid',
            'space',
            'speckled',
            'underwear',
          ]}
        />
      )}
      {section === Section.FOOTWEAR && (
        <AvatarTwoPartPicker layer={AvatarLayerStack.footwear} avatar={avatar} onClickAvatar={onClickAvatar} />
      )}
      {section === Section.TOP && (
        <AvatarTwoPartPicker
          layer={AvatarLayerStack.topwear}
          avatar={avatar}
          onClickAvatar={onClickAvatar}
          maxPatternCols={8}
          suggestedSearchTerms={[
            'bra',
            'croptop',
            'dress',
            'gradient',
            'pocket',
            'solid',
            'space',
            'speckled',
            'stripes',
            'tanktop',
            'tshirt',
            'vneck',
          ]}
        />
      )}
      {section === Section.HANDWEAR && (
        <AvatarTwoPartPicker layer={AvatarLayerStack.handwear} avatar={avatar} onClickAvatar={onClickAvatar} />
      )}
      {section === Section.OUTERWEAR && (
        <AvatarTwoPartPicker layer={AvatarLayerStack.outerwear} avatar={avatar} onClickAvatar={onClickAvatar} />
      )}
    </div>
  )
}

export default AvatarClothesPicker
