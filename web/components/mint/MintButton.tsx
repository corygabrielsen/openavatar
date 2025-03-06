import { Avatar } from '@openavatar/types'
import React, { useEffect, useState } from 'react'
import { useContractRead, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { getContractConfigs } from '../../abi/ABI'

import styles from '../../styles/mint/MintButton.module.scss'

interface Props {
  avatars: Avatar[]
  onMint: () => void
  onTransactionSigned: () => void
  onTransactionSignatureFailed: () => void
  onTransactionSuccess: () => void
  onTransactionFailed: () => void
  style: React.CSSProperties
}

const DEFAULT_MINT_PRICE = BigInt(100_000_000_000_000_000)

const MintButton = ({
  avatars,
  onMint,
  onTransactionSigned,
  onTransactionSignatureFailed,
  onTransactionFailed,
  onTransactionSuccess,
  style,
}: Props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { chain } = useNetwork()

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    data: getMintPrice,
    isLoading: getMintPriceLoading,
    isError: getMintPriceError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'getMintPrice',
    args: [],
  })

  let args: any = avatars.length > 1 ? [avatars.map((avatar) => avatar.dna.toString())] : [avatars[0].dna.toString()]
  const value: bigint =
    !getMintPriceLoading && !getMintPriceError
      ? (getMintPrice as bigint) * BigInt(avatars.length)
      : DEFAULT_MINT_PRICE * BigInt(avatars.length)

  // https://wagmi.sh/react/prepare-hooks/usePrepareContractWrite
  // Hook for preparing a contract write to be sent via useContractWrite.
  // Eagerly fetches the parameters required for sending a contract write transaction such as the gas estimate.
  const { config } = usePrepareContractWrite({
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: avatars.length > 1 ? 'mintBatch' : 'mint',
    args,
    value,
    enabled: true,
    // Function to invoke when fetching is successful.
    onSuccess(data) {
      console.log('tx prepared:', data)
      console.log('  functionName', data.request.functionName)
      // console.log('  args', data.request.args)
      console.log('  args', data.request.args![0])
      // console.log('  value', data.request.value)
      const value = data.request.value || BigInt(0)
      const divisor = BigInt(10 ** 18)
      const integerPart = value / divisor
      const remainder = value % divisor
      console.log(`  value: ${integerPart}.${remainder.toString().padStart(18, '0').substr(0, 18)} ETH`)
    },
    // Function to invoke when an error is thrown while fetching new data.
    onError(error) {
      // check if error message contains "already minted"
      if (error.message.includes('already minted')) {
        console.warn('Avatar already minted!')
      } else if (error.message.includes('not active')) {
        console.warn('Mint not active!')
      } else {
        console.error('Errored', error)
      }
    },
    // Function to invoke when fetching is settled (either successfully fetched, or an error has thrown).
    onSettled(data, error) {
      // console.log('Settled', { data, error })
    },
  })

  // https://wagmi.sh/react/hooks/useContractWrite
  // Hook for calling a write method on a Contract.
  // This is a wrapper around viem's writeContract.
  const {
    data: mintData,
    write: mintBatch,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(config)

  useEffect(() => {
    if (isMintStarted) {
      // The transaction has been signed and is being sent to the network
      console.log('The transaction has been signed.')
      onTransactionSigned()
      // ...you can trigger other UI updates here...
    }
    if (mintError) {
      console.error('useContractWrite error')
      // The transaction has failed
      console.error('The transaction has failed.')
      onTransactionSignatureFailed()
      // ...you can trigger other UI updates here...
    }
  }, [isMintStarted, mintError, onTransactionSignatureFailed, onTransactionSigned])

  // https://wagmi.sh/react/hooks/useWaitForTransaction
  // Hook for declaratively waiting until transaction is processed.
  // Pairs well with useContractWrite and useSendTransaction.
  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  })
  useEffect(() => {
    if (txSuccess) {
      // The transaction has been successfully mined
      console.log('The transaction has completed successfully.')
      onTransactionSuccess()
      // ...you can trigger other UI updates here...
    }
    if (txError) {
      console.error('useWaitForTransaction error')
      // The transaction has failed
      console.error('The transaction has failed.')
      onTransactionFailed()
      // ...you can trigger other UI updates here...
    }
  }, [onTransactionFailed, onTransactionSuccess, txError, txSuccess])

  const isMinted = txSuccess

  function handleMint() {
    for (let i = 0; i < avatars.length; i++) {
      console.log(`Mint cart avatar #${i + 1}: ${avatars[i].dna.toString()}`)
    }
    onMint()
    mintBatch?.()
  }

  return (
    <div className={styles.container}>
      {/* {mintError && <p style={{ marginTop: 24, color: '#FF6257' }}>Error: {mintError.message}</p>} */}
      {/* {txError && <p style={{ marginTop: 24, color: '#FF6257' }}>Error: {txError.message}</p>} */}
      {!mounted && (
        // for styling purposes display a loading button with same styles as the real button
        // this seems to avoid flashes when the button is rendered
        <button
          className={styles.button}
          disabled={true}
          data-mint-loading={isMintLoading}
          data-mint-started={isMintStarted}
          data-minted={isMinted}
          onClick={handleMint}
          style={style}
        >
          Loading...
        </button>
      )}
      {mounted && (
        <button
          className={styles.button}
          disabled={!mintBatch || isMintLoading || isMintStarted || isMinted}
          data-mint-loading={isMintLoading}
          data-mint-started={isMintStarted}
          data-minted={isMinted}
          onClick={handleMint}
          style={style}
        >
          {isMintLoading && `Signing tx...`}
          {isMintStarted && !isMinted && `Minting...`}
          {!isMintLoading && !isMintStarted && `Mint`}
          {isMinted && `Success!`}
        </button>
      )}
    </div>
  )
}

export default MintButton
