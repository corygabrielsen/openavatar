import { Avatar } from '@openavatar/types'
import React from 'react'
import style from '../../styles/cart/CartView.module.scss'
import CartItems from './CartItems'
import { useCartColumns } from './useCartColumns'

interface Props {
  avatars: Avatar[]
  selectedIndex: number
  onSelectAvatar: (index: number) => void
  onChangeAvatar: (avatar: Avatar) => void
  onAddAvatar: (avatar: Avatar) => void
  onRemoveAvatar: (index: number) => void
}

const CartView: React.FC<Props> = ({
  avatars,
  selectedIndex,
  onSelectAvatar,
  onChangeAvatar,
  onAddAvatar,
  onRemoveAvatar,
}) => {
  const { minColumns, maxColumns } = useCartColumns()

  return (
    <div className={style.cart}>
      <p className={style.text}>Build your squad.</p>

      <CartItems
        avatars={avatars}
        selectedIndex={selectedIndex}
        onSelectAvatar={onSelectAvatar}
        onChangeAvatar={onChangeAvatar}
        onAddAvatar={onAddAvatar}
        onRemoveAvatar={onRemoveAvatar}
        minColumns={minColumns}
        maxColumns={maxColumns}
      />

      {/* <p className={style.text}>🛒 Select avatar and scroll down to customize. 🛒</p> */}
    </div>
  )
}

export default CartView
