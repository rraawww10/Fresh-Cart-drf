import {useEffect, useState} from 'react'
import {Link} from 'react-router'
import {ClipLoader} from 'react-spinners'

import {apiFetch} from '../../api'
import {formatDate, formatPrice, formatSlot} from '../../format'

import './index.css'

const apiStatusConstants = {
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)

  useEffect(() => {
    const getOrders = async () => {
      const response = await apiFetch('/api/orders/')
      if (!response.ok) {
        setApiStatus(apiStatusConstants.failure)
        return
      }
      const data = await response.json()
      // Wrapped again: the orders live in results, newest first.
      setOrders(data.results)
      setApiStatus(apiStatusConstants.success)
    }

    getOrders()
  }, [])

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
        <h2>We could not load your orders</h2>
        <p>Check that the backend is running on port 8000.</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="centered-state">
        <h2>No orders yet</h2>
        <p>When you buy something, it will show up here.</p>
        <Link to="/products" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="page my-orders">
      <h1 className="page-title">My Orders</h1>
      <p className="page-subtitle">{orders.length} orders, newest first</p>

      <ul className="my-orders-list">
        {orders.map(order => (
          <li key={order.id} className="my-order card">
            <img className="my-order-img" src={order.thumbnail} alt={`Order ${order.id}`} />

            <div className="my-order-info">
              <p className="my-order-number">Order #{order.id}</p>
              <p className="my-order-date muted">
                Placed on {formatDate(order.placed_at)} · {formatSlot(order.delivery_slot)}
              </p>
              <span className={`badge badge-${order.status}`}>{order.status}</span>
            </div>

            <div className="my-order-numbers">
              <p className="my-order-total price">{formatPrice(order.total)}</p>
              <p className="muted">
                {order.item_count} {order.item_count === 1 ? 'item' : 'items'} ·{' '}
                {order.payment_method}
                {order.is_paid ? ' · paid' : ''}
              </p>
            </div>

            <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MyOrders
