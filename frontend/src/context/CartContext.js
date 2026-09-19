import {createContext} from 'react'

// So the header can show the cart count, and any screen can change the cart,
// without every screen in between passing it down by hand.
const CartContext = createContext({
  cartList: [],
  isCartLoaded: false,
  addCartItem: () => {},
  deleteCartItem: () => {},
  updateCartItemQuantity: () => {},
  incrementCartItemQuantity: () => {},
  decrementCartItemQuantity: () => {},
  getCart: () => {},
  removeAllCartItems: () => {},
})

export default CartContext
