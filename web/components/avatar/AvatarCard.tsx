import { Avatar } from '@openavatar/types'
import React, { useEffect, useState } from 'react'

import { PNG, PNGData } from '@openavatar/assets'
import Link from 'next/link'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../abi/ABI'
import styles from '../../styles/avatar/AvatarCard.module.scss'
import OnChainAvatarProfilePictureSettings from './pfp/OnChainAvatarProfilePictureSettings'
import { ProfilePictureSettings } from './pfp/ProfilePictureSettings'
import AvatarTokenProperties from './properties/AvatarTokenProperties'
import AvatarSpriteRender from './sprite/AvatarSpriteRender'
import { useAvatarSVG } from './sprite/useAvatarSVG'
import AvatarTextRecords from './text/AvatarTextRecordsView'

interface AvatarCardProps {
  avatar: Avatar
  showPfpSettingsControls: boolean
  showDownloadControls: boolean
}

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, showPfpSettingsControls, showDownloadControls }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const urlParams =
    typeof window !== 'undefined' && window !== undefined
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
  const isAdmin = urlParams.get('admin') === 'true'

  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()

  const {
    data: response__ownerOfDNA,
    isLoading,
    isError,
  } = useContractRead({
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'ownerOfDNA',
    args: [avatar.dna.toString()],
  })
  const avatarOwner: `0x${string}` | undefined = response__ownerOfDNA as `0x${string}` | undefined

  const connectedAccountIsOwnerOfAvatar = avatarOwner === address

  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'openAvatarURI',
    args: [avatar.dna.toString()],
  }
  const { data: openAvatarURI, isLoading: getDNALoading, isError: getDNAError } = useContractRead(useContractReadParams)

  const {
    data: onChainBackgroundColor,
    isLoading: isLoading2,
    isError: isError2,
  } = useContractRead({
    ...getContractConfigs(chain).OpenAvatarGen0TextRecords,
    functionName: 'text',
    args: [avatar.dna.toString(), 'gen0.renderer.pfp.background-color'],
  })

  const {
    data: onChainDisplay,
    isLoading: isLoading3,
    isError: isError3,
  } = useContractRead({
    ...getContractConfigs(chain).OpenAvatarGen0TextRecords,
    functionName: 'text',
    args: [avatar.dna.toString(), 'gen0.renderer.pfp.mask'],
  })

  const {
    data: onChainRendererKey,
    isLoading: isLoading4,
    isError: isError4,
  } = useContractRead({
    ...getContractConfigs(chain).OpenAvatarGen0TextRecords,
    functionName: 'text',
    args: [avatar.dna.toString(), 'gen0.renderer'],
  })

  const [pfpSettings, setProfilePictureSettings] = useState<ProfilePictureSettings | undefined>(undefined)
  const [expandPfpSettingsControls, setExpandPfpSettingsControls] = useState(false)

  const { render, isLoading: isSVGLoading, isError: isSVGError } = useAvatarSVG(avatar, pfpSettings)

  function upscale(buffer: Uint8Array, params: { width: number; height: number; alpha: boolean; scale: number }) {
    const scaleWidth = params.width * params.scale
    const scaleHeight = params.height * params.scale
    const scaledBuffer: Uint8Array = new Uint8Array(scaleWidth * scaleHeight * (params.alpha ? 4 : 3))
    for (let y = 0; y < scaleHeight; y++) {
      for (let x = 0; x < scaleWidth; x++) {
        const scaledIndex = (y * scaleWidth + x) * 4
        const index = (Math.floor(y / params.scale) * params.width + Math.floor(x / params.scale)) * 4
        scaledBuffer[scaledIndex] = buffer[index]
        scaledBuffer[scaledIndex + 1] = buffer[index + 1]
        scaledBuffer[scaledIndex + 2] = buffer[index + 2]
        if (params.alpha) scaledBuffer[scaledIndex + 3] = buffer[index + 3]
      }
    }
    return scaledBuffer
  }

  async function downloadAvatar(avatar: Avatar, scale: number) {
    const width = 32
    const height = 32
    const alpha = true

    if (render) {
      const png: Buffer = render.getPNG()

      // decode
      const decoded: PNGData = PNG.decode(png)
      const buffer: Uint8Array = decoded.data
      // buffer should be 32x32x4
      if (buffer.length !== width * height * 4) {
        console.error('buffer is not 32x32x4')
        return
      }

      // upscale with nearest neighbor using handwritten forloop
      const scaledBuffer: Uint8Array = upscale(buffer, { width, height, alpha, scale })

      // re-encoded as PNG
      const scaledPNG: Uint8Array = PNG.encode(scaledBuffer, width * scale, height * scale, alpha)

      const uri: string = `data:image/png;base64,${Buffer.from(scaledPNG).toString('base64')}`
      console.log('uri', uri)

      // download the image
      const link = document.createElement('a')
      link.href = uri
      link.download = `${avatar.dna.toString()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // to open in a new tab instead of downloading:
      // window.open(uri)

      // TODO deal with decoding and resizing
    }
  }

  return (
    <div className={styles.container2}>
      <div className={styles.container}>
        <div className={styles.spriteContainer}>
          <div className={styles.sprite512x512}>
            <AvatarSpriteRender source={avatar} render="onchain" height={512} width={512} pfpSettings={pfpSettings} />
          </div>
          <div className={styles.sprite384x384}>
            <AvatarSpriteRender source={avatar} render="onchain" height={384} width={384} pfpSettings={pfpSettings} />
          </div>
          <div className={styles.sprite256x256}>
            <AvatarSpriteRender source={avatar} render="onchain" height={256} width={256} pfpSettings={pfpSettings} />
          </div>

          <div className={`${styles.textRecords}`}>
            {mounted && isConnected && !isLoading && !isError && (
              <AvatarTextRecords
                title="Text Records"
                records={{
                  'gen0.renderer': onChainRendererKey as unknown as string,
                  'gen0.renderer.pfp.background-color': onChainBackgroundColor as unknown as string,
                  'gen0.renderer.pfp.mask': onChainDisplay as unknown as string,
                }}
              />
            )}
          </div>

          {/* Button for toggling settings */}
          {!mounted && <div className={styles.showSettingsButton}>Loading...</div>}
          {mounted && !isConnected && <div className={styles.showSettingsButton}>Connect Wallet</div>}
          {mounted && isConnected && (isLoading || isLoading3) && (
            <div className={styles.showSettingsButton}>Loading...</div>
          )}
          {mounted && isConnected && !(isLoading || isLoading3 || isLoading4) && (isError || isError3 || isError4) && (
            <div className={styles.showSettingsButton}>Error loading pfp settings from chain</div>
          )}
        </div>
        <div className={styles.propertiesContainer}>
          <AvatarTokenProperties avatar={avatar} />

          <div className={styles.textRecords}>
            {mounted && isConnected && !isLoading && !isError && (
              <AvatarTextRecords
                title="Text Records"
                records={{
                  'gen0.renderer': onChainRendererKey as unknown as string,
                  'gen0.renderer.pfp.background-color': onChainBackgroundColor as unknown as string,
                  'gen0.renderer.pfp.mask': onChainDisplay as unknown as string,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {connectedAccountIsOwnerOfAvatar && (
        <>
          {showPfpSettingsControls && (
            <div className={styles.pfpSettings}>
              <OnChainAvatarProfilePictureSettings
                avatar={avatar}
                showControls={expandPfpSettingsControls}
                onClickControls={setExpandPfpSettingsControls}
                pfpSettings={pfpSettings}
                onChangePfpSettings={setProfilePictureSettings}
              />
            </div>
          )}
          {showDownloadControls && (
            <div className={styles.downloadBar}>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 1)}>
                32x32
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 2)}>
                64x64
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 3)}>
                96x96
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 4)}>
                128x128
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 8)}>
                256x256
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 10)}>
                320x320
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 12)}>
                384x384
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 13)}>
                416x416
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 14)}>
                448x448
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 15)}>
                480x480
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 16)}>
                512x512
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 20)}>
                640x640
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 24)}>
                768x768
              </button>
              <button className={styles.downloadButton} onClick={() => downloadAvatar(avatar, 32)}>
                1024x1024
              </button>
            </div>
          )}
        </>
      )}

      {/* {!connectedAccountIsOwnerOfAvatar && (
        <>
          <p>pfp editor restricted to owner</p>
          {openAvatarURI !== undefined && (
            <p>
              View on{' '}
              <a
                href={`https://opensea.io/assets/${getContractConfigs(chain).OpenAvatarGen0Token.address}/${
                  decodeOpenAvatarURI(openAvatarURI as unknown as any).token_id
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenSea
              </a>
            </p>
          )}
        </>
      )} */}

      {isAdmin && (
        <div>
          <Link
            href={`/mint?admin=true&dna=${avatar.dna.toString()}&password=0x0000000000000138Bd6bd34CF4A3905576f58e25&reveal=2000-01-01T12:00Z`}
            target="_blank"
            rel="noopener noreferrer"
            passHref
          >
            <button className={`${styles.downloadButton} ${styles.mintFromButton}`}>Mint From</button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default AvatarCard
