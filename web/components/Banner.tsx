import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from '../styles/Banner.module.scss'
import { FeatureFlags } from './FeatureFlags'
import { useScreenSize } from './utils/useScreenSize'

type SwitchPageButtonProps = {
  page: string
  label: string
  activePage: string
  onPageChange: (page: string) => void
}

const SwitchPageButton: React.FC<SwitchPageButtonProps> = ({
  page,
  label,
  activePage,
  onPageChange,
}: SwitchPageButtonProps) => {
  return (
    <button
      className={`${styles.navbarItem} ${activePage === page ? styles.selected : ''}`}
      onClick={() => onPageChange(page)}
    >
      {label}
    </button>
  )
}

interface Props {
  activePage: string
  onPageChange: (page: string) => void

  featureFlags: FeatureFlags
}

const Banner: React.FC<Props> = ({ activePage, onPageChange, featureFlags }: Props) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // check if url includes "staging.openavatar.tech"
  // if so, show staging banner
  let subtitle = ''
  if (typeof window !== 'undefined') {
    if (window.location.href.includes('staging.openavatar.tech')) {
      subtitle = 'staging.openavatar.tech'
    } else if (window.location.href.includes('localhost')) {
      subtitle = 'localhost:' + window.location.port
    }
  }

  const size = useScreenSize()
  return (
    <header className={styles.header}>
      <div className={styles.logotitleContainer}>
        <div className={styles.title}>
          <Link href={`/`} passHref>
            OpenAvatar
          </Link>
        </div>
        {mounted && subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
      {mounted && (
        <div className={styles.navbarContainer}>
          {!featureFlags.prelaunch && (
            <>
              <section className={styles.navbar}>
                <SwitchPageButton page="about" label="About" activePage={activePage} onPageChange={onPageChange} />
                <SwitchPageButton page="avatars" label="Avatars" activePage={activePage} onPageChange={onPageChange} />
                {/* <SwitchPageButton page="contracts" label="Contracts" activePage={activePage} onPageChange={onPageChange} /> */}
                <SwitchPageButton page="mint" label="Mint" activePage={activePage} onPageChange={onPageChange} />
                <SwitchPageButton page="wallet" label="Wallet" activePage={activePage} onPageChange={onPageChange} />
              </section>
              <div className={styles.connectButtonContainer}>
                <ConnectButton
                  accountStatus={size > 5 ? 'full' : size > 4 ? 'address' : 'avatar'}
                  chainStatus="none"
                  label="Connect"
                  showBalance={false}
                />
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Banner
