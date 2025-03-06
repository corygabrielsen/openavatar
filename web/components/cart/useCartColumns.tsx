import { useEffect, useState } from 'react'
import { MEDIA_QUERY_MEDIUM_SMALL, MEDIA_QUERY_SMALL } from '../utils/useScreenSize'

function computeMinCartColumns() {
  if (typeof window === 'undefined') return 5 // Default value for server-side rendering

  const width = window.innerWidth

  if (width <= MEDIA_QUERY_SMALL) {
    return 4
  } else if (width <= MEDIA_QUERY_MEDIUM_SMALL) {
    return 5
  } else {
    return 5
  }
}

function computeMaxCartColumns() {
  if (typeof window === 'undefined') return 5 // Default value for server-side rendering

  const width = window.innerWidth

  const cartItemWidth = 76
  const extras = 100

  const maxColumns = Math.floor((width - extras) / cartItemWidth)
  return Math.min(10, maxColumns)
}

export function useCartColumns() {
  const [minColumns, setMinColumns] = useState(computeMinCartColumns())
  const [maxColumns, setMaxColumns] = useState(computeMaxCartColumns())

  useEffect(() => {
    function handleResize() {
      setMinColumns(computeMinCartColumns())
      setMaxColumns(computeMaxCartColumns())
    }

    window.addEventListener('resize', handleResize)

    // Cleanup event listener on unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { minColumns, maxColumns }
}
