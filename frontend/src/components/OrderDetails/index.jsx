import {useCallback, useEffect, useState} from 'react'
import {Link, useParams} from 'react-router'
import {ClipLoader} from 'react-spinners'
import {FiCheckCircle, FiClock} from 'react-icons/fi'

import {apiFetch} from '../../api'
import {formatDate, formatPrice, formatSlot} from '../../format'

import './index.css'

const apiStatusConstants = {
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const OrderDetails = () => {
  const {id} = useParams()
  const [order, setOrder] = useState(null)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)
  const [errorMsg, setErrorMsg] = useState('')

  const getOrder = useCallback(async () => {
    const response = await apiFetch(`/api/orders/${id}/`)
    if (!response.ok) {
      // Somebody else's order id answers 404, not their order.
      setApiStatus(apiStatusConstants.failure)
      return
    }
    setOrder(await response.json())
    setApiStatus(apiStatusConstants.success)
  }, [id])

  useEffect(() => {
    getOrder()
  }, [getOrder])

  const onClickCancel = async () => {
    setErrorMsg('')
    const response = await apiFetch(`/api/orders/${id}/cancel/`, {method: 'POST'})
    const data = await response.json()
    if (!response.ok) {
      setErrorMsg(data.detail ?? 'This order could not be cancelled.')
      return
    }
    setOrder(data)
  }

  if (apiStatus === apiStatusConstants.inProgress) {
    return (
      <div className="centered-state">
        <ClipLoader color="#15803d" size={36} />
      </div>
    )
  }

  if (apiStatus === apiStatusConstants.failure) {
    return (
      <div className="centered-state">
        <h2>We could not find that order</h2>
        <p>It may belong to somebody else.</p>
        <Link to="/orders" className="btn btn-primary">
          Back to my orders
        </Link>
      </div>
    )
  }

  return (
    <div className="page order-details">
      <div className="order-banner card">
        <FiCheckCircle className="order-banner-icon" />
        <div>
          <h1 className="order-banner-title">Order placed</h1>
          <p className="muted">
            Order #{order.id} · placed on {formatDate(order.placed_at)}
          </p>
        </div>
        <span className={`badge badge-${order.status}`}>{order.status}</span>
      </div>

      <div className="order-layout">
        <section className="order-items card">
          <h2 className="order-section-title">Items</h2>
          <ul>
            {order.items.map(item => (
              <li key={item.id}>
                <img src={item.image_url} alt={item.title} />
                <div className="order-item-info">
                  <p className="order-item-title">{item.title}</p>
                  <p className="muted">
                    {item.brand} <span className="unit-chip">{item.unit}</span>
                  </p>
                  <p className="muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="order-item-right">
                  <p className="price">{formatPrice(item.subtotal)}</p>
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="order-side">
          <div className="card order-panel order-slot">
            <FiClock className="order-slot-icon" />
            <div>
              <span className="field-label">Delivery time</span>
              <strong>{formatSlot(order.delivery_slot)}</strong>
            </div>
          </div>

          <div className="card order-panel">
            <h2 className="order-section-title">Delivery address</h2>
            <p className="order-address">
              <strong>{order.address.full_name}</strong>
              <br />
              {order.address.address}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.address.phone}
            </p>
          </div>

          <div className="card order-panel">
            <h2 className="order-section-title">Payment</h2>
            <div className="order-row">
              <span className="muted">Method</span>
              <span>{order.payment_method}</span>
            </div>
            <div className="order-row">
              <span className="muted">Status</span>
              <span>{order.is_paid ? 'Paid' : 'Not paid yet'}</span>
            </div>
            <div className="order-row">
              <span className="muted">Delivery</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            <div className="order-row order-row-total">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>

            {/* can_cancel arrives worked out. The same rule is checked again in
                the Django view, which is where the real lock is. */}
            {order.can_cancel && (
              <button type="button" className="btn btn-danger btn-block" onClick={onClickCancel}>
                Cancel this order
              </button>
            )}
            {errorMsg !== '' && <p className="status-msg">*{errorMsg}</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default OrderDetails
