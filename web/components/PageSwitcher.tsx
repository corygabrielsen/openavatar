import { useEffect, useState } from 'react'
import styles from '../styles/PageSwitcher.module.scss'
import Banner from './Banner'
import { useFeatureFlags } from './FeatureFlags'
import Footer from './Footer'
import AboutView from './about/AboutView'
import AvatarsView from './avatars/AvatarsView'
import ContractsView from './contracts/ContractsView'
import MintView from './mint/MintView'
import PrelaunchBanner from './mint/PrelaunchBanner'
import WalletView from './wallet/WalletView'
const PageSwitcher = ({ defaultPage }: { defaultPage: string }) => {
  const featureFlags = useFeatureFlags()

  const [activePage, setActivePage] = useState(defaultPage)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handlePageChange = (page: string) => {
    setActivePage(page)
  }

  return (
    <div className={styles.container}>
      <Banner activePage={activePage} onPageChange={handlePageChange} featureFlags={featureFlags} />
      <main className={styles.main}>
        {mounted && featureFlags.prelaunch && <PrelaunchBanner />}
        {mounted && activePage === 'about' && <AboutView />}
        {mounted && activePage === 'avatars' && <AvatarsView />}
        {mounted && activePage === 'contracts' && (
          <ContractsView
            token={true}
            textRecords={true}
            rendererRegistry={true}
            profilePictureRenderer={true}
            renderer={true}
            assets={true}
          />
        )}
        {mounted && activePage === 'mint' && <MintView />}
        {mounted && activePage === 'wallet' && <WalletView />}
      </main>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  )
}

export default PageSwitcher
