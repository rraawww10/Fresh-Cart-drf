import {useCallback, useEffect, useState} from 'react'
import {Navigate, Route, Routes} from 'react-router'

import {apiFetch, getAccessToken} from './api'
import CartContext from './context/CartContext'
import UserContext from './context/UserContext'

import Header from './components/Header'
import Home from './components/Home'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import ProtectedRoute from './components/ProtectedRoute'
import Products from './components/Products'
import ProductItemDetails from './components/ProductItemDetails'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import MyOrders from './components/MyOrders'
import OrderDetails from './components/OrderDetails'
import Profile from './components/Profile'
import VendorLayout from './components/VendorLayout'
import VendorDashboard from './components/VendorDashboard'
import MyProducts from './components/MyProducts'
import ProductForm from './components/ProductForm'
import VendorOrders from './components/VendorOrders'
import NotFound from './components/NotFound'

import './App.css'

// The row that arrives from the server carries two ids and a price written as
// text. Keep the two ids apart, and turn the price into a number once, here, on
// the way in.
const formatCartItem = item => ({
  id: item.id,
  productId: item.product,
  title: item.product_title,
  brand: item.product_brand,
  unit: item.product_unit,
  price: Number(item.product_price),
  imageUrl: item.product_image_url,
  quantity: item.quantity,
})

const App = () => {
  const [cartList, setCartList] = useState([])
  const [user, setUser] = useState(null)
  // Until the first GET /api/cart/ comes back, "the cart is empty" and "we have
  // not looked yet" are the same empty array. Screens that turn people away
  // when the cart is empty have to wait for this, or a reload on /checkout
  // would bounce to /cart before the answer even arrives.
  const [isCartLoaded, setIsCartLoaded] = useState(false)

  const getCart = useCallback(async () => {
    const response = await apiFetch('/api/cart/')
    if (!response.ok) {
      setCartList([])
      setIsCartLoaded(true)
      return
    }
    const data = await response.json()
    setCartList(data.items.map(formatCartItem))
    setIsCartLoaded(true)
  }, [])

  const loadUser = useCallback(async () => {
    const response = await apiFetch('/api/users/profile/')
    if (!response.ok) {
      setUser(null)
      return
    }
    setUser(await response.json())
  }, [])

  useEffect(() => {
    // Check for a token first, so the login screen does not fire a request that
    // could only ever answer 401.
    if (getAccessToken() === undefined) {
      setIsCartLoaded(true)
      return
    }
    getCart()
    loadUser()
  }, [getCart, loadUser])

  // Each of the three below does its work on the server and then reads the cart
  // again, so the screen never has to guess what the server now holds.
  const addCartItem = async ({productId, quantity}) => {
    await apiFetch('/api/cart/add/', {
      method: 'POST',
      body: JSON.stringify({product: productId, quantity}),
    })
    await getCart()
  }

  const deleteCartItem = async id => {
    await apiFetch(`/api/cart/items/${id}/`, {method: 'DELETE'})
    await getCart()
  }

  const updateCartItemQuantity = async (id, quantity) => {
    await apiFetch(`/api/cart/items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({quantity}),
    })
    await getCart()
  }

  // These two do the arithmetic and hand a final number to the update function,
  // which is exactly what a PATCH that sets a value needs.
  const incrementCartItemQuantity = id => {
    const item = cartList.find(each => each.id === id)
    if (item) {
      updateCartItemQuantity(id, item.quantity + 1)
    }
  }

  const decrementCartItemQuantity = id => {
    const item = cartList.find(each => each.id === id)
    if (!item) {
      return
    }
    if (item.quantity === 1) {
      deleteCartItem(id)
      return
    }
    updateCartItemQuantity(id, item.quantity - 1)
  }

  const removeAllCartItems = async () => {
    await Promise.all(
      cartList.map(item => apiFetch(`/api/cart/items/${item.id}/`, {method: 'DELETE'})),
    )
    await getCart()
  }

  const clearUser = () => {
    setUser(null)
    setCartList([])
  }

  return (
    <UserContext.Provider value={{user, isLoggedIn: user !== null, loadUser, clearUser}}>
      <CartContext.Provider
        value={{
          cartList,
          isCartLoaded,
          getCart,
          addCartItem,
          deleteCartItem,
          updateCartItemQuantity,
          incrementCartItemQuantity,
          decrementCartItemQuantity,
          removeAllCartItems,
        }}
      >
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductItemDetails />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/vendor" element={<VendorLayout />}>
                <Route index element={<VendorDashboard />} />
                <Route path="products" element={<MyProducts />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="orders" element={<VendorOrders />} />
              </Route>
            </Route>

            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </main>
      </CartContext.Provider>
    </UserContext.Provider>
  )
}

export default App
