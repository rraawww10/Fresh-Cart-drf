import {useContext} from 'react'
import {Link} from 'react-router'

import CartContext from '../../context/CartContext'
import {formatPrice} from '../../format'

import './index.css'

const CartSummary = () => {
  const {cartList} = useContext(CartContext)

  const itemCount = cartList.reduce((sum, item) => sum + item.quantity, 0)
  // price became a number on the way in, so this really adds up.
  const total = cartList.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <aside className="cart-summary card">
      <h2 className="cart-summary-title">Order summary</h2>

      <div className="cart-summary-row">
        <span className="muted">Items</span>
        <span>{itemCount}</span>
      </div>
      <div className="cart-summary-row">
        <span className="muted">Delivery</span>
        <span>Free</span>
      </div>

      <div className="cart-summary-total">
        <span>Order total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Link to="/checkout" className="btn btn-primary btn-block">
        Checkout
      </Link>
      <Link to="/products" className="cart-summary-continue">
        Keep shopping
      </Link>
    </aside>
  )
}

export default CartSummary
