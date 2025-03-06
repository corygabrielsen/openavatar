import { Avatar, DNA } from '@openavatar/types'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../abi/ABI'
import styles from '../../styles/avatar/TokenAvatarCard.module.scss'
import AvatarCard from './AvatarCard'

type TokenId = bigint | number

interface Props {
  tokenId: TokenId
  showPfpSettingsControls: boolean
  showDownloadControls: boolean
}

const TokenAvatarCard = ({ tokenId, showPfpSettingsControls, showDownloadControls }: Props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'getDNAByTokenId',
    args: [tokenId],
  }
  const { data, isLoading, isError } = useContractRead(useContractReadParams)

  return (
    <div className={styles.container}>
      {!mounted && <div>Loading...</div>}
      {mounted && isConnected && isLoading && <div>Loading...</div>}
      {mounted && isConnected && !isLoading && isError && <div>Error TokenAvatarCard</div>}
      {mounted && isConnected && !isLoading && !isError && (
        <AvatarCard
          avatar={new Avatar(new DNA(data as unknown as string))}
          showPfpSettingsControls={showPfpSettingsControls}
          showDownloadControls={showDownloadControls}
        />
      )}
      {/* <label className={styles.tokenLabel}>{`#${tokenId}`}</label> */}
    </div>
  )
}

export default TokenAvatarCard
