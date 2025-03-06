import { useEffect, useState } from 'react'
import { useFeatureFlags } from '../../components/FeatureFlags'
import PageSwitcher from '../../components/PageSwitcher'
import AvatarPageView from '../../components/avatar/AvatarPageView'

const App = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  const featureFlags = useFeatureFlags()

  // Ensure a consistent JSX structure regardless of the state
  if (!mounted) {
    return null // or return a loading placeholder or any consistent JSX structure
  }

  return featureFlags.prelaunch ? <PageSwitcher defaultPage="about" /> : <AvatarPageView />
}

export default App
