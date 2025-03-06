import { Avatar, DNA } from '@openavatar/types'
import Link from 'next/link'
import styles from '../../styles/avatar/AvatarGrid.module.scss'
import OnChainAvatarSpriteRender from './sprite/OnChainAvatarSpriteRender'
import OnChainClickableAvatarSprite from './sprite/OnChainClickableAvatarSprite'

type TokenId = bigint | number
type AvatarLike = Avatar | DNA | TokenId

interface AvatarGridProps {
  sources: AvatarLike[]
  gridTemplateColumns?: string
  hyperlink: boolean
}

const OnchainAvatarGrid: React.FC<AvatarGridProps> = ({ sources, gridTemplateColumns, hyperlink }) => {
  const urlParams =
    typeof window !== 'undefined' && window !== undefined
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
  const isAdmin = urlParams.get('admin') === 'true'
  const pw = urlParams.get('password')
  const reveal = urlParams.get('reveal')

  const renderAvatar = (source: AvatarLike) => {
    const avatarBaseUrl = `/avatar/${source.toString()}`
    const newParams = new URLSearchParams() // Create new URLSearchParams instance

    // Add parameters based on condition
    if (isAdmin) {
      newParams.set('admin', 'true')
    }
    if (pw) {
      newParams.set('password', pw)
    }
    if (reveal) {
      newParams.set('reveal', reveal)
    }
    // Construct the final URL
    const linkTo = `${avatarBaseUrl}${newParams.toString() ? '?' + newParams.toString() : ''}`

    return hyperlink ? (
      <Link href={linkTo} key={source.toString()}>
        {/* <div style={{ border: '6px solid white', borderRadius: '8px', margin: '4px' }}>
          <OnChainAvatarSpriteRender source={source} width={96} height={96} />
        </div> */}
        <OnChainClickableAvatarSprite
          source={source}
          width={96}
          height={96}
          highlight={false}
          label={typeof source === 'number' || typeof source === 'bigint' ? `${source}` : undefined}
        />
      </Link>
    ) : (
      <div style={{ border: '6px solid white', borderRadius: '8px', margin: '4px' }}>
        <OnChainAvatarSpriteRender source={source} width={96} height={96} key={source.toString()} />
      </div>
    )
  }

  return (
    <div className={styles.container} style={{ gridTemplateColumns }}>
      {sources.map((source) => renderAvatar(source))}
    </div>
  )
}

export default OnchainAvatarGrid
