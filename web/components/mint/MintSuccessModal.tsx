import React from 'react'

import { Avatar } from '@openavatar/types'
import Modal from '../Modal'

import Link from 'next/link'
import styles from '../../styles/mint/MintSuccessModal.module.scss'
import OnchainAvatarGrid from '../avatar/OnchainAvatarGrid'

interface Props {
  avatars: Avatar[]
}

const Content: React.FC<Props> = ({ avatars }) => {
  // const callToAction = avatars.length > 1 ? '' : 'Mint your avatar'
  // const priceText: string = (avatars.length > 1) ? '0.1 ETH per avatar' : '0.1 ETH';
  return (
    <div className={styles.content}>
      <h2 className={styles.title}>Mint success!</h2>
      <Link href="/wallet" as="/wallet">
        <button className={styles.button}>View in wallet</button>
      </Link>
      {/* <h3 className={styles.subtitle}>Confirm transaction in your wallet.</h3> */}
      <div className={styles.avatars}>
        <OnchainAvatarGrid
          hyperlink={false}
          sources={avatars}
          gridTemplateColumns={`repeat(${Math.min(5, avatars.length)}, 1fr)`}
        />
      </div>
      <h4 className={styles.subsubtitle}>Your legend awaits.</h4>
    </div>
  )
}

interface ModalProps {
  avatars: Avatar[]
  show: boolean
  onClose: () => void
}

const MintSuccessModal: React.FC<ModalProps> = ({ avatars, show, onClose }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <Content avatars={avatars} />
    </Modal>
  )
}

export default MintSuccessModal
