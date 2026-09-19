import {Link} from 'react-router'
import {FaStar} from 'react-icons/fa'

import {formatPrice} from '../../format'

import './index.css'

const ProductCard = ({product}) => {
  // Note the key: imageUrl in camelCase, right next to is_deal and
  // total_reviews in snake_case. Read the answer, do not guess the pattern.
  const {
    id, title, brand, unit, price, mrp, imageUrl, rating, availability,
    is_deal: isDeal,
  } = product

  return (
    <li className="product-card">
      <Link to={`/products/${id}`}>
        <div className="product-card-media">
          <img className="product-card-img" src={imageUrl} alt={title} />
          {isDeal && <span className="product-card-flag">Deal</span>}
          {availability === 'Out of Stock' && (
            <span className="product-card-oos">Out of Stock</span>
          )}
        </div>

        <h3 className="product-card-title">{title}</h3>
        <p className="product-card-brand">
          {brand} <span className="unit-chip">{unit}</span>
        </p>

        <div className="product-card-foot">
          <span>
            <span className="price">{formatPrice(price)}</span>
            <span className="mrp">{formatPrice(mrp)}</span>
          </span>
          <span className="rating-pill">
            <FaStar size={11} />
            {rating}
          </span>
        </div>
      </Link>
    </li>
  )
}

export default ProductCard
