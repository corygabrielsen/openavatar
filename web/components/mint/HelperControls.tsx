import React from 'react'

import { Avatar } from '@openavatar/types'
import style from '../../styles/mint/HelperControls.module.scss'

interface Props {
  numPrevHistoryAvatars: number
  numNextHistoryAvatars: number
  onRandomizeAvatar: () => void
  onSelectPrevHistoryAvatar: () => Avatar | null
  onSelectNextHistoryAvatar: () => Avatar | null
}

const HelperControls: React.FC<Props> = ({
  numPrevHistoryAvatars,
  numNextHistoryAvatars,
  onRandomizeAvatar,
  onSelectPrevHistoryAvatar,
  onSelectNextHistoryAvatar,
}) => {
  const urlParams =
    typeof window !== 'undefined' && window !== undefined
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
  const isAdmin = urlParams.get('admin') === 'true'

  const prevButtonVisible = numPrevHistoryAvatars > 0
  const nextButtonVisible = numNextHistoryAvatars > 0

  const randomButtonVisible = isAdmin

  return (
    <div className={style.helperControls}>
      {prevButtonVisible ? (
        <div className={style.buttonWithCount}>
          <button
            onClick={onSelectPrevHistoryAvatar}
            className={`${style.prevButton} ${prevButtonVisible ? '' : style.disabled}`}
          >
            ↩
          </button>
          {/* <span className={style.prevLabel}>{numPrevHistoryAvatars > 99 ? '99+' : numPrevHistoryAvatars}</span> */}
        </div>
      ) : (
        <div className={style.buttonSpacer} />
      )}
      {randomButtonVisible ? (
        <div className={style.buttonWithCount}>
          <button onClick={onRandomizeAvatar} className={style.randomizeButton}>
            🎲 Random 🎲
          </button>
          {/* <span>&nbsp;</span> */}
        </div>
      ) : (
        <div className={style.buttonSpacer} />
      )}
      {nextButtonVisible ? (
        <div className={style.buttonWithCount}>
          <button
            onClick={onSelectNextHistoryAvatar}
            className={`${style.nextButton} ${nextButtonVisible ? '' : style.disabled}`}
          >
            ↪
          </button>
          {/* <span className={style.nextLabel}>{numNextHistoryAvatars}</span> */}
        </div>
      ) : (
        <div className={style.buttonSpacer} />
      )}
    </div>
  )
}

export default HelperControls
