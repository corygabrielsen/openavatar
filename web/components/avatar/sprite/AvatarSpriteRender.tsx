import { Avatar, DNA } from '@openavatar/types'
import { ProfilePictureSettings } from '../pfp/ProfilePictureSettings'
import OffChainAvatarSpriteRender from './OffChainAvatarSpriteRender'
import OnChainAvatarSpriteRender from './OnChainAvatarSpriteRender'

interface AvatarSpriteRenderProps {
  source: Avatar | DNA | number
  render: 'onchain' | 'offchain'
  height?: number
  width?: number
  pfpSettings?: ProfilePictureSettings
}

const AvatarSpriteRender = ({ source, render, height, width, pfpSettings }: AvatarSpriteRenderProps) => {
  if (render === 'offchain') {
    // source should not be a number
    if (typeof source === 'number') {
      return <div>Cannot render off-chain with a token id</div>
    }
    if (height === undefined || width === undefined) {
      return <div>ui bug: height/width not provided</div>
    }
    return <OffChainAvatarSpriteRender source={source} height={height} width={width} pfpSettings={pfpSettings} />
  } else {
    return <OnChainAvatarSpriteRender source={source} height={height} width={width} pfpSettings={pfpSettings} />
  }
}

export default AvatarSpriteRender
