import { useEffect, useState } from 'react'

import { ChainConfig, ChainConstants, ChainFormatters } from 'viem/dist/types/types/chain'
import { useAccount, useNetwork } from 'wagmi'
import { Deployable, getContractConfigs } from '../../abi/ABI'
import styles from '../../styles/contracts/ContractsView.module.scss'
import ChainConnectedText from '../utils/ChainConnectedText'

const getEtherscanPrefix = (
  chain: (ChainConstants & ChainConfig<ChainFormatters | undefined> & { unsupported?: boolean | undefined }) | undefined
) => {
  if (chain === undefined || chain.id === 1) {
    return 'https://etherscan.io/address/'
  }
  switch (chain.name.toLowerCase()) {
    case 'mainnet':
      return 'https://etherscan.io/address/'
    case 'ropsten':
      return 'https://ropsten.etherscan.io/address/'
    case 'rinkeby':
      return 'https://rinkeby.etherscan.io/address/'
    case 'kovan':
      return 'https://kovan.etherscan.io/address/'
    case 'goerli':
      return 'https://goerli.etherscan.io/address/'
    case 'sepolia':
      return 'https://sepolia.etherscan.io/address/'
    // ... Add other networks as needed
    default:
      return 'https://etherscan.io/address/'
  }
}

interface Props {
  token?: boolean
  textRecords?: boolean
  rendererRegistry?: boolean
  renderer?: boolean
  profilePictureRenderer?: boolean
  assets?: boolean
}

/*
 * The ContractsView is responsible for showing a table with all the
 * smart contracts for the project.
 */
const ContractsView: React.FC<Props> = ({
  token,
  textRecords,
  rendererRegistry,
  renderer,
  profilePictureRenderer,
  assets,
}) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected, connector } = useAccount()
  const { chain } = useNetwork()

  const display = [
    Deployable.OpenAvatarGen0Token,
    Deployable.OpenAvatarGen0TextRecords,
    Deployable.OpenAvatarGen0RendererRegistry,
    Deployable.OpenAvatarGen0Renderer,
    Deployable.OpenAvatarGen0ProfilePictureRenderer,
    Deployable.OpenAvatarGen0Assets,
  ]

  const makeRow = (deployable: Deployable) => {
    const address: `0x${string}` | 'N/A' = getContractConfigs(chain)[deployable]?.address || 'N/A'
    const etherscanLink = `${getEtherscanPrefix(chain)}${address}`

    return (
      <div className={styles.row} key={deployable}>
        <div className={styles.contractName}>{deployable}</div>
        {address.startsWith('0x') ? (
          <div className={styles.address}>
            <a href={etherscanLink} target="_blank" rel="noopener noreferrer">
              {address}
            </a>
          </div>
        ) : (
          <div className={styles.address}>{address}</div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ChainConnectedText />
      {/* {token && <p style={{ textAlign: 'center' }}>Please use website to mint.</p>} */}
      {token && makeRow(Deployable.OpenAvatarGen0Token)}
      {textRecords && makeRow(Deployable.OpenAvatarGen0TextRecords)}
      {rendererRegistry && makeRow(Deployable.OpenAvatarGen0RendererRegistry)}
      {renderer && makeRow(Deployable.OpenAvatarGen0Renderer)}
      {profilePictureRenderer && makeRow(Deployable.OpenAvatarGen0ProfilePictureRenderer)}
      {assets && makeRow(Deployable.OpenAvatarGen0Assets)}
    </div>
  )
}

export default ContractsView
