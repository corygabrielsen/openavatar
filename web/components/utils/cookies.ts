// utils/cookieHandler.ts
import { Avatar, DNA } from '@openavatar/types'
import Cookies from 'js-cookie'

const COOKIE_NAME_AVATARS = 'avatars'

export function getAvatarsFromCookie(): Avatar[] | null {
  const avatarsCookie = Cookies.get(COOKIE_NAME_AVATARS)
  if (avatarsCookie) {
    const dnas: string[] = JSON.parse(avatarsCookie)
    const avatars: Avatar[] = []
    for (const dna of dnas) {
      try {
        avatars.push(new Avatar(new DNA(dna)))
      } catch (e) {
        console.warn(`Invalid DNA in cookie: ${dna}`)
        setAvatarsToCookie([])
      }
    }
    return avatars
  }
  return null
}

export function setAvatarsToCookie(avatars: Avatar[]): void {
  const serialized = avatars.map((avatar) => avatar.dna.toString())
  Cookies.set(COOKIE_NAME_AVATARS, JSON.stringify(serialized), { expires: 7 }) // Expires in 7 days
  // console.debug(`Set cookie ${COOKIE_NAME_AVATARS}`, serialized)
}

const COOKIE_SHOW_ABOUT_MODAL_ON_MINT_PAGE = 'showAboutModalOnMintPage'

export function getShowAboutModalOnMintPage(): boolean {
  const showMintModalCookie = Cookies.get(COOKIE_SHOW_ABOUT_MODAL_ON_MINT_PAGE)
  if (showMintModalCookie) {
    return JSON.parse(showMintModalCookie)
  }
  return true
}

export function setCookieShowAboutModalOnMintPage(showMintModal: boolean): void {
  const expireIn15Minutes = new Date(new Date().getTime() + 15 * 60 * 1000)
  Cookies.set(COOKIE_SHOW_ABOUT_MODAL_ON_MINT_PAGE, JSON.stringify(showMintModal), { expires: expireIn15Minutes })
  // console.debug(`Set cookie ${COOKIE_SHOW_ABOUT_MODAL_ON_MINT_PAGE}`, showMintModal)
}
