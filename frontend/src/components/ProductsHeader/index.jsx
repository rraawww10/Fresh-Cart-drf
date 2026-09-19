import {FiChevronDown} from 'react-icons/fi'

import './index.css'

const ProductsHeader = ({count, sortBy, sortOptions, changeSortBy}) => (
  <div className="products-header">
    <div>
      <h1 className="products-header-title">All Products</h1>
      <p className="products-header-count">
        {count} {count === 1 ? 'product' : 'products'} on the shelf
      </p>
    </div>

    <label className="products-header-sort" htmlFor="sort-by">
      <span className="field-label">Sort by</span>
      <div className="products-header-select-wrap">
        <select
          id="sort-by"
          className="select"
          value={sortBy}
          onChange={event => changeSortBy(event.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="products-header-select-icon" />
      </div>
    </label>
  </div>
)

export default ProductsHeader
