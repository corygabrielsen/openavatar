import { Avatar } from '@openavatar/types'
import React, { useState } from 'react'
import { ColorChangeHandler, ColorResult, PhotoshopPicker } from 'react-color'
import { ProfilePictureSettings } from './ProfilePictureSettings'

interface Props {
  avatar: Avatar
  pfpSettings: ProfilePictureSettings
  handleColorChange: ColorChangeHandler
}

const OffChainAvatarProfilePictureSettings: React.FC<Props> = ({ avatar, pfpSettings, handleColorChange }: Props) => {
  const [color, setColor] = useState(pfpSettings.backgroundColor.replace('0x', ''))

  const changeColor: ColorChangeHandler = (color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(color.hex)
    handleColorChange(color, event)
  }

  return (
    <div style={{ backgroundColor: 'lightgray', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <PhotoshopPicker color={color} onChangeComplete={changeColor} />
      </div>
    </div>
  )
}

export default OffChainAvatarProfilePictureSettings
