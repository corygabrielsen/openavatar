import { useNetwork } from 'wagmi'
import styles from '../../styles/util/ChainConnectedText.module.scss'
import { HUMAN_READABLE_CHAIN_NAMES } from './chains'

interface Props {
  onClick?: () => void
  onContextMenu?: () => void
}

const ChainConnectedText: React.FC<Props> = ({ onClick, onContextMenu }) => {
  const { chain } = useNetwork()
  return (
    <aside className={styles.chainConnectedText} onClick={onClick} onContextMenu={onContextMenu}>
      {/* {(!chain || chain?.unsupported) && <div>Unsupported chain: {chain?.id}</div>} */}
      {chain && !chain?.unsupported && !chain?.id && <div>Not connected to a chain</div>}
      {chain && !chain?.unsupported && chain?.id !== 1 && (
        <div>Connected to {HUMAN_READABLE_CHAIN_NAMES[chain?.id as number]}</div>
      )}
    </aside>
  )
}
export default ChainConnectedText
