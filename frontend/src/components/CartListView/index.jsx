import {useContext} from 'react'

import CartContext from '../../context/CartContext'
import CartItem from '../CartItem'

import './index.css'

const CartListView = () => {
  const {cartList} = useContext(CartContext)

  return (
    <ul className="cart-list">
      {cartList.map(item => (
        <CartItem key={item.id} cartItem={item} />
      ))}
    </ul>
  )
}

export default CartListView
