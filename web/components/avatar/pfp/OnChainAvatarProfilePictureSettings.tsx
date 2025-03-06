import { Avatar } from '@openavatar/types'
import React, { useEffect, useState } from 'react'
import { ColorResult } from 'react-color'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../../abi/ABI'
import styles from '../../../styles/avatar/pfp/OnChainAvatarProfilePictureSettings.module.scss'
import AvatarSpriteRender from '../sprite/AvatarSpriteRender'
import OffChainAvatarProfilePictureSettings from './OffChainAvatarProfilePictureSettings'
import { ProfilePictureSettings } from './ProfilePictureSettings'
import SetProfilePictureSettingsButton from './SetProfilePictureSettingsButton'

interface Props {
  avatar: Avatar
  showControls: boolean
  onClickControls: (showControls: boolean) => void
  pfpSettings?: ProfilePictureSettings
  onChangePfpSettings: (pfpSettings: ProfilePictureSettings) => void
}

enum SpritePreview {
  Body_NoBackground = 'Body_NoBackground',
  Body_WithBackground = 'Body_WithBackground',
  Head_NoBackground = 'Head_NoBackground',
  Head_WithBackground = 'Head_WithBackground',
}

interface ClickableSpriteProps {
  selected: boolean
  selectedSprite?: SpritePreview
  spritePreview: SpritePreview
  onClick: () => void
  pfpSettings: ProfilePictureSettings
  source: Avatar
}

const ClickableSprite: React.FC<ClickableSpriteProps> = ({
  selected,
  selectedSprite,
  spritePreview,
  onClick,
  pfpSettings,
  source,
}) => {
  return (
    <div
      className={`${styles.clickablePfpSprite} ${selected ? `${styles.selected}` : ''}`}
      onClick={onClick}
      data-debug="debug"
      data-selected-sprite={selectedSprite}
      data-sprite-preview={spritePreview}
    >
      <AvatarSpriteRender source={source} render="onchain" height={64} width={64} pfpSettings={pfpSettings} />
    </div>
  )
}

interface ProfilePictureSettingsResponse {
  overrideBackground: boolean
  backgroundColor: string
  maskBelowTheNeck: boolean
}

const OnChainAvatarProfilePictureSettings: React.FC<Props> = ({
  avatar,
  showControls,
  onClickControls,
  pfpSettings,
  onChangePfpSettings,
}: Props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0ProfilePictureRenderer,
    functionName: 'getProfilePictureSettings',
    args: [avatar.dna.toString()],
  }
  const { data, isLoading, isError } = useContractRead(useContractReadParams)

  let onChainPfpSettings: ProfilePictureSettings | undefined = undefined
  if (!isLoading && !isError && data) {
    const result: ProfilePictureSettingsResponse = data as unknown as ProfilePictureSettingsResponse
    onChainPfpSettings = {
      overrideBackground: result.overrideBackground,
      backgroundColor: result.backgroundColor.replace('0x', '#') as `#${string}`,
      maskBelowTheNeck: result.maskBelowTheNeck,
    }
  }

  let givenSpritePreview: SpritePreview | undefined = undefined
  if (pfpSettings !== undefined) {
    givenSpritePreview = pfpSettings?.overrideBackground
      ? pfpSettings?.maskBelowTheNeck
        ? SpritePreview.Head_WithBackground
        : SpritePreview.Body_WithBackground
      : pfpSettings?.maskBelowTheNeck
      ? SpritePreview.Head_NoBackground
      : SpritePreview.Body_NoBackground
  }
  let onChainSpritePreview: SpritePreview | undefined = undefined
  if (onChainPfpSettings !== undefined) {
    onChainSpritePreview = onChainPfpSettings?.overrideBackground
      ? onChainPfpSettings?.maskBelowTheNeck
        ? SpritePreview.Head_WithBackground
        : SpritePreview.Body_WithBackground
      : onChainPfpSettings?.maskBelowTheNeck
      ? SpritePreview.Head_NoBackground
      : SpritePreview.Body_NoBackground
  }

  const [selectedSprite, setSelectedSprite] = useState<SpritePreview | undefined>(
    givenSpritePreview || onChainSpritePreview || undefined
  )
  if (selectedSprite === undefined) {
    if (givenSpritePreview) {
      setSelectedSprite(givenSpritePreview)
    } else if (onChainSpritePreview) {
      setSelectedSprite(onChainSpritePreview)
    }
  }

  const handleClickSprite = (sprite: SpritePreview, newPfpSettings: ProfilePictureSettings) => {
    setSelectedSprite(sprite)
    onChangePfpSettings(newPfpSettings)
  }

  function onColorChange(color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) {
    console.log('color change', color)
    onChangePfpSettings({
      overrideBackground: pfpSettings?.overrideBackground || false,
      backgroundColor: color.hex as `#${string}`,
      maskBelowTheNeck: pfpSettings?.maskBelowTheNeck || false,
    })
  }

  const isChangeQueued =
    selectedSprite !== undefined &&
    selectedSprite === givenSpritePreview &&
    (pfpSettings?.overrideBackground !== onChainPfpSettings?.overrideBackground ||
      pfpSettings?.backgroundColor !== onChainPfpSettings?.backgroundColor ||
      pfpSettings?.maskBelowTheNeck !== onChainPfpSettings?.maskBelowTheNeck)

  return (
    <div className={styles.container}>
      {mounted && !isLoading && !isError && (
        <button className={styles.showSettingsButton} onClick={() => onClickControls(!showControls)}>
          {showControls ? 'Hide Settings' : 'Edit Profile Picture'}
        </button>
      )}
      {mounted && !isLoading && !isError && showControls && (
        <div>
          <div className={styles.topBar}>
            <div className={styles.pfpBodyHeadChooser}>
              <ClickableSprite
                selected={selectedSprite === SpritePreview.Body_NoBackground}
                selectedSprite={selectedSprite}
                spritePreview={SpritePreview.Body_NoBackground}
                onClick={() =>
                  handleClickSprite(SpritePreview.Body_NoBackground, {
                    overrideBackground: false,
                    backgroundColor: pfpSettings?.backgroundColor || '#000000',
                    maskBelowTheNeck: false,
                  })
                }
                pfpSettings={{
                  overrideBackground: false,
                  backgroundColor: pfpSettings?.backgroundColor || '#000000',
                  maskBelowTheNeck: false,
                }}
                source={avatar}
              />
              <ClickableSprite
                selected={selectedSprite === SpritePreview.Head_NoBackground}
                selectedSprite={selectedSprite}
                spritePreview={SpritePreview.Head_NoBackground}
                onClick={() =>
                  handleClickSprite(SpritePreview.Head_NoBackground, {
                    overrideBackground: false,
                    backgroundColor: pfpSettings?.backgroundColor || '#000000',
                    maskBelowTheNeck: true,
                  })
                }
                pfpSettings={{
                  overrideBackground: false,
                  backgroundColor: pfpSettings?.backgroundColor || '#000000',
                  maskBelowTheNeck: true,
                }}
                source={avatar}
              />
              <ClickableSprite
                selected={selectedSprite === SpritePreview.Body_WithBackground}
                selectedSprite={selectedSprite}
                spritePreview={SpritePreview.Body_WithBackground}
                onClick={() =>
                  handleClickSprite(SpritePreview.Body_WithBackground, {
                    overrideBackground: true,
                    backgroundColor: pfpSettings?.backgroundColor || onChainPfpSettings?.backgroundColor || '#000000',
                    maskBelowTheNeck: false,
                  })
                }
                pfpSettings={{
                  overrideBackground: true,
                  backgroundColor: pfpSettings?.backgroundColor || onChainPfpSettings?.backgroundColor || '#000000',
                  maskBelowTheNeck: false,
                }}
                source={avatar}
              />
              <ClickableSprite
                selected={selectedSprite === SpritePreview.Head_WithBackground}
                selectedSprite={selectedSprite}
                spritePreview={SpritePreview.Head_WithBackground}
                onClick={() =>
                  handleClickSprite(SpritePreview.Head_WithBackground, {
                    overrideBackground: true,
                    backgroundColor: pfpSettings?.backgroundColor || onChainPfpSettings?.backgroundColor || '#000000',
                    maskBelowTheNeck: true,
                  })
                }
                pfpSettings={{
                  overrideBackground: true,
                  backgroundColor: pfpSettings?.backgroundColor || onChainPfpSettings?.backgroundColor || '#000000',
                  maskBelowTheNeck: true,
                }}
                source={avatar}
              />
            </div>
            {isChangeQueued && onChainPfpSettings !== undefined && (
              <button
                className={styles.resetPfpSettingsButton}
                onClick={() => onChangePfpSettings(onChainPfpSettings!)}
              >
                ✕
              </button>
            )}
            <div className={styles.setPfpSettingsButton}>
              <SetProfilePictureSettingsButton
                avatar={avatar}
                pfpSettings={pfpSettings}
                disabled={!isChangeQueued}
                disabledText={!isChangeQueued ? 'Onchain' : ''}
              />
            </div>
          </div>

          {mounted && isConnected && isLoading && <div>Loading...</div>}
          {mounted && isConnected && !isLoading && isError && <div>Error fetching profile picture settings</div>}
          {mounted && isConnected && !isLoading && !isError && onChainPfpSettings && (
            <OffChainAvatarProfilePictureSettings
              avatar={avatar}
              pfpSettings={onChainPfpSettings}
              handleColorChange={onColorChange}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default OnChainAvatarProfilePictureSettings
