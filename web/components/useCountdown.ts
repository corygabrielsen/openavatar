import { useEffect, useState } from 'react'

interface DHMS {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const calculateTimeRemaining = (until: Date): DHMS => {
  const now = new Date()
  const timeDiff = until.getTime() - now.getTime()

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

export const useCountdown = (targetDate: Date) => {
  const [timeRemaining, setTimeRemaining] = useState<DHMS>(calculateTimeRemaining(targetDate))
  const secondsRemaining =
    timeRemaining.seconds +
    timeRemaining.minutes * 60 +
    timeRemaining.hours * 60 * 60 +
    timeRemaining.days * 60 * 60 * 24

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  const formattedTime = `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`

  return {
    targetDate,
    formattedTime,
    timeRemaining,
    secondsRemaining,
  }
}
