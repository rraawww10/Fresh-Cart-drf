import {useContext, useState} from 'react'
import {Navigate, useNavigate} from 'react-router'
import {ClipLoader} from 'react-spinners'

import {apiFetch} from '../../api'
import {DELIVERY_SLOTS, formatPrice} from '../../format'
import CartContext from '../../context/CartContext'

import './index.css'

const emptyAddress = {
  full_name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
}

const addressFields = [
  {name: 'full_name', label: 'Full name', type: 'text'},
  {name: 'phone', label: 'Phone', type: 'tel'},
  {name: 'address', label: 'Address', type: 'text'},
  {name: 'city', label: 'City', type: 'text'},
  {name: 'state', label: 'State', type: 'text'},
  {name: 'pincode', label: 'Pincode', type: 'text'},
]

const Checkout = () => {
  const navigate = useNavigate()
  const {cartList, isCartLoaded, getCart} = useContext(CartContext)

  const [address, setAddress] = useState(emptyAddress)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [deliverySlot, setDeliverySlot] = useState('MORNING')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = cartList.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Wait for the first read of the cart. An empty list before that answer only
  // means we have not asked yet.
  if (!isCartLoaded) {
    return (
      <div className="centered-state">
        <ClipLoader color="#15803d" size={36} />
      </div>
    )
  }

  if (cartList.length === 0 && !isSubmitting) {
    return <Navigate to="/cart" replace />
  }

  const onChangeField = event => {
    const {name, value} = event.target
    setAddress(current => ({...current, [name]: value}))
  }

  const onSubmit = async event => {
    event.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    // Only three things go up. The server already has the cart and can work the
    // total out itself, and a total sent by the browser can be edited by it.
    const response = await apiFetch('/api/orders/', {
      method: 'POST',
      body: JSON.stringify({
        payment_method: paymentMethod,
        delivery_slot: deliverySlot,
        address,
      }),
    })
    const data = await response.json()

    if (!response.ok) {
      setIsSubmitting(false)
      setErrorMsg(data.detail ?? 'We could not place the order. Check the form and try again.')
      return
    }

    // The server emptied the cart as part of the same save, so read it again.
    await getCart()
    navigate(`/orders/${data.id}`)
  }

  return (
    <div className="page checkout">
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">Where and when should this go?</p>

      <form className="checkout-layout" onSubmit={onSubmit}>
        <div className="checkout-form card">
          <h2 className="checkout-section-title">Delivery address</h2>
          <div className="checkout-grid">
            {addressFields.map(field => (
              <label className="field" key={field.name} htmlFor={field.name}>
                <span className="field-label">{field.label}</span>
                <input
                  id={field.name}
                  name={field.name}
                  className="input"
                  type={field.type}
                  value={address[field.name]}
                  onChange={onChangeField}
                  required
                />
              </label>
            ))}
          </div>

          <h2 className="checkout-section-title">Delivery time</h2>
          <div className="checkout-slots">
            {DELIVERY_SLOTS.map(slot => (
              <label
                key={slot.value}
                className={`checkout-slot ${deliverySlot === slot.value ? 'is-active' : ''}`}
                htmlFor={`slot-${slot.value}`}
              >
                <input
                  id={`slot-${slot.value}`}
                  type="radio"
                  name="delivery_slot"
                  value={slot.value}
                  checked={deliverySlot === slot.value}
                  onChange={event => setDeliverySlot(event.target.value)}
                />
                <span>
                  <strong>{slot.label}</strong>
                  <span className="muted">{slot.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <h2 className="checkout-section-title">Payment</h2>
          <div className="checkout-payments">
            {[
              {value: 'COD', label: 'Cash on delivery', hint: 'Pay when it arrives'},
              {value: 'CARD', label: 'Card', hint: 'Marked paid straight away'},
            ].map(option => (
              <label
                key={option.value}
                className={`checkout-payment ${paymentMethod === option.value ? 'is-active' : ''}`}
                htmlFor={`pay-${option.value}`}
              >
                <input
                  id={`pay-${option.value}`}
                  type="radio"
                  name="payment_method"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={event => setPaymentMethod(event.target.value)}
                />
                <span>
                  <strong>{option.label}</strong>
                  <span className="muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <aside className="checkout-summary card">
          <h2 className="checkout-section-title">In this order</h2>
          <ul className="checkout-items">
            {cartList.map(item => (
              <li key={item.id}>
                <img src={item.imageUrl} alt={item.title} />
                <span className="checkout-item-title">
                  {item.title}
                  <span className="muted"> × {item.quantity}</span>
                </span>
                <span className="price">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="checkout-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Placing…' : 'Place Order'}
          </button>

          {errorMsg !== '' && <p className="status-msg">*{errorMsg}</p>}
        </aside>
      </form>
    </div>
  )
}

export default Checkout
