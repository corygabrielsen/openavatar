import { Avatar, DNA } from '@openavatar/types'
import React, { useState } from 'react'
import style from '../../../styles/avatar/sprite/ClickableAvatarSprite.module.scss'

import getConfig from 'next/config'
import OnChainAvatarSpriteRender from './OnChainAvatarSpriteRender'
const { publicRuntimeConfig } = getConfig()

type TokenId = bigint | number
type AvatarLike = Avatar | DNA | TokenId

interface Props {
  source: AvatarLike
  highlight: boolean
  height: number
  width: number
  label?: string
}

const OnChainClickableAvatarSprite = ({ source, highlight, height, width, label }: Props) => {
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
      console.log('Touched avatar: ', source)
      // onClick(avatar)
    }
  }

  const dynamicStyle = {
    backgroundImage: `url(${publicRuntimeConfig.baseUrl}/checkerboard${width / 2}x${height / 2}.png)`,
    height: `${height + (label ? 16 : 0)}px`,
    width: `${width}px`,
  }

  return (
    <div
      className={`${style.container} ${highlight ? style.selected : style.unselected}`}
      style={dynamicStyle}
      onClick={() => {
        // console.log('Clicked on avatar: ', source)
        // onClick(avatar)
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <OnChainAvatarSpriteRender source={source} height={height} width={width} />
      {label !== undefined && <label className={style.bottomlabel}>{`${label}`}</label>}
    </div>
  )
}

export default OnChainClickableAvatarSprite
