import React from 'react'
import styles from '../../styles/maker/LabeledHr.module.scss'

interface Props {
  label: string
}

const LabeledHr: React.FC<Props> = ({ label }) => {
  return (
    <div className={styles.hrContainer}>
      <hr className={styles.hr} />
      <h2 className={styles.hrLabel}>{label}</h2>
      <hr className={styles.hr} />
    </div>
  )
}

export default LabeledHr
