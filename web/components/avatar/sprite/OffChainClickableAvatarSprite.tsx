import { Avatar, AvatarLayerStack } from '@openavatar/types'
import React, { useState } from 'react'
import style from '../../../styles/avatar/sprite/ClickableAvatarSprite.module.scss'

import getConfig from 'next/config'
import AvatarSpriteRender from './AvatarSpriteRender'
const { publicRuntimeConfig } = getConfig()

interface Props {
  avatar: Avatar
  // hide clothes in the displayed render, but not in the onClick callback
  hideClothes: boolean
  highlight: boolean
  height: number
  width: number
  label?: string
  onClick: (avatar: Avatar) => void
}

const OffChainClickableAvatarSprite = ({ avatar, hideClothes, highlight, height, width, label, onClick }: Props) => {
  const [touchStartPoint, setTouchStartPoint] = useState({ x: 0, y: 0 })

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartPoint({ x: event.touches[0].clientX, y: event.touches[0].clientY })
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const touchEndPoint = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
    const distanceX = Math.abs(touchEndPoint.x - touchStartPoint.x)
    const distanceY = Math.abs(touchEndPoint.y - touchStartPoint.y)

    // a good starting point for a tap threshold is typically between 5 and 15 pixels.
    const tapThreshold = 10

    if (distanceX < tapThreshold && distanceY < tapThreshold) {
      console.log('Touched avatar: ', avatar)
      onClick(avatar)
    }
  }

  const dynamicStyle = {
    backgroundImage: `url(${publicRuntimeConfig.baseUrl}/checkerboard${width / 2}x${height / 2}.png)`,
    height: `${height + (label ? 16 : 0)}px`,
    width: `${width}px`,
  }

  const displayedAvatar = !hideClothes
    ? avatar
    : avatar.transform({
        [AvatarLayerStack.topwear.name]: { patternName: 'naked', paletteName: 'transparent' },
        [AvatarLayerStack.bottomwear.name]: { patternName: 'naked', paletteName: 'transparent' },
        [AvatarLayerStack.handwear.name]: { patternName: 'none', paletteName: 'transparent' },
        [AvatarLayerStack.footwear.name]: { patternName: 'none', paletteName: 'transparent' },
        [AvatarLayerStack.outerwear.name]: { patternName: 'none', paletteName: 'transparent' },
        [AvatarLayerStack.jewelry.name]: { patternName: 'none', paletteName: 'transparent' },
      })

  return (
    <div
      className={`${style.container} ${highlight ? style.selected : style.unselected}`}
      style={dynamicStyle}
      onClick={() => {
        // console.log('Clicked on avatar: ', avatar)
        onClick(avatar)
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AvatarSpriteRender render={'offchain'} source={displayedAvatar} height={height} width={width} />
      {label !== undefined && <label className={style.bottomlabel}>{`${label}`}</label>}
    </div>
  )
}

export default OffChainClickableAvatarSprite
