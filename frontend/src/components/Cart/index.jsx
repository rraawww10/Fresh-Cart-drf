import {useContext} from 'react'
import {ClipLoader} from 'react-spinners'

import CartContext from '../../context/CartContext'
import CartListView from '../CartListView'
import CartSummary from '../CartSummary'
import EmptyCartView from '../EmptyCartView'

import './index.css'

const Cart = () => {
  const {cartList, isCartLoaded} = useContext(CartContext)

  // Do not say the cart is empty before the server has answered.
  if (!isCartLoaded) {
    return (
      <div className="centered-state">
        <ClipLoader color="#15803d" size={36} />
      </div>
    )
  }

  if (cartList.length === 0) {
    return <EmptyCartView />
  }

  return (
    <div className="page cart">
      <h1 className="page-title">Your basket</h1>
      <p className="page-subtitle">
        {cartList.length} {cartList.length === 1 ? 'product' : 'products'} ready to go
      </p>

      <div className="cart-layout">
        <CartListView />
        <CartSummary />
      </div>
    </div>
  )
}

export default Cart
