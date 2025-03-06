import { useEffect, useState } from 'react'
import { keccak256 } from 'viem'
import { AVATAR_CREATOR_REVEAL_TIME } from './launchTime'
import { getURLParameters } from './utils/getURLParameters'

export interface FeatureFlags {
  prelaunch: boolean
}

function utf8ToBytes(str: string): Uint8Array {
  const utf8 = encodeURIComponent(str)

  const result = new Uint8Array(utf8.length)

  for (let i = 0; i < utf8.length; i++) {
    result[i] = utf8.charCodeAt(i)
  }

  return result
}

function getFeatureFlags(): FeatureFlags {
  const params = getURLParameters()

  const password = params.password
  const hashedPassword = keccak256(utf8ToBytes(password))
  const expected = '0xba77bca359e479d20492f7cad9cbaa22d1cd3924ebcd5a86c31c1b13c56f4704'
  const forceUnlock = hashedPassword === expected

  // Use the reveal parameter if it exists, otherwise default to AVATAR_CREATOR_REVEAL_TIME
  const revealTime = params.reveal ? new Date(params.reveal) : AVATAR_CREATOR_REVEAL_TIME
  const nowUTC = new Date()
  const reveal = nowUTC > revealTime
  const timeRemaining = revealTime.getTime() - nowUTC.getTime()
  // console.log('timeRemaining', timeRemaining)

  const featureFlags = { prelaunch: !forceUnlock && !reveal }
  // console.log('featureFlags', featureFlags)
  return featureFlags
}

export function useFeatureFlags(): FeatureFlags {
  const [featureFlags, setFeatureFlags] = useState(getFeatureFlags())

  function timeRemaining(): number {
    const params = getURLParameters()
    const avatarCreatorRevealTime = params.reveal ? new Date(params.reveal) : AVATAR_CREATOR_REVEAL_TIME
    const nowUTC = new Date()
    const timeToReveal = avatarCreatorRevealTime.getTime() - nowUTC.getTime()
    return timeToReveal
  }

  useEffect(() => {
    const timeToReveal = timeRemaining()

    if (timeToReveal > 0) {
      const timeoutId = setTimeout(() => {
        console.log('Time has come! Refreshing the page.')

        // Refreshing the page
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, timeToReveal)

      return () => clearTimeout(timeoutId)
    }
  }, [])

  return featureFlags
}
