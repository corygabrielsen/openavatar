import React from 'react'
import styles from '../../styles/about/Disclaimer.module.scss'

interface Props {
  header?: boolean
}

const Disclaimer: React.FC<Props> = ({ header }) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {header && <p className={styles.label}>Disclaimer</p>}
        <p className={styles.disclaimer}>
          {`${
            header ? '' : 'Disclaimer: '
          }OpenAvatar NFTs are intended for recreational and collectible purposes only and should not be
          considered as an investment opportunity. The acquisition of these NFTs does not grant any ownership or equity
          stake in the project or organization behind it, nor does it confer any rights to revenue sharing, dividends,
          or any other financial benefits. Purchasing an NFT from this project should not be done with the expectation
          of profit.`}
        </p>
      </div>
    </div>
  )
}

export default Disclaimer
