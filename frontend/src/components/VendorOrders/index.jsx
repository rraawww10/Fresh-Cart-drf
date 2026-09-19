import {useCallback, useEffect, useState} from 'react'
import {Link} from 'react-router'
import {ClipLoader} from 'react-spinners'

import {apiFetch} from '../../api'
import {formatPrice} from '../../format'

import './index.css'

const apiStatusConstants = {
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const VendorOrders = () => {
  const [rows, setRows] = useState([])
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)
  const [errorMsg, setErrorMsg] = useState('')

  const getRows = useCallback(async () => {
    // Only the rows that belong to you. An order can hold two vendors'
    // products, and you never see what the same customer bought elsewhere.
    const response = await apiFetch('/api/vendor/orders/')
    if (!response.ok) {
      setApiStatus(apiStatusConstants.failure)
      return
    }
    setRows(await response.json())
    setApiStatus(apiStatusConstants.success)
  }, [])

  useEffect(() => {
    getRows()
  }, [getRows])

  const onClickAdvance = async row => {
    setErrorMsg('')
    const response = await apiFetch(`/api/vendor/orders/items/${row.id}/`, {
      method: 'PATCH',
      // next_status came from the server. React never decides what comes next.
      body: JSON.stringify({status: row.next_status}),
    })

    if (!response.ok) {
      const data = await response.json()
      setErrorMsg(data.detail ?? 'That row could not be moved.')
      return
    }

    await getRows()
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
        <h2>We could not load your orders</h2>
        <p>Check that the backend is running on port 8000.</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="centered-state">
        <h2>Nobody has bought anything yet</h2>
        <p>When a customer buys one of your products, the row shows up here.</p>
        <Link to="/vendor/products" className="btn btn-primary">
          Go to My Products
        </Link>
      </div>
    )
  }

  return (
    <div className="vendor-orders">
      <h1 className="page-title">Vendor Orders</h1>
      <p className="page-subtitle">
        {rows.length} of your products are inside other people&apos;s orders
      </p>

      {errorMsg !== '' && <p className="status-msg">*{errorMsg}</p>}

      <ul className="vendor-orders-list">
        {rows.map(row => (
          <li key={row.id} className="vendor-order card">
            <img className="vendor-order-img" src={row.image_url} alt={row.title} />

            <div className="vendor-order-info">
              <p className="vendor-order-title">{row.title}</p>
              <p className="muted">
                {row.brand} <span className="unit-chip">{row.unit}</span>
              </p>
              <p className="muted">
                Order #{row.order_id} · {row.buyer}
              </p>
            </div>

            <div className="vendor-order-numbers">
              <p className="price">{formatPrice(row.subtotal)}</p>
              <p className="muted">
                {formatPrice(row.price)} × {row.quantity}
              </p>
            </div>

            <span className={`badge badge-${row.status}`}>{row.status}</span>

            <div className="vendor-order-action">
              {row.next_status ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onClickAdvance(row)}
                >
                  Mark {row.next_status}
                </button>
              ) : (
                <span className="muted vendor-order-done">No further step</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default VendorOrders
