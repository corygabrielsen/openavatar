import { Avatar, DNA } from '@openavatar/types'
import Link from 'next/link' // <-- import the Link component
import styles from '../../styles/avatar/AvatarGrid.module.scss'
import OffChainAvatarSpriteRender from './sprite/OffChainAvatarSpriteRender'

type AvatarLike = Avatar | DNA

interface AvatarGridProps {
  sources: AvatarLike[]
  gridTemplateColumns?: string
  hyperlink: boolean
}

const OffchainAvatarGrid: React.FC<AvatarGridProps> = ({ sources, gridTemplateColumns, hyperlink }) => {
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
        <OffChainAvatarSpriteRender source={source} width={96} height={96} />
      </Link>
    ) : (
      <OffChainAvatarSpriteRender source={source} width={96} height={96} key={source.toString()} />
    )
  }

  return (
    <div className={styles.container} style={{ gridTemplateColumns }}>
      {sources.map((source) => renderAvatar(source))}
    </div>
  )
}

export default OffchainAvatarGrid
