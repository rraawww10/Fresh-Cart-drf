import {useEffect, useState} from 'react'
import {Link} from 'react-router'
import {ClipLoader} from 'react-spinners'
import {FiArrowRight} from 'react-icons/fi'

import {apiFetch} from '../../api'
import {formatDate, formatPrice} from '../../format'

import './index.css'

const apiStatusConstants = {
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const statusWords = ['placed', 'shipped', 'delivered', 'cancelled']

const VendorDashboard = () => {
  const [summary, setSummary] = useState(null)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.inProgress)

  useEffect(() => {
    const getSummary = async () => {
      // One request fills the whole screen. React adds nothing up: every number
      // below arrives finished.
      const response = await apiFetch('/api/vendor/summary/')
      if (!response.ok) {
        setApiStatus(apiStatusConstants.failure)
        return
      }
      setSummary(await response.json())
      setApiStatus(apiStatusConstants.success)
    }

    getSummary()
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
        <h2>We could not load the dashboard</h2>
        <p>Check that the backend is running on port 8000.</p>
      </div>
    )
  }

  const cards = [
    {label: 'Revenue', value: formatPrice(summary.revenue)},
    {label: 'Orders', value: summary.orders},
    {label: 'Units sold', value: summary.units_sold},
    {label: 'Products listed', value: summary.products},
  ]

  // Always seven bars, including the days with nothing on them, or the chart
  // would have gaps where quiet days should be.
  const peak = Math.max(...summary.last_7_days.map(day => Number(day.revenue)), 1)
  const statusTotal = statusWords.reduce((sum, word) => sum + summary.by_status[word], 0)

  return (
    <div className="dashboard">
      <h1 className="page-title">Overview</h1>
      <p className="page-subtitle">Everything below is counted off your own rows.</p>

      <ul className="dashboard-cards">
        {cards.map(card => (
          <li key={card.label} className="dashboard-card card">
            <span className="dashboard-card-label">{card.label}</span>
            <span className="dashboard-card-value">{card.value}</span>
          </li>
        ))}
      </ul>

      <Link to="/vendor/orders" className="dashboard-awaiting card">
        <span>
          <strong>{summary.awaiting_shipment}</strong>{' '}
          {summary.awaiting_shipment === 1 ? 'item is' : 'items are'} still to pack
        </span>
        <span className="dashboard-awaiting-cta">
          Go to Vendor Orders <FiArrowRight />
        </span>
      </Link>

      <div className="dashboard-panels">
        <section className="dashboard-panel card">
          <h2 className="dashboard-panel-title">Last 7 days</h2>
          <ul className="dashboard-chart">
            {summary.last_7_days.map(day => (
              <li key={day.date} className="dashboard-bar-slot">
                <span className="dashboard-bar-value">{formatPrice(day.revenue)}</span>
                <span
                  className="dashboard-bar"
                  style={{height: `${(Number(day.revenue) / peak) * 100}%`}}
                />
                <span className="dashboard-bar-label">{formatDate(day.date).slice(0, 6)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="dashboard-panel card">
          <h2 className="dashboard-panel-title">Items by status</h2>
          <ul className="dashboard-status">
            {statusWords.map(word => (
              <li key={word}>
                <span className={`badge badge-${word}`}>{word}</span>
                <span className="dashboard-status-track">
                  <span
                    className={`dashboard-status-fill fill-${word}`}
                    style={{
                      width: `${
                        statusTotal === 0 ? 0 : (summary.by_status[word] / statusTotal) * 100
                      }%`,
                    }}
                  />
                </span>
                <span className="dashboard-status-count">{summary.by_status[word]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="dashboard-panel card">
        <h2 className="dashboard-panel-title">Top products</h2>
        {summary.top_products.length === 0 ? (
          <p className="muted">Nothing sold yet.</p>
        ) : (
          <ul className="dashboard-top">
            {summary.top_products.map(product => (
              <li key={`${product.product}-${product.title}`}>
                <span className="dashboard-top-title">{product.title}</span>
                <span className="muted">{product.units} sold</span>
                <span className="price">{formatPrice(product.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default VendorDashboard
