import {useContext, useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router'
import {ClipLoader} from 'react-spinners'
import {FaStar} from 'react-icons/fa'
import {FiMinus, FiPlus, FiShoppingCart} from 'react-icons/fi'

import {apiFetch, getAccessToken} from '../../api'
import {formatPrice} from '../../format'
import CartContext from '../../context/CartContext'
import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const ProductItemDetails = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const {addCartItem} = useContext(CartContext)

  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial)
  const [addedMsg, setAddedMsg] = useState('')

  useEffect(() => {
    const getProduct = async () => {
      setApiStatus(apiStatusConstants.inProgress)
      setQuantity(1)
      setAddedMsg('')

      const response = await apiFetch(`/api/products/${id}/`)
      if (!response.ok) {
        // A Deal of the Day answers 404 to a visitor, because the server never
        // put it in the list of products this person may see.
        setApiStatus(apiStatusConstants.failure)
        return
      }

      const data = await response.json()
      setProduct(data)
      setApiStatus(apiStatusConstants.success)

      const similarResponse = await apiFetch(
        `/api/products/?category=${encodeURIComponent(data.category)}&page_size=5`,
      )
      if (similarResponse.ok) {
        const similarData = await similarResponse.json()
        setSimilarProducts(
          similarData.results.filter(each => each.id !== data.id).slice(0, 4),
        )
      }
    }

    getProduct()
  }, [id])

  const onClickAddToCart = async () => {
    if (getAccessToken() === undefined) {
      navigate('/login')
      return
    }
    await addCartItem({productId: product.id, quantity})
    setAddedMsg(`Added ${quantity} to your cart.`)
  }

  if (apiStatus === apiStatusConstants.inProgress || apiStatus === apiStatusConstants.initial) {
    return (
      <div className="centered-state">
        <ClipLoader color="#15803d" size={36} />
      </div>
    )
  }

  if (apiStatus === apiStatusConstants.failure) {
    return (
      <div className="centered-state">
        <h2>We could not find that product</h2>
        <p>It may be a Deal of the Day. Those are for members only.</p>
        <Link to="/products" className="btn btn-primary">
          Back to the shop
        </Link>
      </div>
    )
  }

  const outOfStock = product.availability === 'Out of Stock'

  return (
    <div className="page product-details">
      <div className="product-details-main">
        <div className="product-details-media">
          <img src={product.imageUrl} alt={product.title} />
          {product.is_deal && <span className="product-details-flag">Deal of the Day</span>}
        </div>

        <div className="product-details-info">
          <p className="product-details-category">{product.category}</p>
          <h1 className="product-details-title">{product.title}</h1>
          <p className="product-details-brand">
            {product.brand} <span className="unit-chip">{product.unit}</span>
          </p>

          <div className="product-details-meta">
            <span className="rating-pill">
              <FaStar size={12} />
              {product.rating}
            </span>
            <span className="muted">{product.total_reviews} reviews</span>
            <span className={outOfStock ? 'badge badge-cancelled' : 'badge badge-delivered'}>
              {product.availability}
            </span>
          </div>

          <p className="product-details-price">
            {formatPrice(product.price)}
            <span className="mrp">{formatPrice(product.mrp)}</span>
          </p>
          <p className="product-details-description">{product.description}</p>

          <div className="product-details-actions">
            <div className="product-details-qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity(current => Math.max(1, current - 1))}
              >
                <FiMinus />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity(current => current + 1)}
              >
                <FiPlus />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onClickAddToCart}
              disabled={outOfStock}
            >
              <FiShoppingCart />
              {outOfStock ? 'Out of Stock' : 'ADD TO CART'}
            </button>
          </div>

          {addedMsg !== '' && <p className="product-details-added">{addedMsg}</p>}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="product-details-similar">
          <h2 className="product-details-similar-title">More from {product.category}</h2>
          <ul className="product-details-similar-list">
            {similarProducts.map(each => (
              <SimilarProductItem key={each.id} product={each} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default ProductItemDetails
