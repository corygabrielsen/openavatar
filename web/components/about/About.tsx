import { Avatar } from '@openavatar/types'
import React from 'react'
import styles from '../../styles/about/About.module.scss'
import { FeatureFlags } from '../FeatureFlags'
import OffchainAvatarGrid from '../avatar/OffchainAvatarGrid'
import { FIRST_100 } from '../avatars/First100'

interface Props {
  featureFlags: FeatureFlags
  showHeader?: boolean
}

const About: React.FC<Props> = ({ featureFlags, showHeader }) => {
  const tokenIds = [1, 8, 6, 27, 91, 14, 15, 34, 16, 22, 45, 24]
  const avatars = tokenIds.map((i) => FIRST_100[i - 1] as Avatar)
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {showHeader && (
          <>
            <h1>Welcome to OpenAvatar</h1>
            <p>&nbsp;</p>
          </>
        )}
        <p>
          <span className={styles.emtext2}>OpenAvatar</span> is an <span className={styles.emtext}>onchain</span>{' '}
          protocol for Avatars.
        </p>
        {featureFlags.prelaunch && (
          <>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>
              <span className={styles.emtext2}>What is an Avatar?</span>
            </p>
            <p>An avatar is a digital representation of a user or character in an online environment.</p>
          </>
        )}
        {/* <p>
          <ul>
            <li>profile picture (pfp)</li>
            <li>video game character</li>
            <li>AR/VR avatar</li>
          </ul>
        </p> */}
        {!featureFlags.prelaunch && (
          <>
            <OffchainAvatarGrid
              hyperlink={false}
              sources={avatars}
              gridTemplateColumns={`repeat(${Math.min(4, avatars.length)}, 1fr)`}
            />
          </>
        )}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>
          <span className={styles.emtext2}>OpenAvatar</span> allows users to create and{' '}
          <span className={styles.emtext}>customize</span> their own Avatars as NFTs on Ethereum.
        </p>
        <p>&nbsp;</p>
        <p>
          Avatars are stored and rendered <span className={styles.emtext}>100% onchain</span>.
        </p>
        <p>&nbsp;</p>
        <p>You own your Avatar. Zero (0%) royalties.</p>
        <p>&nbsp;</p>
        <p>
          <span className={styles.emtext}>Your legend awaits</span>.
        </p>
      </div>
    </div>
  )
}

export default About
