import {useContext, useState} from 'react'
import {Link, Navigate, useNavigate} from 'react-router'

import {apiFetch, getAccessToken, saveTokens} from '../../api'
import UserContext from '../../context/UserContext'
import CartContext from '../../context/CartContext'

import './index.css'

const LoginForm = () => {
  const navigate = useNavigate()
  const {loadUser} = useContext(UserContext)
  const {getCart} = useContext(CartContext)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (getAccessToken() !== undefined) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async event => {
    event.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    const response = await apiFetch('/api/users/login/', {
      method: 'POST',
      body: JSON.stringify({username, password}),
    })
    const data = await response.json()
    setIsSubmitting(false)

    if (!response.ok) {
      // A login failure arrives as {"detail": "..."}. Register failures arrive
      // keyed by field name instead, which is why each screen reads its own.
      setErrorMsg(data.detail ?? 'Could not log you in. Please try again.')
      return
    }

    saveTokens(data)
    await Promise.all([loadUser(), getCart()])
    navigate('/')
  }

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={onSubmit}>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Log in to reach your cart, orders and the Deals of the Day.
        </p>

        <label className="field" htmlFor="login-username">
          <span className="field-label">Username</span>
          <input
            id="login-username"
            className="input"
            type="text"
            value={username}
            onChange={event => setUsername(event.target.value)}
            placeholder="Priya"
          />
        </label>

        <label className="field" htmlFor="login-password">
          <span className="field-label">Password</span>
          <input
            id="login-password"
            className="input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="secret123"
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </button>

        {errorMsg !== '' && <p className="status-msg">*{errorMsg}</p>}

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>

        <div className="auth-hint">
          <p>
            <strong>Priya</strong> / secret123 — a vendor
          </p>
          <p>
            <strong>Arjun</strong> / secret123 — a customer
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
