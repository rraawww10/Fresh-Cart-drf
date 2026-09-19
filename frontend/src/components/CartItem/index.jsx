import {useContext} from 'react'
import {Link} from 'react-router'
import {FiMinus, FiPlus, FiTrash2} from 'react-icons/fi'

import CartContext from '../../context/CartContext'
import {formatPrice} from '../../format'

import './index.css'

const CartItem = ({cartItem}) => {
  const {deleteCartItem, incrementCartItemQuantity, decrementCartItemQuantity} =
    useContext(CartContext)

  // id is the row's id, and it is what PATCH and DELETE need. productId is the
  // product's id, and it is only used to link back to the product.
  const {id, productId, title, brand, unit, price, imageUrl, quantity} = cartItem

  return (
    <li className="cart-item">
      <Link to={`/products/${productId}`}>
        <img className="cart-item-img" src={imageUrl} alt={title} />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${productId}`} className="cart-item-title">
          {title}
        </Link>
        <p className="cart-item-brand">
          {brand} <span className="unit-chip">{unit}</span>
        </p>
        <p className="cart-item-unit-price muted">{formatPrice(price)} each</p>
      </div>

      <div className="cart-item-qty">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => decrementCartItemQuantity(id)}
        >
          <FiMinus />
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => incrementCartItemQuantity(id)}
        >
          <FiPlus />
        </button>
      </div>

      {/* price is already a number here, so this is arithmetic, not text. */}
      <p className="cart-item-subtotal price">{formatPrice(price * quantity)}</p>

      <button type="button" className="cart-item-remove" onClick={() => deleteCartItem(id)}>
        <FiTrash2 />
        Remove
      </button>
    </li>
  )
}

export default CartItem
