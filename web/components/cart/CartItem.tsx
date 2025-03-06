import { Avatar, AvatarLayerStack, PatternPaletteDescriptor } from '@openavatar/types'
import { useEffect, useState } from 'react'
import style from '../../styles/cart/CartItem.module.scss'
import OffChainClickableAvatarSprite from '../avatar/sprite/OffChainClickableAvatarSprite'

import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const dynamicStyle = {
  backgroundImage: `url(${publicRuntimeConfig.baseUrl}/plus_white.png)`,
}
const dynamicStyleHover = {
  backgroundImage: `url(${publicRuntimeConfig.baseUrl}/plus_189ad3.png)`,
}

interface Props {
  avatar?: Avatar
  highlight?: boolean
  onSelect: () => void
  onRandom?: () => void
  onDelete?: () => void
}

const CartItem = ({ avatar, highlight, onSelect: onClick, onRandom, onDelete }: Props) => {
  const [selectedAvatar, setSelectedAvatar] = useState(avatar)
  const [isHovered, setIsHovered] = useState(false)
  const urlParams = new URLSearchParams(window.location.search)
  const isAdmin = urlParams.get('admin') === 'true'
  const reduceAvatar = (avatar: Avatar) => {
    const result: any = {}
    for (const layer of AvatarLayerStack.iter()) {
      const patternPalette: PatternPaletteDescriptor = avatar.get(layer)
      if (!['none', 'bald', 'naked'].includes(patternPalette.pattern.name)) {
        result[layer.name] = {
          patternName: patternPalette.pattern.name,
          paletteName: patternPalette.palette.name,
        }
      }
    }
    return result
  }

  const onDownload = () => {
    if (selectedAvatar) {
      const jsonStr = JSON.stringify(reduceAvatar(selectedAvatar), null, 2)
      const dataUri = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr)

      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute('href', dataUri)
      downloadAnchorNode.setAttribute('download', `${selectedAvatar.dna.toString()}.json`)
      document.body.appendChild(downloadAnchorNode) // required for firefox
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
    }
  }

  useEffect(() => {
    setSelectedAvatar(avatar)
  }, [avatar])

  const onCopy = () => {
    // add to clipboard
    if (!avatar) return
    const dnaStr = avatar.dna.toString()
    navigator.clipboard.writeText(dnaStr)
  }

  const renderContent = () => {
    if (selectedAvatar) {
      return (
        <>
          <OffChainClickableAvatarSprite
            avatar={selectedAvatar}
            hideClothes={false}
            height={64}
            width={64}
            highlight={highlight === true}
            onClick={onClick}
          />
          {onRandom && (
            <div className={`${style.cartButton} ${style.randomButton}`} onClick={onRandom}>
              <div>↻</div>
            </div>
          )}
          {isAdmin && (
            <div className={`${style.cartButton} ${style.copyButton}`} onClick={onCopy}>
              <div>+</div>
            </div>
          )}
          {isAdmin && (
            <div className={`${style.cartButton} ${style.downloadButton}`} onClick={onDownload}>
              <div>↓</div>
            </div>
          )}
          {onDelete && (
            <div className={`${style.cartButton} ${style.deleteButton}`} onClick={onDelete}>
              <div>✕</div>
            </div>
          )}
        </>
      )
    } else {
      return (
        <div
          className={style.pluscontainer}
          style={isHovered ? dynamicStyleHover : dynamicStyle}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div></div>
        </div>
      )
    }
  }

  return <div className={style.container}>{renderContent()}</div>
}

export default CartItem
