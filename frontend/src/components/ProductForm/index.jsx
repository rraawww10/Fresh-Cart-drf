import {useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router'
import {ClipLoader} from 'react-spinners'

import {apiFetch} from '../../api'

import './index.css'

const categories = [
  'Fruits & Vegetables',
  'Dairy & Bakery',
  'Snacks & Packaged Food',
  'Beverages',
  'Household Care',
]
const availabilities = ['In Stock', 'Out of Stock']

const emptyProduct = {
  title: '',
  brand: '',
  unit: '',
  category: 'Fruits & Vegetables',
  price: '',
  mrp: '',
  imageUrl: '',
  availability: 'In Stock',
  description: '',
  is_deal: false,
}

// Add and Edit fail the same two ways, so they read errors the same way:
// {"detail": ...} or {"<field>": ["..."]}.
const getErrorMessage = data => {
  if (data.detail !== undefined) {
    return data.detail
  }
  const firstKey = Object.keys(data)[0]
  if (firstKey === undefined) {
    return 'The product could not be saved.'
  }
  return `${firstKey}: ${data[firstKey][0]}`
}

const ProductForm = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const isEditing = id !== undefined

  const [product, setProduct] = useState(emptyProduct)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isEditing) {
      return
    }

    const getProduct = async () => {
      // GET fills the edit form with every field the server holds.
      const response = await apiFetch(`/api/products/${id}/`)
      if (!response.ok) {
        setErrorMsg('We could not load that product.')
        setIsLoading(false)
        return
      }
      const data = await response.json()
      setProduct({
        title: data.title,
        brand: data.brand,
        unit: data.unit,
        category: data.category,
        price: data.price,
        mrp: data.mrp,
        imageUrl: data.imageUrl,
        availability: data.availability,
        description: data.description,
        is_deal: data.is_deal,
      })
      setIsLoading(false)
    }

    getProduct()
  }, [id, isEditing])

  const onChange = event => {
    const {name, value, type, checked} = event.target
    setProduct(current => ({...current, [name]: type === 'checkbox' ? checked : value}))
  }

  const onSubmit = async event => {
    event.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    // Never send the vendor. The server takes the owner from the token.
    const response = await apiFetch(isEditing ? `/api/products/${id}/` : '/api/products/', {
      method: isEditing ? 'PATCH' : 'POST',
      body: JSON.stringify(product),
    })
    const data = await response.json()
    setIsSubmitting(false)

    if (!response.ok) {
      // The form keeps everything that was typed.
      setErrorMsg(getErrorMessage(data))
      return
    }

    navigate('/vendor/products')
  }

  if (isLoading) {
    return (
      <div className="centered-state">
        <ClipLoader color="#15803d" size={36} />
      </div>
    )
  }

  return (
    <div className="product-form-page">
      <h1 className="page-title">{isEditing ? 'Edit product' : 'Add a product'}</h1>
      <p className="page-subtitle">
        {isEditing
          ? 'Change only what you need. The fields you leave alone stay as they are.'
          : 'It appears in the shop as soon as you save it.'}
      </p>

      <form className="product-form card" onSubmit={onSubmit}>
        <div className="product-form-grid">
          <label className="field" htmlFor="title">
            <span className="field-label">Name</span>
            <input
              id="title"
              name="title"
              className="input"
              value={product.title}
              onChange={onChange}
              required
            />
          </label>

          <label className="field" htmlFor="brand">
            <span className="field-label">Brand</span>
            <input
              id="brand"
              name="brand"
              className="input"
              value={product.brand}
              onChange={onChange}
              required
            />
          </label>

          <label className="field" htmlFor="unit">
            <span className="field-label">Pack size</span>
            <input
              id="unit"
              name="unit"
              className="input"
              placeholder="1 kg, 500 g, 1 L, 6 pcs"
              value={product.unit}
              onChange={onChange}
              required
            />
          </label>

          <label className="field" htmlFor="category">
            <span className="field-label">Category</span>
            <select
              id="category"
              name="category"
              className="select"
              value={product.category}
              onChange={onChange}
            >
              {categories.map(each => (
                <option key={each} value={each}>
                  {each}
                </option>
              ))}
            </select>
          </label>

          <label className="field" htmlFor="price">
            <span className="field-label">Price (₹)</span>
            <input
              id="price"
              name="price"
              className="input"
              type="number"
              min="1"
              step="0.01"
              value={product.price}
              onChange={onChange}
              required
            />
          </label>

          <label className="field" htmlFor="mrp">
            <span className="field-label">Old price (₹)</span>
            <input
              id="mrp"
              name="mrp"
              className="input"
              type="number"
              min="1"
              step="0.01"
              value={product.mrp}
              onChange={onChange}
              required
            />
          </label>

          <label className="field" htmlFor="imageUrl">
            <span className="field-label">Image web address</span>
            <input
              id="imageUrl"
              name="imageUrl"
              className="input"
              type="url"
              placeholder="https://picsum.photos/seed/mine/300/300"
              value={product.imageUrl}
              onChange={onChange}
            />
          </label>

          <label className="field" htmlFor="availability">
            <span className="field-label">Availability</span>
            <select
              id="availability"
              name="availability"
              className="select"
              value={product.availability}
              onChange={onChange}
            >
              {availabilities.map(each => (
                <option key={each} value={each}>
                  {each}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field" htmlFor="description">
          <span className="field-label">Description</span>
          <textarea
            id="description"
            name="description"
            className="textarea"
            value={product.description}
            onChange={onChange}
          />
        </label>

        <label className="product-form-deal" htmlFor="is_deal">
          <input
            id="is_deal"
            name="is_deal"
            type="checkbox"
            checked={product.is_deal}
            onChange={onChange}
          />
          <span>
            <strong>Deal of the Day</strong>
            <span className="muted"> — only logged-in customers can see it</span>
          </span>
        </label>

        {product.imageUrl !== '' && (
          <div className="product-form-preview">
            <span className="field-label">Preview</span>
            <img src={product.imageUrl} alt="Product preview" />
          </div>
        )}

        <div className="product-form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
          <Link to="/vendor/products" className="btn btn-secondary">
            Cancel
          </Link>
        </div>

        {errorMsg !== '' && <p className="status-msg">*{errorMsg}</p>}
      </form>
    </div>
  )
}

export default ProductForm
