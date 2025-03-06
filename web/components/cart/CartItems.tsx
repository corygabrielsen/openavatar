import { Avatar } from '@openavatar/types'
import React from 'react'
import styles from '../../styles/cart/CartItems.module.scss'
import { randomClean, randomNiceFirst100 } from '../avatars/randomAvatar'
import { useScreenSize } from '../utils/useScreenSize'
import CartItem from './CartItem'

interface Props {
  avatars: Avatar[]
  selectedIndex: number
  onSelectAvatar: (index: number) => void
  onChangeAvatar: (avatar: Avatar) => void
  onAddAvatar: (avatar: Avatar) => void
  onRemoveAvatar: (index: number) => void
  minColumns: number
  maxColumns: number
}

const CartItems: React.FC<Props> = ({
  avatars,
  selectedIndex,
  onSelectAvatar,
  onChangeAvatar,
  onAddAvatar,
  onRemoveAvatar,
  minColumns,
  maxColumns,
}) => {
  const size = useScreenSize()

  const items = []
  for (let i = 0; i < avatars.length; i++) {
    const onRandom = () => {
      // we need to select the index so that onChange will update the correct avatar
      onSelectAvatar(i)
      onChangeAvatar(randomNiceFirst100())
    }

    const onSelect = () => {
      onSelectAvatar(i)
    }

    // no delete button if only one avatar
    if (avatars.length <= 1) {
      items.push(
        <CartItem
          key={`CartItem-${i}`}
          avatar={avatars[i]}
          highlight={i === selectedIndex}
          onSelect={onSelect}
          onRandom={onRandom}
        />
      )
    } else {
      items.push(
        <CartItem
          key={`CartItem-${i}`}
          avatar={avatars[i]}
          highlight={i === selectedIndex}
          onSelect={onSelect}
          onRandom={onRandom}
          onDelete={() => onRemoveAvatar(i)}
        />
      )
    }
  }
  if (avatars.length < 20) {
    items.push(
      <CartItem
        key={avatars.length}
        highlight={false}
        onSelect={() => {
          return onAddAvatar(randomClean())
        }}
      />
    )
  }

  const fitColumns = (screenSize: number) => {
    switch (screenSize) {
      case 1:
        return 4
      case 2:
        return 5
      case 3:
        return 8
      case 4:
        return 8
      case 5:
        return 10
      case 6:
        return 10
      default:
        return 10
    }
  }

  const maxWindowColums = fitColumns(size)

  let gridColumns = Math.max(minColumns, Math.min(maxColumns, items.length))
  // found up to the nearest 5
  // gridColumns = Math.ceil(gridColumns / 5) * 5
  // // respect max in case of rounding up
  gridColumns = Math.min(maxWindowColums, gridColumns)

  const rowStyle = {
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
  }

  return (
    <div className={styles.cartItems} style={rowStyle}>
      {items}
    </div>
  )
}

export default CartItems
