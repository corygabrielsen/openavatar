import React from 'react'
import style from '../../styles/ui/FloatingButton.module.scss'

interface Props {
  onClick: () => void
  disabled?: boolean
  text: string
}

const FloatingButton: React.FC<Props> = ({ onClick, disabled, text }) => {
  return (
    <button
      className={`${style.floatingButton} ${disabled ? style.disabled : ''}`}
      disabled={disabled || false}
      onClick={onClick}
    >
      {text}
    </button>
  )
}

export default FloatingButton
