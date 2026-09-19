import {useContext} from 'react'
import {Link, useNavigate} from 'react-router'
import {FiShoppingCart, FiUser} from 'react-icons/fi'
import {LuLeaf} from 'react-icons/lu'

import {apiFetch, clearTokens, getAccessToken, getRefreshToken} from '../../api'
import CartContext from '../../context/CartContext'
import UserContext from '../../context/UserContext'

import './index.css'

const Header = () => {
  const navigate = useNavigate()
  const {cartList} = useContext(CartContext)
  const {user, clearUser} = useContext(UserContext)

  const isLoggedIn = getAccessToken() !== undefined
  const cartCount = cartList.reduce((sum, item) => sum + item.quantity, 0)

  // Logout is async on purpose: the refresh token goes to the server FIRST, and
  // the cookies are only cleared once the answer comes back. Clear them first
  // and there would be no token left to blacklist.
  const onClickLogout = async () => {
    const refresh = getRefreshToken()
    if (refresh !== undefined) {
      await apiFetch('/api/users/logout/', {
        method: 'POST',
        body: JSON.stringify({refresh}),
      })
    }
    clearTokens()
    clearUser()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-brand">
          <LuLeaf />
          <span>FreshCart</span>
        </Link>

        <nav className="header-nav">
          <Link to="/products">Shop</Link>
          {isLoggedIn && <Link to="/orders">My Orders</Link>}
          {isLoggedIn && user?.user_type === 'vendor' && <Link to="/vendor">Vendor</Link>}
        </nav>

        <div className="header-actions">
          {isLoggedIn && (
            <Link to="/cart" className="header-cart" aria-label="Cart">
              <FiShoppingCart />
              {cartCount > 0 && <span className="header-cart-count">{cartCount}</span>}
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link to="/profile" className="header-user">
                <FiUser />
                <span>{user?.username ?? 'Account'}</span>
              </Link>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClickLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
