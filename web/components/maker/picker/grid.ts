import { Avatar } from '@openavatar/types'
import { GridInfo } from './useGridSize'

export interface LabeledAvatar {
  label: string
  avatar: Avatar
}

export enum UIGridItemType {
  Empty,
  Label,
  Avatar,
}

export interface UIGridItem {
  type: UIGridItemType
  item: LabeledAvatar | string | null
}

const extractLabelPrefix = (label: string | undefined): string | undefined => {
  if (!label) {
    return undefined
  }
  let s = label.replace(/[0-9]/g, '')
  if (s.startsWith('space')) {
    s = 'space'
  }
  if (s.startsWith('special')) {
    s = 'special'
  }
  return s
}

export enum UIGridLayoutType {
  Compact,
  GroupByRows,
}

function groupByLabel(labeledAvatars: LabeledAvatar[]): LabeledAvatar[][] {
  const groups: LabeledAvatar[][] = []
  let currentGroup: LabeledAvatar[] = []
  let currentLabelPrefix = labeledAvatars[0].label !== undefined ? extractLabelPrefix(labeledAvatars[0].label) : ''

  for (const labeledAvatar of labeledAvatars) {
    const labelWithoutNumbers = extractLabelPrefix(labeledAvatar.label)
    if (labelWithoutNumbers !== currentLabelPrefix) {
      groups.push(currentGroup)
      currentGroup = []
      currentLabelPrefix = labelWithoutNumbers
    }
    currentGroup.push(labeledAvatar)
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

function formatForGrid(groupedAvatars: LabeledAvatar[][], gridInfo: GridInfo, layout: UIGridLayoutType): UIGridItem[] {
  const result: UIGridItem[] = []
  const columns = gridInfo.columns
  const isMobile = columns <= 3

  for (let i = 0; i < groupedAvatars.length; i++) {
    const group = groupedAvatars[i]
    const label = extractLabelPrefix(group[0].label) || ''

    if (layout === UIGridLayoutType.GroupByRows) {
      result.push({
        type: UIGridItemType.Label,
        item: label,
      })
    }

    for (let j = 0; j < group.length; j++) {
      // if this is the left most column, so we need to add a empty spacer
      const isLeftmostColumn = result.length % columns === 0
      if (isLeftmostColumn && !isMobile && layout === UIGridLayoutType.GroupByRows) {
        result.push({
          type: UIGridItemType.Empty,
          item: null,
        })
      }
      const labeledAvatar = group[j]
      result.push({
        type: UIGridItemType.Avatar,
        item: labeledAvatar,
      })
    }

    // Padding
    if (layout === UIGridLayoutType.GroupByRows) {
      while (result.length % columns !== 0 && result.length < 1000) {
        result.push({
          type: UIGridItemType.Empty,
          item: null,
        })
      }
    }
  }

  return result
}

export function computeGridLayout(
  gridInfo: GridInfo,
  labeledAvatars: LabeledAvatar[],
  layout: UIGridLayoutType
): UIGridItem[] {
  const groupedAvatars = groupByLabel(labeledAvatars)
  return formatForGrid(groupedAvatars, gridInfo, layout)
}
