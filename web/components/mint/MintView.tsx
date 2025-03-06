import { Avatar, DNA } from '@openavatar/types'
import React, { useEffect, useRef, useState } from 'react'
import style from '../../styles/mint/MintView.module.scss'
import Toast from '../Toast'
import CartView from '../cart/CartView'
import { useCart } from '../cart/useCart'
import AvatarMaker from '../maker/AvatarMaker'
import SmartMintButton from '../mint/SmartMintButton'
import { getDefaultAvatars } from '../utils/avatars'
import {
  getAvatarsFromCookie,
  getShowAboutModalOnMintPage,
  setAvatarsToCookie,
  setCookieShowAboutModalOnMintPage,
} from '../utils/cookies'

import getConfig from 'next/config'
import { formatEther } from 'viem'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../abi/ABI'
import { randomNiceFirst100 } from '../avatars/randomAvatar'
import FloatingCollapsibleCartView from '../cart/FloatingCollapsibleCartView'
import FloatingButton from '../ui/FloatingButton'
import { MEDIA_QUERY_MEDIUM_SMALL } from '../utils/useScreenSize'
import MintPreviewModal from './MintPreviewModal'
import MintSuccessModal from './MintSuccessModal'
import useAvatarHistory from './useAvatarHistory'
const { publicRuntimeConfig } = getConfig()

const containerDynamicStyle = {
  backgroundImage: `url(${publicRuntimeConfig.baseUrl}/checkerboard.png)`,
}

interface Props {}

function getInitialAvatars(dna: string | string[] | undefined | null): Avatar[] {
  const result: Avatar[] = []
  if (dna) {
    // discern if string or string[]
    if (Array.isArray(dna)) {
      result.push(...dna.map((d) => new Avatar(new DNA(d))))
    } else {
      result.push(new Avatar(new DNA(dna)))
    }
  }

  const cookieAvatars = getAvatarsFromCookie()
  if (cookieAvatars && cookieAvatars.length > 0) {
    // if the first cookie avatar is the same as the DNA, then we can skip it since it's already in the URL
    if (result.length > 0 && result[0].dna.toString() === cookieAvatars[0].dna.toString()) {
      cookieAvatars.shift()
    }
    result.push(...cookieAvatars)
  }

  if (result.length > 0) {
    return result
  }

  return getDefaultAvatars(1)
}

const MintView: React.FC<Props> = ({}) => {
  const [mounted, setMounted] = useState(false)
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const containerRef = useRef<HTMLDivElement>(null)
  const avatarMakerRef = useRef<HTMLDivElement>(null)

  const defaultShowFloatingCartOnScroll = window.innerWidth <= MEDIA_QUERY_MEDIUM_SMALL
  const [isFloatingCartVisible, setIsFloatingCartVisible] = useState(defaultShowFloatingCartOnScroll)

  const dnaQueryParam = new URLSearchParams(window.location.search).get('dna')
  if (dnaQueryParam) {
    console.log('dnaQueryParam', dnaQueryParam)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    data: getMintPrice,
    isLoading: getMintPriceLoading,
    isError: getMintPriceError,
  } = useContractRead({
    address: getContractConfigs(chain).OpenAvatarGen0Token.address,
    abi: getContractConfigs(chain).OpenAvatarGen0Token.abi,
    functionName: 'getMintPrice',
    args: [],
  })

  const minMintPriceToShowInUI = BigInt(100_000_000_000_000_000)
  let mintPrice =
    getMintPrice === undefined
      ? minMintPriceToShowInUI
      : getMintPrice === BigInt(0)
      ? minMintPriceToShowInUI
      : getMintPrice

  const initialAvatars = getInitialAvatars(dnaQueryParam)
  const { avatars, selectedIndex, selectedAvatar, addAvatar, removeAvatar, selectAvatar, updateSelectedAvatar } =
    useCart(initialAvatars)

  const {
    addAvatarToHistory,
    selectPrevHistoryAvatar,
    selectNextHistoryAvatar,
    numHistoryAvatars,
    numPrevHistoryAvatars,
    numNextHistoryAvatars,
  } = useAvatarHistory(selectedAvatar)

  const handleAvatarChange = (newAvatar: Avatar, fromHistory = false) => {
    updateSelectedAvatar(newAvatar)
    if (!fromHistory) {
      addAvatarToHistory(newAvatar)
    }
  }

  const onRandomizeAvatar = () => {
    const newAvatar = randomNiceFirst100()
    handleAvatarChange(newAvatar) // Using the master change function for consistency
  }

  const onSelectPrevHistoryAvatar = () => {
    const previousAvatar = selectPrevHistoryAvatar()
    if (previousAvatar) {
      handleAvatarChange(previousAvatar, true) // Using the master change function for consistency
    }
    return previousAvatar
  }

  const onSelectNextHistoryAvatar = () => {
    const nextAvatar = selectNextHistoryAvatar()
    if (nextAvatar) {
      handleAvatarChange(nextAvatar, true) // Using the master change function for consistency
    }
    return nextAvatar
  }

  const onSelectAvatar = (index: number) => {
    selectAvatar(index)
    // add to history as well - dont use selectedAvatar as it will be stale
    addAvatarToHistory(avatars[index])
  }

  const onAddAvatar = (avatar: Avatar) => {
    addAvatar(avatar)
    addAvatarToHistory(avatar)
  }

  const onRemoveAvatar = (index: number) => {
    removeAvatar(index)

    // here is how selected index is update inside useCart:
    //    selectedIndex: Math.max(0, state.selectedIndex - 1)

    // so if we remove currently selected index which we have as a variable selectedIndex
    if (selectedIndex === index) {
      // then the cart will automatically select the new avatar somehow
      // and we just need to make sure it gets added to the history
      const newSelectedIndex = Math.max(0, selectedIndex - 1)
      addAvatarToHistory(avatars[newSelectedIndex])
    }
  }

  const [showAboutModal, setShowAboutModal] = useState(getShowAboutModalOnMintPage())
  const [showMintPreviewModal, setShowMintPreviewModal] = useState(false)
  const [showMintSuccessModal, setShowMintSuccessModal] = useState(false)

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    })
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const scrollToTopOfMintView = () => {
    if (containerRef.current === null) {
      scrollToTop()
      return
    }
    containerRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const onSelectAvatarAndScrollToTop = (index: number) => {
    onSelectAvatar(index)
    scrollToTopOfMintView()
  }

  const onAddAvatarAndScrollBackToTop = (avatar: Avatar) => {
    onAddAvatar(avatar)
    scrollToTopOfMintView()
  }

  // Update the avatars in cookies whenever the cart updates
  useEffect(() => {
    setAvatarsToCookie(avatars)
  }, [avatars])

  const openAboutModal = () => {
    setShowAboutModal(true)
  }

  const closeAboutModal = () => {
    setShowAboutModal(false)
    setCookieShowAboutModalOnMintPage(false)
  }

  const openMintPreviewModal = () => {
    setShowMintPreviewModal(true)
  }

  const closeMintPreviewModal = () => {
    setShowMintPreviewModal(false)
  }

  const openMintSuccessModal = () => {
    setShowMintSuccessModal(true)
  }

  const closeMintSuccessModal = () => {
    setShowMintSuccessModal(false)
  }

  const onMintTransactionSuccess = () => {
    closeMintPreviewModal()
    openMintSuccessModal()
  }

  const onMintTransactionSignatureFailed = () => {
    closeMintPreviewModal()
  }

  // New code: Create a state to control visibility of the second cart
  const [showSecondCart, setShowSecondCart] = useState(false)

  // New code: Function to handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      const cartNotVisible = 350
      const avatarNotVisible = 700
      if (scrollTop > avatarNotVisible) {
        // you can adjust this value
        setShowSecondCart(true)
      } else {
        setShowSecondCart(false)
      }
    }

    const cartViewApproxHeight = 100 * Math.ceil(Math.min(20, avatars.length + 1) / 5)
    // New code: Function to handle screen resize
    const handleResize = () => {
      const screenHeight = window.innerHeight

      const desiredVisiblePixels = 600

      if (screenHeight < desiredVisiblePixels + cartViewApproxHeight) {
        // you can adjust this value
        setShowSecondCart(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [avatars])

  const [isTop, setIsTop] = useState(true)
  const [isBottom, setIsBottom] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop // Ensuring cross-browser compatibility
      const maxScrollTop = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const threshold = 50 // Setting the threshold to 10px

      setIsTop(scrollTop === 0)
      setIsBottom(scrollTop >= maxScrollTop - threshold)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const onMint = openMintPreviewModal
  const onTransactionSigned = () => {}
  const onTransactionSignatureFailed = onMintTransactionSignatureFailed
  const onTransactionSuccess = onMintTransactionSuccess
  const onTransactionFailed = () => {}

  return (
    <div className={style.container} style={containerDynamicStyle} ref={containerRef}>
      <div className={style.mintButtonContainer}>
        <SmartMintButton
          avatars={avatars}
          showNetworkText={true}
          onMint={onMint}
          onTransactionSigned={onTransactionSigned}
          onTransactionSignatureFailed={onTransactionSignatureFailed}
          onTransactionSuccess={onTransactionSuccess}
          onTransactionFailed={onTransactionFailed}
          style={{}}
        />
      </div>
      <MintPreviewModal avatars={avatars} show={showMintPreviewModal} onClose={closeMintPreviewModal} />
      <MintSuccessModal avatars={avatars} show={showMintSuccessModal} onClose={closeMintSuccessModal} />
      {/* <AboutModal show={showAboutModal} onClose={closeAboutModal} /> */}
      {mounted && !isConnected && <Toast text={``} />}
      {mounted && isConnected && !getMintPriceLoading && !getMintPriceError && (
        <Toast text={`Mint for ${formatEther(mintPrice as bigint)} ETH per avatar.`} />
      )}
      <CartView
        avatars={avatars}
        selectedIndex={selectedIndex}
        onSelectAvatar={onSelectAvatar}
        onAddAvatar={onAddAvatar}
        onChangeAvatar={handleAvatarChange}
        onRemoveAvatar={onRemoveAvatar}
      />

      {/* New code: Conditionally render the second cart */}
      {showSecondCart && (
        <FloatingCollapsibleCartView
          avatars={avatars}
          selectedIndex={selectedIndex}
          onSelectAvatar={onSelectAvatarAndScrollToTop}
          onAddAvatar={onAddAvatarAndScrollBackToTop}
          onChangeAvatar={handleAvatarChange}
          onRemoveAvatar={onRemoveAvatar}
          isCartVisible={isFloatingCartVisible}
          onSetCartVisible={setIsFloatingCartVisible}
          onMint={onMint}
          onTransactionSigned={onTransactionSigned}
          onTransactionSignatureFailed={onTransactionSignatureFailed}
          onTransactionSuccess={onTransactionSuccess}
          onTransactionFailed={onTransactionFailed}
        />
      )}
      <AvatarMaker
        ref={avatarMakerRef}
        avatar={selectedAvatar}
        onChangeAvatar={handleAvatarChange}
        numPrevHistoryAvatars={numPrevHistoryAvatars}
        numNextHistoryAvatars={numNextHistoryAvatars}
        onRandomizeAvatar={onRandomizeAvatar}
        onSelectPrevHistoryAvatar={onSelectPrevHistoryAvatar}
        onSelectNextHistoryAvatar={onSelectNextHistoryAvatar}
      />
      <div className={style.floatingButtonFooter}>
        <FloatingButton onClick={scrollToTop} text="↑" disabled={isTop} />
        <FloatingButton onClick={scrollToBottom} text="↓" disabled={isBottom} />
      </div>
    </div>
  )
}

export default MintView
