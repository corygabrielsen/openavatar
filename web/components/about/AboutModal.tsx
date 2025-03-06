import React from 'react'

import { useFeatureFlags } from '../FeatureFlags'
import Modal from '../Modal'
import About from './About'

interface ModalProps {
  show: boolean
  onClose: () => void
}

const AboutModal: React.FC<ModalProps> = ({ show, onClose }) => {
  const featureFlags = useFeatureFlags()
  return (
    <Modal show={show} onClose={onClose}>
      <About showHeader={true} featureFlags={featureFlags} />
    </Modal>
  )
}

export default AboutModal
