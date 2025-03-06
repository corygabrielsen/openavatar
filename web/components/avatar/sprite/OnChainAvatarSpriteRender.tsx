import { Avatar, DNA } from '@openavatar/types'
import { ProfilePictureSettings } from '../pfp/ProfilePictureSettings'
import AvatarRender from './AvatarProfilePictureRender'
import TokenRender from './TokenRender'

type TokenId = bigint | number
type AvatarLike = Avatar | DNA | TokenId

interface OnChainAvatarSpriteRenderProps {
  source: AvatarLike

  width?: number
  height?: number

  pfpSettings?: ProfilePictureSettings

  onClick?: (avatar: Avatar) => void
}

const OnChainAvatarSpriteRender: React.FC<OnChainAvatarSpriteRenderProps> = ({
  source,
  height,
  width,
  pfpSettings,
  onClick,
}) => {
  // source should not be a number
  if (typeof source === 'number' || typeof source === 'bigint') {
    return <TokenRender tokenId={source} onClick={onClick} height={height} width={width} />
  }
  // check if source is a DNA
  const avatar: Avatar = source instanceof DNA ? new Avatar(source) : source
  if (avatar === undefined) {
    return <div>null Avatar in OnChainAvatarSpriteRender</div>
  }
  // Render the avatar onchain using the DNA
  return <AvatarRender avatar={avatar} onClick={onClick} height={height} width={width} pfpSettings={pfpSettings} />
}

export default OnChainAvatarSpriteRender
