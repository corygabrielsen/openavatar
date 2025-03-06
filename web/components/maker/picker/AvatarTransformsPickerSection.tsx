import { Avatar, PatternPaletteNames } from '@openavatar/types'
import { useEffect, useRef } from 'react'
import styles from '../../../styles/maker/picker/AvatarTransformsPickerSection.module.scss'
import OffChainClickableAvatarSprite from '../../avatar/sprite/OffChainClickableAvatarSprite'

import toast from 'react-hot-toast'
import { SCROLL_THRESHOLD, notifyScrollHint } from './ScrollToast'
import ScrollToaster from './ScrollToaster'
import { LabeledAvatar, UIGridItem, UIGridItemType, UIGridLayoutType, computeGridLayout } from './grid'
import useGridSize from './useGridSize'

interface UIAvatarTransform {
  label?: string
  transform: Record<string, PatternPaletteNames>
}

interface Props {
  label?: String

  avatar: Avatar
  transforms: UIAvatarTransform[]
  gridLayoutType: UIGridLayoutType
  hideClothes: boolean

  onClickAvatar: (avatar: Avatar) => void
  showScrollToastOnClick: boolean
  scrollToastMessage?: string

  gridMaxColumns?: number
}

const AVATAR_WIDTH = 96
const AVATAR_HEIGHT = 96
const AVATAR_PADDING = 4
const AVATAR_LABEL_HEIGHT = 16
const AVATAR_ITEM_HEIGHT = AVATAR_HEIGHT + AVATAR_LABEL_HEIGHT + AVATAR_PADDING * 2
const AVATAR_ITEM_WIDTH = AVATAR_WIDTH + AVATAR_PADDING * 2

const AvatarTransformsPickerSection = ({
  avatar,
  hideClothes,
  transforms,
  showScrollToastOnClick,
  onClickAvatar,
  label,
  scrollToastMessage,
  gridLayoutType,
  gridMaxColumns,
}: Props) => {
  // layout
  const { containerRef, gridRef, gridInfo } = useGridSize({
    transforms,
    fillWidth: gridLayoutType === UIGridLayoutType.GroupByRows,
    maxColumns: gridMaxColumns,
  })

  // toast
  const lastToastTime = useRef<number | null>(null)
  const toastScrollY = useRef(0)

  useEffect(() => {
    const hideToastOnScroll = () => {
      // checks if the scroll is down from the toast's position
      if (window.scrollY > toastScrollY.current + SCROLL_THRESHOLD) {
        toast.dismiss('scroll-notification')
        toastScrollY.current = 0 // Reset the scroll position
      }
    }

    if (showScrollToastOnClick) {
      window.addEventListener('scroll', hideToastOnScroll)
    }

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('scroll', hideToastOnScroll)
    }
  }, [showScrollToastOnClick])

  function onClickAvatarAndToast(avatar: Avatar): void {
    onClickAvatar(avatar)

    notifyScrollHint({
      lastToastTime,
      toastScrollY,
      showScrollToastOnClick,
      scrollToastMessage,
    })
  }

  const labeledAvatars: LabeledAvatar[] = transforms.map((uiTransform) => {
    return { label: uiTransform.label || '', avatar: avatar.transform(uiTransform.transform) }
  })

  if (transforms.length === 0) {
    return null
  }

  let gridItems: UIGridItem[] = computeGridLayout(gridInfo, labeledAvatars, gridLayoutType)

  const gridItemStyle = {
    width: `${AVATAR_ITEM_WIDTH}px`,
    height: `${AVATAR_ITEM_HEIGHT}px`,
  }

  const gridItemLabelColors: Record<string, string> = {
    black: '#000000',
    blue: '#1E90FF',
    'blue-gray': '#748AC2',
    gray: '#A0A0A0',
    cyan: '#00FFFF',
    turquoise: '#00CED1',
    teal: '#20B2AA',
    green: '#2AB42A',
    'green-gray': '#8FBC8F',
    'blue-green': '#20B2AA',
    amber: '#B8860B',
    hazel: '#A08060',
    brown: '#9E4F16',
    lavender: '#A473D2',
    periwinkle: '#BFA0FF',
    violet: '#9F00FF',
    magenta: '#FF1493',
    fuchsia: 'fuchsia',
    'rose gold': '#FF6EA3',
    coral: '#F08080',
    pink: '#FF69B4',
    red: '#FF0000',
    orange: '#FF8C00',
    yellow: '#FFD700',
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={`${styles.grid}`} ref={gridRef}>
        {gridItems.map((gridItem) => {
          if (gridItem.type === UIGridItemType.Empty) {
            return <div key={`gridItem-${Math.random()}`} className={styles.gridItem} style={gridItemStyle} />
          }

          if (gridItem.type === UIGridItemType.Label) {
            return (
              <div key={`gridItem-${Math.random()}`} className={styles.gridItem} style={gridItemStyle}>
                {(gridItem.item as string)
                  .replace('sports_bra', 'sports bra')
                  .replace('dress_lowcut', 'lowcut dress')
                  .replace('blue_green', 'blue-green')
                  .replace('blue_gray', 'blue-gray')
                  .replace('green_gray', 'green-gray')
                  .replace('rose_gold', 'rose gold')
                  .split('_')
                  .map((line, index) => {
                    let color = gridItemLabelColors[line] || 'white'
                    if (['solid', 'gradient', 'stripes', 'radial', 'pocket', 'speckled'].includes(line)) {
                      color = 'gray'
                    }
                    return (
                      <div
                        key={`gridItem-${Math.random()}`}
                        style={{
                          color: color,
                          fontSize: '1em',
                          letterSpacing: '0.1em',
                          width: '100%',
                          textAlign: 'right',
                          fontWeight: line === 'black' ? 'bold' : undefined,
                        }}
                      >
                        {line}
                      </div>
                    )
                  })}
              </div>
            )
          }
          const labeledAvatar = gridItem.item as LabeledAvatar
          const highlight = labeledAvatar.avatar.dna.toString() === avatar.dna.toString()
          const onClick = highlight
            ? (avatar: Avatar) => onClickAvatar(avatar)
            : (avatar: Avatar) => onClickAvatarAndToast(avatar)
          return (
            <div key={`gridItem-${labeledAvatar.label}`} className={styles.gridItem} style={gridItemStyle}>
              <OffChainClickableAvatarSprite
                avatar={labeledAvatar.avatar}
                hideClothes={hideClothes}
                height={AVATAR_HEIGHT}
                width={AVATAR_WIDTH}
                highlight={labeledAvatar.avatar.dna.toString() === avatar.dna.toString()}
                label={labeledAvatar.label.replace('special_', '')}
                onClick={onClick}
              />
            </div>
          )
        })}
      </div>

      {showScrollToastOnClick && <ScrollToaster />}
    </div>
  )
}

export default AvatarTransformsPickerSection
