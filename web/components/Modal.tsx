import React from 'react'
import styles from '../styles/Modal.module.scss'

interface ModalProps {
  show: boolean
  children: React.ReactNode
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ show, children, onClose }) => {
  if (!show) {
    return null
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={onClose}>
        {children}
      </div>
    </div>
  )
}

export default Modal
