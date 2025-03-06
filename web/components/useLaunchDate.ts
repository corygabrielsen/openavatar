import { useMemo } from 'react'
import { LAUNCH_TIME } from './launchTime'
import { getURLParameters } from './utils/getURLParameters'

export function useLaunchDate() {
  const params = getURLParameters()

  const mintDateUTC = useMemo(() => {
    return params.reveal ? new Date(new Date(params.reveal).getTime() + 20 * 60 * 1000) : LAUNCH_TIME
  }, [params.reveal])

  // subtract 20min
  const revealDateUTC = useMemo(() => {
    return new Date(mintDateUTC.getTime() - 20 * 60 * 1000)
  }, [mintDateUTC])

  return {
    mintDateUTC,
    revealDateUTC,
  }
}
