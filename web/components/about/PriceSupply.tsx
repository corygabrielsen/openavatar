import React from 'react'
import styles from '../../styles/about/PriceSupply.module.scss'

const PriceSupply: React.FC = () => (
  <div className={styles.container}>
    <div className={styles.row}>
      <div className={styles.label}>Mint price</div>
      <div className={styles.value}>0.1 ETH</div>
    </div>
    <div className={styles.row}>
      <div className={styles.label}>Available supply</div>
      <div className={styles.value}>8,192</div>
    </div>
    <div className={styles.row}>
      <div className={styles.label}>&nbsp;</div>
      <div className={styles.value}>&nbsp;</div>
    </div>
    <div className={styles.row}>
      <div className={styles.label}>Total supply (8,192 reserved for future)</div>
      <div className={styles.value}>16,384</div>
    </div>
  </div>
)

export default PriceSupply
