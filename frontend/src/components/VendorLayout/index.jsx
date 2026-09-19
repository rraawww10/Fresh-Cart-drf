import {NavLink, Outlet} from 'react-router'
import {FiGrid, FiPackage, FiShoppingBag} from 'react-icons/fi'

import './index.css'

const links = [
  {to: '/vendor', label: 'Overview', icon: <FiGrid />, end: true},
  {to: '/vendor/products', label: 'My Products', icon: <FiShoppingBag />},
  {to: '/vendor/orders', label: 'Vendor Orders', icon: <FiPackage />},
]

const VendorLayout = () => (
  <div className="page vendor-layout">
    <aside className="vendor-nav">
      <p className="vendor-nav-title">Vendor</p>
      <nav>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({isActive}) => `vendor-nav-link ${isActive ? 'is-active' : ''}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>

    <div className="vendor-content">
      <Outlet />
    </div>
  </div>
)

export default VendorLayout
