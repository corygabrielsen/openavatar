import { useEffect, useState } from 'react'
import { useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { getContractConfigs } from '../../../abi/ABI'

import { Avatar } from '@openavatar/types'
import styles from '../../../styles/avatar/pfp/SetProfilePictureSettingsButton.module.scss'
import { ProfilePictureSettings } from './ProfilePictureSettings'

interface Props {
  avatar: Avatar
  pfpSettings?: ProfilePictureSettings
  disabled?: boolean
  disabledText?: string
}

const SetProfilePictureSettingsButton = ({ avatar, pfpSettings, disabled, disabledText }: Props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { chain } = useNetwork()

  let params: any = [
    avatar.dna.toString(),
    'gen0.renderer.pfp.background-color',
    pfpSettings?.backgroundColor,
    'gen0.renderer.pfp.mask',
    pfpSettings?.maskBelowTheNeck ? 'below-the-neck' : '',
  ]
  // https://wagmi.sh/react/prepare-hooks/usePrepareContractWrite
  // Hook for preparing a contract write to be sent via useContractWrite.
  // Eagerly fetches the parameters required for sending a contract write transaction such as the gas estimate.
  const { config } = usePrepareContractWrite({
    ...getContractConfigs(chain).OpenAvatarGen0TextRecords,
    functionName: 'setText2',
    args: params,
    enabled: pfpSettings !== undefined,
    // Function to invoke when fetching is successful.
    onSuccess(data) {
      console.log('estimateGas OpenAvatarGen0TextRecords', getContractConfigs(chain).OpenAvatarGen0TextRecords.address)
      console.log('estimateGas setText2', params)
    },
    // Function to invoke when an error is thrown while fetching new data.
    onError(error) {
      console.error('setText2', params)
      console.error('Errored', error)
    },
    // Function to invoke when fetching is settled (either successfully fetched, or an error has thrown).
    onSettled(data, error) {
      // console.log('Settled', { data, error })
    },
  })

  // https://wagmi.sh/react/hooks/useContractWrite
  // Hook for calling a write method on a Contract.
  // This is a wrapper around viem's writeContract.
  //
  // Pairs with the usePrepareContractWrite hook.
  const { data, write, isLoading, isSuccess, error } = useContractWrite(config)

  // https://wagmi.sh/react/hooks/useWaitForTransaction
  // Hook for declaratively waiting until transaction is processed.
  //
  // This is a wrapper around viem's waitForTransactionReceipt.
  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: data?.hash,
    // Function to invoke when fetching is successful.
    onSuccess(data) {
      console.log('success setText2', params)
      console.log('success', data)
    },
  })

  function handleSetProfilePictureSettings() {
    console.log('handleSetProfilePictureSettings', params)
    write?.()
  }

  const isDisabled = disabled || !write || isLoading || isSuccess || txSuccess

  const dynamicButtonStyle = {
    backgroundColor: disabled ? 'transparent' : undefined,
    color: disabled ? '#333' : undefined,
  }

  return (
    <div className={styles.container}>
      {/* {mintError && <p style={{ marginTop: 24, color: '#FF6257' }}>Error: {mintError.message}</p>} */}
      {/* {txError && <p style={{ marginTop: 24, color: '#FF6257' }}>Error: {txError.message}</p>} */}
      {!mounted && (
        // for styling purposes display a loading button with same styles as the real button
        // this seems to avoid flashes when the button is rendered
        <button className={styles.button} style={dynamicButtonStyle} disabled={true}>
          Loading...
        </button>
      )}
      {mounted && (
        <button
          className={styles.button}
          style={dynamicButtonStyle}
          disabled={isDisabled}
          data-not-write={!write}
          data-is-loading={isLoading}
          data-is-success={isSuccess}
          data-tx-success={txSuccess}
          onClick={handleSetProfilePictureSettings}
        >
          {isLoading && `Signing tx...`}
          {isSuccess && !txSuccess && `Confirming tx...`}
          {!isLoading && !isSuccess && disabled && disabledText}
          {!isLoading && !isSuccess && !disabled && `Set Onchain`}
          {txSuccess && `Success!`}
        </button>
      )}
    </div>
  )
}

export default SetProfilePictureSettingsButton
