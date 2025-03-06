import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../abi/ABI'
import styles from '../../styles/wallet/WalletView.module.scss'
import OnchainAvatarGrid from '../avatar/OnchainAvatarGrid'
import TokenAvatarCardList from '../avatar/TokenAvatarCardList'
import ChainConnectedText from '../utils/ChainConnectedText'

const WalletView = () => {
  const [mounted, setMounted] = useState(false)
  const { isConnected, address, connector } = useAccount()
  const { chain } = useNetwork()

  useEffect(() => setMounted(true), [])

  const { data, isLoading, isError } = useContractRead({
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'totalSupply',
    args: [],
  })
  const totalSupply = data as bigint

  return (
    <div className={styles.container}>
      {mounted && isConnected && <ChainConnectedText />}
      <div className={styles.header}>
        <h1 className={styles.title}>Your Squad</h1>
      </div>
      <div className={styles.content}>
        {!mounted && <div className={styles.loading}>Loading...</div>}
        {mounted && !isConnected && (
          <ConnectButton accountStatus="address" chainStatus="none" label="Connect" showBalance={false} />
        )}
        {mounted && isConnected && isLoading && <div className={styles.loading}>Loading...</div>}
        {mounted && isConnected && isError && <div className={styles.error}>Error loading avatars</div>}
        {mounted && !isLoading && !isError && totalSupply > 0 && <InnerWalletView totalSupply={totalSupply} />}
      </div>
    </div>
  )
}

const InnerWalletView = ({ totalSupply }: { totalSupply: bigint }) => {
  const [mounted, setMounted] = useState(false)
  const [tokenIds, setTokenIds] = useState<bigint[]>([])
  const [batchStartIndex, setBatchStartIndex] = useState(0)

  const batchSize = 250 // Fetch 1000 avatars at a time
  const batchEndIndex = batchStartIndex + batchSize

  const { isConnected, address, connector } = useAccount()
  const { chain } = useNetwork()

  useEffect(() => setMounted(true), [])

  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'tokensOfOwnerIn',
    args: [address, batchStartIndex, batchEndIndex],
  }

  const { data, isLoading, isError, error } = useContractRead(useContractReadParams)

  // If there's an error, log it
  if (isError) {
    console.error(error)
  }

  if (!isLoading && !isError) {
    const found = data as bigint[]
    if (found.length === 0) {
      console.log(`No avatars found for ${address} in range ${batchStartIndex} - ${batchEndIndex}`)
    } else {
      console.log(`Found ${found} avatars for ${address} in range ${batchStartIndex} - ${batchEndIndex}`)
    }

    // If there's data, update the state
    if (batchStartIndex < totalSupply) {
      // Update the batch end index for the next fetch
      setBatchStartIndex(batchEndIndex)

      // Add the new batch of token IDs to the existing ones
      setTokenIds(tokenIds.concat(found))
    }
  }

  return (
    <div className={styles.container}>
      {mounted && !isConnected && <p className={styles.title}>Connect wallet to view your avatars</p>}
      {mounted && isConnected && (
        <h2 className={styles.title}>{`${tokenIds.length} avatar${tokenIds.length === 1 ? '' : 's'}`}</h2>
      )}
      {mounted && isConnected && isLoading && <div className={styles.loading}>Loading...</div>}
      {mounted && isConnected && !isLoading && isError && <div className={styles.error}>Error loading avatars</div>}
      {mounted && isConnected && !isLoading && !isError && <OnchainAvatarGrid hyperlink={true} sources={tokenIds} />}
      {mounted && isConnected && !isLoading && !isError && <TokenAvatarCardList tokenIds={tokenIds} />}
    </div>
  )
}

export default WalletView
