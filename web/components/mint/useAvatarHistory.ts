import { Avatar } from '@openavatar/types'
import { useRef } from 'react'

/**
 * useAvatarHistory - Custom hook to manage the history of avatars.
 *
 * This hook provides a mechanism to maintain a historical record of avatars
 * and navigate through this history. This is useful for scenarios where
 * users can change avatars and might want to revert to a previous selection.
 *
 * @param initialAvatar - The initial avatar to start the history with.
 *
 * @returns {
 *   addAvatarToHistory: Function to add a new avatar to the history,
 *   selectPrevHistoryAvatar: Function to get the previous avatar in the history,
 *   selectNextHistoryAvatar: Function to get the next avatar in the history,
 *   numHistoryAvatars: Total number of avatars in the history,
 *   numPrevHistoryAvatars: Number of avatars before the current one in the history,
 *   numNextHistoryAvatars: Number of avatars after the current one in the history
 * }
 */
function useAvatarHistory(initialAvatar: Avatar) {
  // Store the history of avatars
  const randomAvatarHistory = useRef<Avatar[]>([initialAvatar])

  // Index pointing to the current position in the history
  const randomAvatarHistoryIndex = useRef<number>(0)

  /**
   * addAvatarToHistory - Adds a new avatar to the history.
   * @param avatar - The avatar to add to the history.
   */
  const addAvatarToHistory = (avatar: Avatar) => {
    // only add it if the avatar is different from the top of the stack, no duplicates in a row
    const lastAvatar = randomAvatarHistory.current[randomAvatarHistory.current.length - 1]
    if (lastAvatar && lastAvatar.dna.toString() === avatar.dna.toString()) {
      return
    }
    randomAvatarHistory.current.push(avatar)
    randomAvatarHistoryIndex.current = randomAvatarHistory.current.length - 1
  }

  /**
   * selectPrevHistoryAvatar - Navigate to the previous avatar in the history.
   * Returns the previous avatar if it exists, otherwise returns null.
   */
  const selectPrevHistoryAvatar = (): Avatar | null => {
    if (randomAvatarHistoryIndex.current > 0) {
      randomAvatarHistoryIndex.current--
      return randomAvatarHistory.current[randomAvatarHistoryIndex.current]
    }
    return null
  }

  /**
   * selectNextHistoryAvatar - Navigate to the next avatar in the history.
   * Returns the next avatar if it exists, otherwise returns null.
   */
  const selectNextHistoryAvatar = (): Avatar | null => {
    if (randomAvatarHistoryIndex.current < randomAvatarHistory.current.length - 1) {
      randomAvatarHistoryIndex.current++
      return randomAvatarHistory.current[randomAvatarHistoryIndex.current]
    }
    return null
  }

  // Calculate the number of avatars in history, before and after the current avatar
  const numHistoryAvatars = randomAvatarHistory.current.length
  const numPrevHistoryAvatars = randomAvatarHistoryIndex.current
  const numNextHistoryAvatars = randomAvatarHistory.current.length - randomAvatarHistoryIndex.current - 1

  return {
    addAvatarToHistory,
    selectPrevHistoryAvatar,
    selectNextHistoryAvatar,
    numHistoryAvatars,
    numPrevHistoryAvatars,
    numNextHistoryAvatars,
  }
}

export default useAvatarHistory
