import { useEffect, useRef, useState } from 'react'
import { debounce } from '../../utils/debounce'

const AVATAR_WIDTH = 96
const AVATAR_ITEM_WIDTH = AVATAR_WIDTH + 8
const GRID_GAP = 10

interface UseGridSizeProps {
  transforms: any[]
  fillWidth?: boolean
  maxColumns?: number
}

export interface GridInfo {
  numGridItems: number
  columns: number
  numColumnsCanFit: number
}

function useGridSize({ transforms, maxColumns = 10, fillWidth }: UseGridSizeProps) {
  const gridRef = useRef(null)
  const containerRef = useRef(null)
  const [gridInfo, setGridInfo] = useState<GridInfo>({
    numGridItems: 0,
    columns: 0,
    numColumnsCanFit: 0,
  })

  useEffect(() => {
    const gridItemSize = AVATAR_ITEM_WIDTH + GRID_GAP

    function setGridColumns() {
      if (!gridRef.current || !containerRef.current) return
      const grid: HTMLElement = gridRef.current as HTMLElement
      const container: HTMLElement = containerRef.current as HTMLElement

      const containerWidth = container.offsetWidth
      const screenWidth = Math.min(window.innerWidth, window.screen.width)
      const gridDisplayAreaWidth = Math.min(containerWidth, screenWidth)

      const numGridItems = transforms.length
      const numColumnsCanFit = Math.floor(gridDisplayAreaWidth / gridItemSize)
      let columns = Math.min(numGridItems, numColumnsCanFit, maxColumns)
      if (fillWidth) {
        columns = Math.min(numColumnsCanFit, maxColumns)
      }

      const gridWidthPx = columns * gridItemSize

      grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
      grid.style.width = gridWidthPx + 'px'
      grid.style.columnGap = `8px`
      grid.style.rowGap = `8px`

      setGridInfo({ numGridItems, columns, numColumnsCanFit }) // setting the calculated values
    }

    setGridColumns()
    const handleResize = debounce(setGridColumns, 150)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [transforms, fillWidth, maxColumns])

  return {
    containerRef,
    gridRef,
    gridInfo, // returning the calculated values
  }
}

export default useGridSize
