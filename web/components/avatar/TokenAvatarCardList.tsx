import styles from '../../styles/avatar/TokenAvatarCardList.module.scss'
import TokenAvatarCard from './TokenAvatarCard'

type TokenId = bigint | number

interface TokenAvatarCardListProps {
  tokenIds: TokenId[]
}

const TokenAvatarCardList: React.FC<TokenAvatarCardListProps> = ({ tokenIds }) => {
  return (
    <div className={styles.container}>
      {tokenIds.map((tokenId, index) => (
        <div key={index} className={styles.item}>
          <TokenAvatarCard tokenId={tokenId} showPfpSettingsControls={true} showDownloadControls={true} />
          <hr className={styles.divider} />
        </div>
      ))}
    </div>
  )
}

export default TokenAvatarCardList
