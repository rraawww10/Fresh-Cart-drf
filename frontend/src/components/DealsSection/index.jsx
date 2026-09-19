import {useEffect, useState} from 'react'
import {Link} from 'react-router'
import {ClipLoader} from 'react-spinners'

import {apiFetch} from '../../api'
import {formatPrice} from '../../format'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const DealsSection = () => {
  const [products, setProducts] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial)

  useEffect(() => {
    const getDeals = async () => {
      setApiStatus(apiStatusConstants.inProgress)

      // page_size=6 on purpose. The default page size is 5, and there are six
      // deals, so the sixth would silently go missing without it.
      const response = await apiFetch('/api/products/?is_deal=true&page_size=6')
      const data = await response.json()

      if (!response.ok) {
        // A visitor gets 401 here, not an empty list. The strip turns into the
        // log-in banner rather than pretending there is nothing on offer.
        setErrorMsg(data.detail ?? "Log in to see today's deals.")
        setApiStatus(apiStatusConstants.failure)
        return
      }

      setProducts(data.results)
      setApiStatus(apiStatusConstants.success)
    }

    getDeals()
  }, [])

  if (apiStatus === apiStatusConstants.inProgress) {
    return (
      <div className="deals-strip deals-strip-loading">
        <ClipLoader color="#15803d" size={28} />
      </div>
    )
  }

  if (apiStatus === apiStatusConstants.failure) {
    return (
      <div className="deals-strip deals-banner">
        <div>
          <h2 className="deals-banner-title">Deals of the Day are for members</h2>
          <p className="deals-banner-text">{errorMsg}</p>
        </div>
        <Link to="/login" className="btn btn-primary">
          Log in to see them
        </Link>
      </div>
    )
  }

  return (
    <section className="deals-strip">
      <div className="deals-strip-head">
        <h2 className="deals-strip-title">Deals of the Day</h2>
        <p className="deals-strip-sub">{products.length} picks, today only</p>
      </div>

      <ul className="deals-strip-list">
        {products.map(product => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`} className="deal-card">
              <img className="deal-card-img" src={product.imageUrl} alt={product.title} />
              <p className="deal-card-title">{product.title}</p>
              <p className="deal-card-unit">{product.unit}</p>
              <p className="deal-card-price">
                <span className="price">{formatPrice(product.price)}</span>
                <span className="mrp">{formatPrice(product.mrp)}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DealsSection
