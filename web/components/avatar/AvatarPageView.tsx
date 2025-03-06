import { NextRouter, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Banner from '../../components/Banner'
import Footer from '../../components/Footer'
import TokenAvatarCard from '../../components/avatar/TokenAvatarCard'
import styles from '../../styles/avatar/AvatarPageView.module.scss'
import { useFeatureFlags } from '../FeatureFlags'

const AvatarPageView = () => {
  const featureFlags = useFeatureFlags()
  const router: NextRouter = useRouter()
  const { id } = router.query

  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const urlParams =
    typeof window !== 'undefined' && window !== undefined
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()

  const isAdmin = urlParams.get('admin') === 'true'
  const pw = urlParams.get('password')

  const handlePageChange = (page: string) => {
    // Start with the page name
    let newUrl = `/${page}`

    // Use URLSearchParams to help us generate the query string
    const newParams = new URLSearchParams()

    if (isAdmin) {
      newParams.set('admin', 'true')
    }
    if (pw) {
      newParams.set('password', pw)
    }

    // Append the query string if we have any parameters
    if (newParams.toString()) {
      newUrl += `?${newParams.toString()}`
    }

    // Navigate to the new URL
    router.push(newUrl)
  }

  return (
    <div className={styles.container}>
      <Banner activePage={'avatar'} onPageChange={handlePageChange} featureFlags={featureFlags} />
      <div className={styles.content}>
        {mounted && (
          <TokenAvatarCard
            tokenId={id as unknown as number}
            showPfpSettingsControls={true}
            showDownloadControls={true}
          />
        )}
      </div>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  )
}

export default AvatarPageView
