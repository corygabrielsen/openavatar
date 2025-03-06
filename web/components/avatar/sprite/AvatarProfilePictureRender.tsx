import { Avatar } from '@openavatar/types'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import styles from '../../../styles/avatar/sprite/AvatarRender.module.scss'
import { ProfilePictureSettings } from '../pfp/ProfilePictureSettings'
import { useAvatarSVG } from './useAvatarSVG'

interface Props {
  avatar: Avatar
  height?: number
  width?: number
  pfpSettings?: ProfilePictureSettings
  onClick?: (avatar: Avatar) => void
}

const AvatarRender = ({ avatar, height, width, pfpSettings, onClick }: Props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected } = useAccount()

  const { render, isLoading, isError } = useAvatarSVG(avatar, pfpSettings)
  if (isError) console.error('error', isError)

  const onClickSafe = () => {
    if (isLoading || isError) {
      return
    }
    if (onClick) {
      onClick(avatar)
    }
  }
  // convert the hexstring bytes to a string

  const containerDynamicStyle =
    height && width
      ? {
          // this works
          height: `${height}px`,
          width: `${width}px`,
        }
      : {}
  return (
    <div className={styles.container} style={containerDynamicStyle} onClick={() => onClickSafe()}>
      {mounted && isConnected && (
        <div className={styles.render} dangerouslySetInnerHTML={{ __html: render?.getSVG() || '' }} />
      )}
    </div>
  )
}

export default AvatarRender
