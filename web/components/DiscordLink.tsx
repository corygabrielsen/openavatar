import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import styles from '../styles/DiscordLink.module.scss'

interface Props {
  style?: React.CSSProperties
  white?: boolean
  width?: number
  height?: number
}

const DiscordLink: React.FC<Props> = ({ style, white, width, height }) => (
  // style.width = 'fit-content',
  <div className={styles.discord} style={style}>
    <Link href="https://discord.gg/32ArdCp9YW" target="_blank" rel="noopener noreferrer" passHref>
      <Image
        className={styles.discordLogoGray}
        src={`/discord-logo-${white ? 'white' : 'gray'}.png`}
        alt="Discord Logo"
        width={width}
        height={height}
      />
    </Link>
    <Link href="https://discord.gg/32ArdCp9YW" target="_blank" rel="noopener noreferrer" passHref>
      <Image
        className={styles.discordLogoColor}
        src="/discord-logo.png"
        alt="Discord Logo"
        width={width}
        height={height}
      />
    </Link>
  </div>
)

export default DiscordLink
