import {Link} from 'react-router'
import {FiShoppingCart} from 'react-icons/fi'

import './index.css'

const EmptyCartView = () => (
  <div className="empty-cart centered-state">
    <span className="empty-cart-icon">
      <FiShoppingCart />
    </span>
    <h2>Your basket is empty</h2>
    <p>Nothing in here yet. The shelves are just through there.</p>
    <Link to="/products" className="btn btn-primary">
      Start shopping
    </Link>
  </div>
)

export default EmptyCartView
