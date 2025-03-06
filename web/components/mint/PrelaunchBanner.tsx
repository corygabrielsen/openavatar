import { Avatar } from '@openavatar/types'
import React from 'react'
import DiscordLink from '../DiscordLink'
import TwitterLink from '../TwitterLink'
import OffchainAvatarGrid from '../avatar/OffchainAvatarGrid'
import { FIRST_100 } from '../avatars/First100'
import { useCountdown } from '../useCountdown'
import { useLaunchDate } from '../useLaunchDate'

interface Props {}

function getURLParameters(): { password: string; reveal: string } {
  const urlParams =
    typeof window !== 'undefined' && window !== undefined
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()

  return {
    password: urlParams.get('password') || '',
    reveal: urlParams.get('reveal') || '',
  }
}

const PrelaunchBanner: React.FC<Props> = () => {
  const params = getURLParameters()
  const { mintDateUTC, revealDateUTC } = useLaunchDate()

  const { formattedTime } = useCountdown(revealDateUTC)

  const browserLocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const mintDateLocalTime = mintDateUTC
    .toLocaleString('en-US', {
      weekday: 'long',
      year: undefined,
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: browserLocalTimeZone,
      timeZoneName: 'short',
      hour12: true,
    })
    .replace(/,/g, '')
    .replace(' PM', '\u00A0PM')
    .replace(' AM', '\u00A0AM')

  const tokenIds = [1, 8, 6, 27, 91, 14, 15, 34, 16, 22, 45, 24]
  const avatars = tokenIds.map((i) => FIRST_100[i - 1] as Avatar)

  const showH1 = false
  const showCountdown = true

  return (
    <div
      style={{
        backgroundColor: '#189ad3',
        // backgroundColor: 'coral',
        color: 'white',
        padding: '1em 0 5em 0',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {showH1 && (
        <h1
          style={{
            fontSize: '3em',
            letterSpacing: '0.1em',
            // letterSpacing: '0.1em',
            textAlign: 'center',
            margin: '1em auto',
            width: 'fit-content',
          }}
        >
          OpenAvatar
        </h1>
      )}
      <h2
        style={{
          letterSpacing: '0.05em',
          textAlign: 'center',
          margin: '1em auto',
          padding: '0 1em',
          width: 'fit-content',
        }}
      >
        {`Mint opens `}
        <span style={{ color: 'white' }}>{`${mintDateLocalTime}`}</span>
      </h2>
      <h3
        style={{
          fontWeight: 'normal',
          textAlign: 'center',
          margin: '0.5em auto',
          padding: '0 0.5em',
          width: 'fit-content',
        }}
      >
        Avatar creator opens 20 minutes before mint
      </h3>
      {showCountdown && (
        <h4
          style={{
            color: 'white',
            fontWeight: 'normal',
            textAlign: 'center',
            fontSize: '1.5em',
            margin: '0em auto',
            width: 'fit-content',
            // boxShadow: '0 0 0 2.2em #189ad3',
            backgroundColor: 'transparent',
            padding: '0.5em 1em',
            borderRadius: '0.5em',
          }}
        >
          {formattedTime}
        </h4>
      )}

      <div>
        <OffchainAvatarGrid
          hyperlink={false}
          sources={avatars}
          gridTemplateColumns={`repeat(${Math.min(4, avatars.length)}, 1fr)`}
        />
      </div>
      {/* discord invite link */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '2em auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5em',
          }}
        >
          <TwitterLink
            style={{
              height: '2em',
              width: '2em',
            }}
            svgStyle={{
              fill: 'white',
            }}
            width={32}
            height={32}
          />
          <DiscordLink width={32} height={32} white={true} />
        </div>
      </div>
    </div>
  )
}

export default PrelaunchBanner
