import { Avatar, DNA } from '@openavatar/types'

import { AvatarAssets, Base64PNGURI } from '@openavatar/assets'
import { AvatarLayerStack, LayerDescriptor } from '@openavatar/types'
import Image from 'next/image'
import { ProfilePictureSettings } from '../pfp/ProfilePictureSettings'

interface AvatarSpriteLayerProps {
  avatar: Avatar
  layer: LayerDescriptor
  height: number
  width: number
}

// component for a single sprite layer
const AvatarSpriteLayer: React.FC<AvatarSpriteLayerProps> = ({
  avatar,
  layer,
  height,
  width,
}: AvatarSpriteLayerProps) => {
  const image: Base64PNGURI = AvatarAssets.getSprite(avatar, layer)
  const altText = `Avatar layer ${layer.name}`
  return (
    <div className={`img-container sprite-layer-${layer.name}`} style={{ position: 'absolute' }}>
      <Image
        src={image}
        alt={altText}
        height={height}
        width={width}
        style={{
          zIndex: layer.index,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

interface AvatarSpriteLayerStackProps {
  avatar: Avatar
  height: number
  width: number
  pfpSettings?: ProfilePictureSettings
}

// component for the avatar sprite
const AvatarSpriteLayerStack: React.FC<AvatarSpriteLayerStackProps> = ({
  avatar,
  height,
  width,
  pfpSettings,
}: AvatarSpriteLayerStackProps) => {
  const dynamicStyle: Record<string, string> = {
    position: 'relative',
    height: `${height}px`,
    width: `${width}px`,
    margin: '0',
  }
  if (pfpSettings?.overrideBackground) {
    dynamicStyle.backgroundColor = pfpSettings?.backgroundColor.replace('0x', '#')
  } else {
    dynamicStyle.backgroundColor = 'transparent'
  }
  return (
    <div className="avatarSprite" style={dynamicStyle}>
      {AvatarLayerStack.map((layer) => (
        <AvatarSpriteLayer key={layer.name} avatar={avatar} layer={layer} height={height} width={width} />
      ))}
    </div>
  )
}

interface Size {
  width: number
  height: number
}

interface OffChainAvatarSpriteProps extends Size {
  source: Avatar | DNA
  pfpSettings?: ProfilePictureSettings
}

const OffChainAvatarSpriteRender: React.FC<OffChainAvatarSpriteProps> = ({ source, height, width, pfpSettings }) => {
  // source should not be a number
  if (typeof source === 'number') {
    throw new Error('Cannot render off-chain with a token id')
  }
  // check if source is a DNA
  const avatar: Avatar = source instanceof DNA ? new Avatar(source) : source
  // Render the avatar off-chain using the DNA
  return <AvatarSpriteLayerStack avatar={avatar} height={height} width={width} pfpSettings={pfpSettings} />
}

export default OffChainAvatarSpriteRender
