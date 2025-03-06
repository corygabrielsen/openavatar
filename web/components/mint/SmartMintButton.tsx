import { Avatar } from '@openavatar/types'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { Chain, useAccount, useContractRead, useNetwork, useSwitchNetwork } from 'wagmi'
import { getContractConfigs } from '../../abi/ABI'
import styles from '../../styles/mint/SmartMintButton.module.scss'
import { useCountdown } from '../useCountdown'
import { useLaunchDate } from '../useLaunchDate'
import ChainConnectedText from '../utils/ChainConnectedText'
import { HUMAN_READABLE_CHAIN_NAMES } from '../utils/chains'
import MintButton from './MintButton'

const PERMANENTLY_DISABLED = 0
const DISABLED = 1
const ONLY_OWNER = 2
const PUBLIC_PENDING_BLOCK_TIMESTAMP = 3
const PUBLIC = 4

type ChainType = Chain & {
  unsupported?: boolean | undefined
}

const SwitchNetworkButton: React.FC<{
  currentChainId: number
  desiredChainId: number
  rightClickChainId: number
  switchNetwork?: (chainId?: number) => void
}> = ({ currentChainId, desiredChainId, rightClickChainId, switchNetwork }) => {
  const handleClick = () => {
    if (switchNetwork !== undefined) {
      console.debug(`switching network --> ${desiredChainId}`)
      switchNetwork(desiredChainId)
    }
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    console.debug('right click')
    event.preventDefault()
    if (switchNetwork !== undefined) {
      console.debug(`switching network --> ${rightClickChainId}`)
      switchNetwork(rightClickChainId)
    }
  }

  const currentChainName = HUMAN_READABLE_CHAIN_NAMES[currentChainId] || currentChainId.toString()
  return (
    <button
      className={`${styles.button} ${styles.switchNetwork}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {`Switch Network ${currentChainName} --> ${HUMAN_READABLE_CHAIN_NAMES[desiredChainId]}`}
    </button>
  )
}

const MintDisabledButton: React.FC<{ text: string; mintState: any }> = ({ text, mintState }) => {
  // console.debug(text)
  return (
    <button className={styles.button} disabled={true} data-contract-mint-state={mintState}>
      {text}
    </button>
  )
}

interface MintEnabledButtonProps {
  avatars: Avatar[]
  isMintedEach: boolean[]
  mintState: any
  onMint: () => void
  onTransactionSigned: () => void
  onTransactionSignatureFailed: () => void
  onTransactionSuccess: () => void
  onTransactionFailed: () => void
  style: React.CSSProperties
}

const MintEnabledButton: React.FC<MintEnabledButtonProps> = ({
  avatars,
  isMintedEach,
  mintState,
  onMint,
  onTransactionSigned,
  onTransactionSignatureFailed,
  onTransactionSuccess,
  onTransactionFailed,
  style,
}) => {
  // 1. Check if cart has duplicate avatars
  for (let i = 0; i < avatars.length; i++) {
    for (let j = i + 1; j < avatars.length; j++) {
      if (avatars[i].dna.toString() === avatars[j].dna.toString()) {
        const str = `Duplicate avatar #${i + 1} and #${j + 1}. Change your selection.`
        console.debug(str)
        return <MintDisabledButton text={str} mintState={mintState} />
      }
    }
  }

  // 2. Check if cart has already minted avatars
  const mintedIndices = isMintedEach.reduce((acc: number[], isMinted, index) => {
    if (isMinted) {
      acc.push(index)
    }
    return acc
  }, [])
  if (mintedIndices.length > 0) {
    const mintedIndicesAsNiceString = mintedIndices.map((index) => `#${index + 1}`).join(', ')
    const str = `Avatar${
      mintedIndices.length > 1 ? 's' : ''
    } ${mintedIndicesAsNiceString} already minted. Change your selection.`
    console.warn(str)
    return <MintDisabledButton text={str} mintState={mintState} />
  }
  return (
    <MintButton
      avatars={avatars}
      onMint={onMint}
      onTransactionSigned={onTransactionSigned}
      onTransactionSignatureFailed={onTransactionSignatureFailed}
      onTransactionSuccess={onTransactionSuccess}
      onTransactionFailed={onTransactionFailed}
      style={style}
    />
  )
}

const ConnectedChainModal: React.FC<{
  chain?: ChainType
  desiredChainId: number
  rightClickChainId: number
  switchNetwork?: (chainId?: number) => void
}> = ({ chain, desiredChainId, rightClickChainId, switchNetwork }) => {
  const handleClick = () => {
    if (switchNetwork !== undefined) {
      console.debug(`switching network --> ${desiredChainId}`)
      switchNetwork(desiredChainId)
    }
  }
  const handleContextMenu = (event: React.MouseEvent) => {
    console.debug('right click')
    event.preventDefault()
    if (switchNetwork !== undefined) {
      console.debug(`switching network --> ${rightClickChainId}`)
      switchNetwork(rightClickChainId)
    }
  }
  return <ChainConnectedText />
}

interface Props {
  avatars: Avatar[]
  showNetworkText?: boolean
  onMint: () => void
  onTransactionSigned: () => void
  onTransactionSignatureFailed: () => void
  onTransactionSuccess: () => void
  onTransactionFailed: () => void
  style: React.CSSProperties
}

const SmartMintButton: React.FC<Props> = ({
  avatars,
  showNetworkText,
  onMint,
  onTransactionSigned,
  onTransactionSignatureFailed,
  onTransactionSuccess,
  onTransactionFailed,
  style,
}: Props) => {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const desiredChainId = 1
  const devChainId = 1337

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    data: owner,
    isLoading: ownerLoading,
    isError: ownerError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'owner',
    args: [],
  })

  const {
    data: mintState,
    isLoading: getMintStateLoading,
    isError: getMintStateError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'getMintState',
    args: [],
    // Watches and refreshes data for new blocks.
    watch: true,
  })

  const {
    data: isMintedEach,
    isLoading: isMintedEachLoading,
    isError: isMintedEachError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'isMintedEach',
    args: [avatars.map((avatar) => avatar.dna.toString())],
  })

  const {
    data: totalSupply,
    isLoading: totalSupplyLoading,
    isError: totalSupplyError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'totalSupply',
    args: [],
  })

  const {
    data: supplySoftCap,
    isLoading: supplySoftCapLoading,
    isError: supplySoftCapError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'supplySoftCap',
    args: [],
  })

  const {
    data: supplyHardCap,
    isLoading: supplyHardCapLoading,
    isError: supplyHardCapError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'supplyHardCap',
    args: [],
  })

  const isLoading =
    ownerLoading ||
    getMintStateLoading ||
    typeof mintState !== 'number' ||
    isMintedEachLoading ||
    totalSupplyLoading ||
    supplySoftCapLoading ||
    supplyHardCapLoading
  const isError =
    ownerError || getMintStateError || isMintedEachError || totalSupplyError || supplySoftCapError || supplyHardCapError

  const { mintDateUTC } = useLaunchDate()
  const { formattedTime, secondsRemaining } = useCountdown(mintDateUTC)
  const displayCountdown = formattedTime.replace('0d ', '').replace('0h ', '')

  const renderContent = () => {
    // console.log(`SmartMintButton::renderContent(isConnected=${isConnected})`)
    if (!isConnected) {
      return <ConnectButton accountStatus="address" chainStatus="none" label="Connect" showBalance={false} />
    }

    if (chain && chain.id !== desiredChainId && chain.id !== devChainId) {
      return (
        <SwitchNetworkButton
          currentChainId={chain.id}
          desiredChainId={desiredChainId}
          rightClickChainId={devChainId}
          switchNetwork={switchNetwork}
        />
      )
    }
    if (isError) {
      let chainName = chain?.name || 'unknown'
      if (chain?.name === chain?.id && chain?.name === chain?.network && `${chain?.name}` === '1') {
        // seen this on metamask mobile
        chainName = 'Ethereum'
      }
      const msg = `Not Found`
      console.debug(msg, chain)
      return <MintDisabledButton text={msg} mintState={mintState} />
    }

    if (isLoading) {
      // console.debug(`SmartMintButton is loading...`)
      return <MintDisabledButton text="Loading..." mintState={mintState} />
    }

    // console.log('SmartMintButton::renderContent() -- mintState', mintState)
    // console.log('SmartMintButton::renderContent() -- totalSupply', totalSupply)
    if ((totalSupply as bigint) >= (supplySoftCap as bigint)) {
      if ((supplySoftCap as bigint) > BigInt(0)) {
        return <MintDisabledButton text={`Sold out`} mintState={mintState} />
      } else {
        return <MintDisabledButton text="0/0" mintState={mintState} />
      }
    }

    switch (mintState) {
      case PERMANENTLY_DISABLED:
        return <MintDisabledButton text="Mint is permanently disabled." mintState={mintState} />
      case DISABLED:
        return <MintDisabledButton text="Mint disabled" mintState={mintState} />
      case ONLY_OWNER:
        // check if we are the owner of the contract?
        if (owner === address) {
          return (
            <>
              <label>ONLY_OWNER</label>
              <br />
              <label>Total Supply: {(totalSupply as BigInt).toString()}</label>
              <br />
              <label>Supply Soft Cap: {supplySoftCap as number}</label>
              <br />
              <label>Supply Hard Cap: {supplyHardCap as number}</label>
              <br />
              <MintEnabledButton
                avatars={avatars}
                isMintedEach={isMintedEach as boolean[]}
                mintState={mintState}
                onMint={onMint}
                onTransactionSigned={onTransactionSigned}
                onTransactionSignatureFailed={onTransactionSignatureFailed}
                onTransactionSuccess={onTransactionSuccess}
                onTransactionFailed={onTransactionFailed}
                style={style}
              />
            </>
          )
        } else if (secondsRemaining >= 0) {
          return <MintDisabledButton text={`Mint opens ${displayCountdown}`} mintState={mintState} />
        } else {
          return <MintDisabledButton text="Pending launch..." mintState={mintState} />
        }
      // fall-through
      case PUBLIC:
        if (secondsRemaining > 0) {
          return <MintDisabledButton text={`Mint opens ${displayCountdown}`} mintState={mintState} />
        }
        if (isMintedEachLoading) {
          return <MintDisabledButton text="Checking available avatars..." mintState={mintState} />
        }
        if (isMintedEachError) {
          return <MintDisabledButton text="Error #103 please check connection" mintState={mintState} />
        }

        return (
          <MintEnabledButton
            avatars={avatars}
            isMintedEach={isMintedEach as boolean[]}
            mintState={mintState}
            onMint={onMint}
            onTransactionSigned={onTransactionSigned}
            onTransactionSignatureFailed={onTransactionSignatureFailed}
            onTransactionSuccess={onTransactionSuccess}
            onTransactionFailed={onTransactionFailed}
            style={style}
          />
        )
      default:
        return <MintDisabledButton text={`Unexpected mint state: ${mintState}`} mintState={mintState} />
    }
  }

  return (
    <div className={styles.container}>
      {mounted && (
        <div className={styles.ifMountedContainer}>
          {showNetworkText && (
            <ConnectedChainModal
              chain={chain}
              desiredChainId={desiredChainId}
              rightClickChainId={devChainId}
              switchNetwork={switchNetwork}
            />
          )}
          <div className={styles.buttonContainer}>{renderContent()}</div>
        </div>
      )}
    </div>
  )
}

export default SmartMintButton
