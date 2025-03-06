// FloatingCartView.tsx

import { Avatar } from '@openavatar/types'
import React from 'react'
import style from '../../styles/cart/FloatingCollapsibleCartView.module.scss'
import SmartMintButton from '../mint/SmartMintButton'
import FloatingButton from '../ui/FloatingButton'
import CartItems from './CartItems'
import { useCartColumns } from './useCartColumns'

interface Props {
  avatars: Avatar[]
  selectedIndex: number
  onSelectAvatar: (index: number) => void
  onChangeAvatar: (avatar: Avatar) => void
  onAddAvatar: (avatar: Avatar) => void
  onRemoveAvatar: (index: number) => void
  isCartVisible: Boolean
  onSetCartVisible: (isVisible: boolean) => void
  onMint: () => void
  onTransactionSigned: () => void
  onTransactionSignatureFailed: () => void
  onTransactionSuccess: () => void
  onTransactionFailed: () => void
}

const FloatingCollapsibleCartView: React.FC<Props> = ({
  avatars,
  selectedIndex,
  onSelectAvatar,
  onChangeAvatar,
  onAddAvatar,
  onRemoveAvatar,
  isCartVisible,
  onSetCartVisible,
  onMint,
  onTransactionSigned,
  onTransactionSignatureFailed,
  onTransactionSuccess,
  onTransactionFailed,
}) => {
  const { minColumns, maxColumns } = useCartColumns()

  return (
    <>
      {isCartVisible && (
        <div className={style.floatingCart}>
          <div className={style.header}>
            <div className={style.mintButtonContainer}>
              <SmartMintButton
                avatars={avatars}
                showNetworkText={false}
                onMint={onMint}
                onTransactionSigned={onTransactionSigned}
                onTransactionSignatureFailed={onTransactionSignatureFailed}
                onTransactionSuccess={onTransactionSuccess}
                onTransactionFailed={onTransactionFailed}
                style={{ borderRadius: '0.25em', padding: '0.25em 0.5em', marginLeft: '4px', width: 'fit-content' }}
              />
            </div>
            <p className={style.text}>Build your squad.</p>
            <div className={style.toggleButtonContainer}>
              <button className={style.toggleButton} onClick={() => onSetCartVisible(!isCartVisible)}>
                Hide
              </button>
            </div>
          </div>
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
        </div>
      )}
      {!isCartVisible && (
        <div className={`${style.floatingCart} ${style.collapsed}`}>
          <FloatingButton onClick={() => onSetCartVisible(!isCartVisible)} text="Show Squad" />
        </div>
      )}
    </>
  )
}

export default FloatingCollapsibleCartView
