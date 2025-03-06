import { Avatar, AvatarLayerStack, LayerDescriptor } from '@openavatar/types'
import { useEffect, useState } from 'react'
import styles from '../../styles/maker/AvatarButton.module.scss'
import AvatarSpriteRender from '../avatar/sprite/AvatarSpriteRender'

function toButtonAvatar(avatar: Avatar, showLayers: LayerDescriptor[]): Avatar {
  let newAvatar = new Avatar(avatar.dna)

  const stripLayers = AvatarLayerStack.filter((layer) => !showLayers.map((l) => l.name).includes(layer.name))
  stripLayers.forEach((layer) => {
    newAvatar = newAvatar.transform({
      [layer.name]: {
        patternName:
          layer.name === AvatarLayerStack.hair.name
            ? 'bald'
            : layer.name === AvatarLayerStack.body.name
            ? 'invisible'
            : [AvatarLayerStack.topwear.name, AvatarLayerStack.bottomwear.name].includes(layer.name)
            ? 'naked'
            : 'none',
        paletteName: 'transparent',
      },
    })
  })
  return newAvatar
}

interface ButtonProps {
  label: string
  avatar: Avatar
  showLayers: LayerDescriptor[]
  selected: boolean
  flash?: number
  onClick: () => void
}

const AvatarButton = ({ label, avatar, showLayers, selected, flash, onClick }: ButtonProps) => {
  const labelWords: string[] = label.split('_')

  const [AVATAR_SIZE, setAvatarSize] = useState(64) // A hook to run code only on the client-side after the component has mounted
  useEffect(() => {
    const updateSize = () => {
      const smallSize = window.innerWidth <= 480 || window.innerHeight <= 900
      setAvatarSize(smallSize ? 32 : 64)
    }
    // Update the size at the beginning
    updateSize()

    // Add a resize event listener to the window to update the size whenever the window size changes
    window.addEventListener('resize', updateSize)

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <div
      className={`${styles.container} ${selected ? styles.selected : styles.unselected} ${flash ? styles.flash : ''}`}
      onClick={onClick}
    >
      <div className={styles.buttonSprite}>
        <AvatarSpriteRender
          render="offchain"
          source={toButtonAvatar(avatar, showLayers)}
          height={AVATAR_SIZE}
          width={AVATAR_SIZE}
        />
      </div>
      <div className={styles.textLabels}>
        {/* <label className={styles.textLabel}>{label}</label> */}
        <label className={styles.textLabel}>{labelWords[0]}</label>
        {labelWords.length > 1 && <label className={styles.textLabel}>{labelWords[1]}</label>}
      </div>
    </div>
  )
}

export default AvatarButton
