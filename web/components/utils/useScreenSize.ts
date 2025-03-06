import { useEffect, useState } from 'react'

export const MEDIA_QUERY_SMALL = 480
export const MEDIA_QUERY_MEDIUM_SMALL = 640
export const MEDIA_QUERY_MEDIUM = 768
export const MEDIA_QUERY_MEDIUM_LARGE = 900
export const MEDIA_QUERY_LARGE = 1024

type Size = 1 | 2 | 3 | 4 | 5 | 6

export const useScreenSize = (): Size => {
  const getSize = (): Size => {
    if (typeof window === 'undefined') return 1 // Default size for server-side rendering

    const width = window.innerWidth

    if (width < MEDIA_QUERY_SMALL) return 1
    if (width < MEDIA_QUERY_MEDIUM_SMALL) return 2
    if (width < MEDIA_QUERY_MEDIUM) return 3
    if (width < MEDIA_QUERY_MEDIUM_LARGE) return 4
    if (width < MEDIA_QUERY_LARGE) return 5
    return 6
  }

  const [size, setSize] = useState(getSize)

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return size
}
