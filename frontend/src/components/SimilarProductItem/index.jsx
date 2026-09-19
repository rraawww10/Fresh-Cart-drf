import {Link} from 'react-router'
import {FaStar} from 'react-icons/fa'

import {formatPrice} from '../../format'

import './index.css'

const SimilarProductItem = ({product}) => (
  <li className="similar-product">
    <Link to={`/products/${product.id}`}>
      <img className="similar-product-img" src={product.imageUrl} alt={product.title} />
      <h3 className="similar-product-title">{product.title}</h3>
      <p className="similar-product-brand">
        {product.brand} <span className="unit-chip">{product.unit}</span>
      </p>
      <div className="similar-product-foot">
        <span className="price">{formatPrice(product.price)}</span>
        <span className="rating-pill">
          <FaStar size={11} />
          {product.rating}
        </span>
      </div>
    </Link>
  </li>
)

export default SimilarProductItem
