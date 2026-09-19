import {useCallback, useEffect, useState} from 'react'
import {Link} from 'react-router'
import {ClipLoader} from 'react-spinners'
import {FaStar} from 'react-icons/fa'

import {apiFetch} from '../../api'
import {formatPrice} from '../../format'
import VendorProductsBar from '../VendorProductsBar'

import './index.css'

const apiStatusConstants = {
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const MyProducts = () => {
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)
  const [errorMsg, setErrorMsg] = useState('')

  const getProducts = useCallback(async () => {
    setApiStatus(apiStatusConstants.inProgress)

    const params = new URLSearchParams({page})
    if (searchQuery !== '') {
      params.set('search', searchQuery)
    }

    // Which products come back is decided from the token, never from a query
    // name the browser could change.
    const response = await apiFetch(`/api/vendor/products/?${params.toString()}`)
    if (!response.ok) {
      setApiStatus(apiStatusConstants.failure)
      return
    }

    const data = await response.json()
    setProducts(data.results)
    setCount(data.count)
    setTotalPages(data.total_pages)
    setApiStatus(apiStatusConstants.success)
  }, [page, searchQuery])

  useEffect(() => {
    getProducts()
  }, [getProducts])

  const onClickDelete = async product => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) {
      return
    }

    setErrorMsg('')
    const response = await apiFetch(`/api/products/${product.id}/`, {method: 'DELETE'})

    // 204 comes back with no body at all. Do not try to read an answer — the
    // 204 itself is the only proof it worked.
    if (response.status !== 204) {
      setErrorMsg('That product could not be deleted. You can only delete your own.')
      return
    }

    // Read the list again rather than guessing what the server now holds.
    await getProducts()
  }

  const renderRows = () => {
    if (products.length === 0) {
      return (
        <div className="centered-state">
          <h2>No products here yet</h2>
          <p>Add your first product and it will appear in the shop straight away.</p>
          <Link to="/vendor/products/new" className="btn btn-primary">
            Add Product
          </Link>
        </div>
      )
    }

    return (
      <>
        <ul className="my-products-list">
          {products.map(product => (
            <li key={product.id} className="my-product card">
              {/* This screen calls it image_url, with an underscore. The shop
                  screens call the same column imageUrl. The serializer renamed
                  it on the way out. */}
              <img className="my-product-img" src={product.image_url} alt={product.title} />

              <div className="my-product-info">
                <Link to={`/products/${product.id}`} className="my-product-title">
                  {product.title}
                </Link>
                <p className="muted">
                  {product.brand} <span className="unit-chip">{product.unit}</span>
                </p>
                <div className="my-product-meta">
                  <span className="muted">{product.category}</span>
                  <span className="rating-pill">
                    <FaStar size={10} />
                    {product.rating}
                  </span>
                  <span
                    className={
                      product.availability === 'Out of Stock'
                        ? 'badge badge-cancelled'
                        : 'badge badge-delivered'
                    }
                  >
                    {product.availability}
                  </span>
                </div>
              </div>

              <p className="my-product-price price">{formatPrice(product.price)}</p>

              <div className="my-product-actions">
                <Link
                  to={`/vendor/products/${product.id}/edit`}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onClickDelete(product)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="paginator">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(current => current - 1)}
          >
            Previous
          </button>
          <span className="paginator-label">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(current => current + 1)}
          >
            Next
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="my-products">
      <VendorProductsBar
        count={count}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSubmitSearch={() => {
          setSearchQuery(searchInput)
          setPage(1)
        }}
      />

      {errorMsg !== '' && <p className="status-msg">*{errorMsg}</p>}

      {apiStatus === apiStatusConstants.inProgress && (
        <div className="centered-state">
          <ClipLoader color="#15803d" size={36} />
        </div>
      )}
      {apiStatus === apiStatusConstants.failure && (
        <div className="centered-state">
          <h2>We could not load your products</h2>
          <p>Check that the backend is running on port 8000.</p>
        </div>
      )}
      {apiStatus === apiStatusConstants.success && renderRows()}
    </div>
  )
}

export default MyProducts
