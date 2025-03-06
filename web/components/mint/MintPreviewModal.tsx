import React from 'react'

import { Avatar } from '@openavatar/types'
import Modal from '../Modal'

import styles from '../../styles/mint/MintPreviewModal.module.scss'
import Disclaimer from '../about/Disclaimer'
import OnchainAvatarGrid from '../avatar/OnchainAvatarGrid'

interface Props {
  avatars: Avatar[]
}

const Content: React.FC<Props> = ({ avatars }) => {
  const callToAction = avatars.length > 1 ? 'Mint your squad' : 'Mint your avatar'
  // const priceText: string = (avatars.length > 1) ? '0.1 ETH per avatar' : '0.1 ETH';
  return (
    <div className={styles.content}>
      <h2 className={styles.title}>{callToAction}</h2>
      <h3 className={styles.subtitle}>Confirm transaction in your wallet.</h3>
      <h4 className={styles.disclaimer}>All purchases are final.</h4>
      <div className={styles.avatars}>
        <OnchainAvatarGrid
          hyperlink={false}
          sources={avatars}
          gridTemplateColumns={`repeat(${Math.min(5, avatars.length)}, 1fr)`}
        />
      </div>
      <h4 className={styles.subsubtitle}>Your legend awaits.</h4>
      {/* <Toast text={priceText} /> */}
      <div className={styles.disclaimerpara}>
        <Disclaimer />
      </div>
    </div>
  )
}

interface ModalProps {
  avatars: Avatar[]
  show: boolean
  onClose: () => void
}

const MintPreviewModal: React.FC<ModalProps> = ({ avatars, show, onClose }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <Content avatars={avatars} />
    </Modal>
  )
}

export default MintPreviewModal
