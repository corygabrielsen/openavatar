import { useFeatureFlags } from '../components/FeatureFlags'
import PageSwitcher from '../components/PageSwitcher'

const App = () => {
  const featureFlags = useFeatureFlags()
  return <PageSwitcher defaultPage={featureFlags.prelaunch ? 'about' : 'wallet'} />
}

export default App
