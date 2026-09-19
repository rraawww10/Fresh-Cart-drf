import {Link} from 'react-router'
import {FiPlus, FiSearch} from 'react-icons/fi'

import './index.css'

const VendorProductsBar = ({searchInput, setSearchInput, onSubmitSearch, count}) => {
  const onKeyDown = event => {
    if (event.key === 'Enter') {
      onSubmitSearch()
    }
  }

  return (
    <div className="vendor-products-bar">
      <div>
        <h1 className="page-title">My Products</h1>
        <p className="page-subtitle">
          {count} {count === 1 ? 'product' : 'products'} listed under your name
        </p>
      </div>

      <div className="vendor-products-bar-actions">
        <div className="vendor-products-search">
          <FiSearch className="vendor-products-search-icon" />
          <input
            className="input"
            type="search"
            value={searchInput}
            placeholder="Search your products"
            onChange={event => setSearchInput(event.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>

        <Link to="/vendor/products/new" className="btn btn-primary">
          <FiPlus />
          Add Product
        </Link>
      </div>
    </div>
  )
}

export default VendorProductsBar
