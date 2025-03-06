import { Avatar } from '@openavatar/types'
import { useReducer } from 'react'

interface CartState {
  avatars: Avatar[]
  selectedIndex: number
  removedAvatars: Avatar[]
}

interface CartAction {
  type: 'addAvatar' | 'removeAvatar' | 'selectAvatar' | 'updateSelectedAvatar'
  avatar?: Avatar
  index?: number
}

const initialState: CartState = {
  avatars: [],
  selectedIndex: 0,
  removedAvatars: [],
}

const DEBUG_FORCE_NEW_AVATAR = true

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'addAvatar':
      // Check if there is a removed avatar available, otherwise use action.avatar
      const avatarToAdd =
        !DEBUG_FORCE_NEW_AVATAR && state.removedAvatars.length > 0
          ? state.removedAvatars[state.removedAvatars.length - 1]
          : action.avatar!
      const newRemovedAvatars =
        state.removedAvatars.length > 0
          ? state.removedAvatars.slice(0, state.removedAvatars.length - 1)
          : state.removedAvatars

      return {
        ...state,
        avatars: [...state.avatars, avatarToAdd],
        selectedIndex: state.avatars.length,
        removedAvatars: newRemovedAvatars,
      }
    case 'selectAvatar':
      return { ...state, selectedIndex: action.index! }
    case 'updateSelectedAvatar':
      return {
        ...state,
        avatars: [
          ...state.avatars.slice(0, state.selectedIndex),
          action.avatar!,
          ...state.avatars.slice(state.selectedIndex + 1),
        ],
      }
    case 'removeAvatar':
      return {
        ...state,
        avatars: [...state.avatars.slice(0, action.index!), ...state.avatars.slice(action.index! + 1)],
        selectedIndex: Math.max(0, state.selectedIndex - 1),
        removedAvatars: [...state.removedAvatars, state.avatars[action.index!]],
      }
    default:
      return state
  }
}

export function useCart(initialAvatars: Avatar[]) {
  const [state, dispatch] = useReducer(cartReducer, { ...initialState, avatars: initialAvatars })

  function addAvatar(avatar: Avatar) {
    dispatch({ type: 'addAvatar', avatar })
  }

  function removeAvatar(index: number) {
    dispatch({ type: 'removeAvatar', index })
  }

  function selectAvatar(index: number) {
    dispatch({ type: 'selectAvatar', index })
  }

  function updateSelectedAvatar(avatar: Avatar) {
    dispatch({ type: 'updateSelectedAvatar', avatar })
  }

  return {
    avatars: state.avatars,
    selectedIndex: state.selectedIndex,
    selectedAvatar: state.avatars[state.selectedIndex],
    addAvatar,
    removeAvatar,
    selectAvatar,
    updateSelectedAvatar,
  }
}
