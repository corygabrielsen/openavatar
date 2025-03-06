import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useNetwork } from 'wagmi'

import { getContractConfigs } from '../../abi/ABI'
import styles from '../../styles/avatars/AvatarsView.module.scss'
import OnchainAvatarGrid from '../avatar/OnchainAvatarGrid'
import ChainConnectedText from '../utils/ChainConnectedText'
import PaginationControls from './PaginationControls'

const FIRST_AVATAR_INDEX = 0

const AvatarsView = () => {
  const [mounted, setMounted] = useState(false)

  const urlParams =
    typeof window !== 'undefined' && window !== undefined
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
  const firstQueryArg = urlParams.get('first') !== null ? Number(urlParams.get('first')) : FIRST_AVATAR_INDEX
  const itemsPerPageQueryArg = urlParams.get('itemsPerPage')

  const initialStartAvatar = firstQueryArg
  const [startAvatar, setStartAvatar] = useState(initialStartAvatar)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageQueryArg ? Number(itemsPerPageQueryArg) : 100)

  const { isConnected, connector } = useAccount()
  const { chain } = useNetwork()

  useEffect(() => setMounted(true), [])
  // useEffect(() => setStartAvatar(initialStartAvatar), [initialStartAvatar, itemsPerPage])

  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'totalSupply',
    args: [],
  }
  const { data, isLoading, isError } = useContractRead(useContractReadParams)
  const totalSupply = isLoading || isError ? 0 : Number(data)

  const handleNext = () => {
    if (totalSupply && startAvatar + itemsPerPage < totalSupply) {
      setStartAvatar(startAvatar + itemsPerPage)
    }
  }

  const handlePrev = () => {
    if (startAvatar - itemsPerPage >= 0) {
      setStartAvatar(startAvatar - itemsPerPage)
    }
  }

  // Define the range of avatars to display
  const avatarsToShow = []
  const endAvatar = Math.min(startAvatar + itemsPerPage, totalSupply)
  for (let i = startAvatar; i < endAvatar; i++) {
    avatarsToShow.push(i)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* <div className={styles.left}>
          {mounted && isConnected && (
            <div>
              <div className={styles.mintTopSpacer}></div>
              <MintView />
            </div>
          )}
        </div>
        <div className={styles.right}> */}

        <ChainConnectedText />
        <h1 className={styles.title}>Browse Avatars</h1>
        {mounted && !isConnected && (
          <div className={styles.connectButtonDiv} style={{ margin: '0 auto' }}>
            <ConnectButton accountStatus="address" chainStatus="none" label="Connect" showBalance={false} />
          </div>
        )}
        {mounted && !isConnected && (
          <p className={styles.subtitle}>Avatars are stored 100% onchain. Please connect wallet to browse.</p>
        )}
        {mounted && isConnected && <p className={styles.subtitle}>Total {totalSupply} avatars minted</p>}
        {mounted && isConnected && (
          <PaginationControls
            first={startAvatar}
            itemsPerPage={itemsPerPage}
            totalSupply={totalSupply}
            onPrev={handlePrev}
            onNext={handleNext}
            onChangeItemsPerPage={setItemsPerPage}
          />
        )}
        {mounted && isConnected && <OnchainAvatarGrid hyperlink={true} sources={avatarsToShow} />}
        {/* </div> */}
      </div>
    </div>
  )
}

export default AvatarsView
