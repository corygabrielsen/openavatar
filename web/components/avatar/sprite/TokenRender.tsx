import { Avatar, DNA } from '@openavatar/types'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../../abi/ABI'
import styles from '../../../styles/avatar/sprite/TokenRender.module.scss'
import AvatarRender from './AvatarProfilePictureRender'

type TokenId = bigint | number

interface Props {
  tokenId: TokenId
  height?: number
  width?: number
  onClick?: (avatar: Avatar) => void
}

const TokenRender = ({ tokenId, height, width, onClick }: Props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'getDNAByTokenId',
    args: [tokenId],
  }
  const { data: getDNAResult, isLoading: getDNALoading, isError: getDNAError } = useContractRead(useContractReadParams)
  // if (getDNALoading) {
  //   console.warn('loading', getDNALoading)
  // }
  // if (getDNAError) {
  //   console.error('error', getDNAError)
  // }

  const onClickSafe = () => {
    if (getDNALoading || getDNAError) {
      return
    }
    if (onClick) {
      onClick(new Avatar(new DNA(getDNAResult as unknown as string)))
    }
  }

  const renderAvatar = () => {
    if (getDNALoading) {
      return (
        <div
          style={{
            position: 'relative',
            height: `${height}px`,
            width: `${width}px`,
          }}
        >
          <AvatarRender avatar={new Avatar(DNA.ZERO)} height={height} width={width} />
          {/* floating label for loading */}
          <svg className={styles.spinner} viewBox="0 0 50 50">
            <circle className={styles.path} cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
        </div>
      )
    }
    if (getDNAError) {
      return (
        <div
          style={{
            position: 'relative',
            height: `${height}px`,
            width: `${width}px`,
          }}
        >
          <AvatarRender avatar={new Avatar(DNA.ZERO)} height={height} width={width} />
          {/* floating label for loading */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'red',
              fontSize: '1em',
              fontWeight: 'bold',
              textAlign: 'center',
              // textShadow: '0 0 0.5em black',
            }}
          >
            Error check connection
          </div>
        </div>
      )
    }

    const dna: DNA = new DNA(getDNAResult as unknown as string)
    try {
      const avatar: Avatar = new Avatar(dna)
      return (
        // <Link href={`/avatar?dna=${avatar.dna.toString()}`}>
        <AvatarRender avatar={avatar} height={height} width={width} />
        // </Link>
      )
    } catch (e) {
      console.error(e)
      return <p>E ror rendering</p>
    }
  }

  return (
    <div className={styles.container} onClick={() => onClickSafe()}>
      {mounted && isConnected && renderAvatar()}
      {/* <label className={styles.tokenLabel}>{`#${tokenId}`}</label> */}
    </div>
  )
}

export default TokenRender
