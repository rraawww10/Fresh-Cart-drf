import {useState} from 'react'
import {Link, useNavigate} from 'react-router'

import {apiFetch} from '../../api'

import './index.css'

// Register errors do not arrive as {"detail": ...} the way login errors do.
// They arrive keyed by the field that failed, e.g.
//   {"username": ["A user with that username already exists."]}
// so one reader has to cope with both shapes.
const getErrorMessage = data => {
  if (data.detail !== undefined) {
    return data.detail
  }

  const firstKey = Object.keys(data)[0]
  if (firstKey === undefined) {
    return 'Could not create the account. Please try again.'
  }

  const firstMessage = data[firstKey][0]
  return `${firstKey}: ${firstMessage}`
}

const RegisterForm = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState('customer')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async event => {
    event.preventDefault()
    setErrorMsg('')

    // The only rule in the whole project that lives entirely in the browser.
    // When it fires, the Network tab stays empty.
    if (password !== confirmPassword) {
      setErrorMsg('The two passwords do not match.')
      return
    }

    setIsSubmitting(true)
    // confirmPassword is not on the list of fields Django wants.
    const response = await apiFetch('/api/users/register/', {
      method: 'POST',
      body: JSON.stringify({username, email, password, user_type: userType}),
    })
    const data = await response.json()
    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMsg(getErrorMessage(data))
      return
    }

    // Making an account does not log you in, so the next stop is the login page.
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={onSubmit}>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          Customers buy groceries. Vendors can also list their own.
        </p>

        <label className="field" htmlFor="register-username">
          <span className="field-label">Username</span>
          <input
            id="register-username"
            className="input"
            type="text"
            value={username}
            onChange={event => setUsername(event.target.value)}
          />
        </label>

        <label className="field" htmlFor="register-email">
          <span className="field-label">Email</span>
          <input
            id="register-email"
            className="input"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
        </label>

        <label className="field" htmlFor="register-password">
          <span className="field-label">Password</span>
          <input
            id="register-password"
            className="input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
        </label>

        <label className="field" htmlFor="register-confirm">
          <span className="field-label">Confirm password</span>
          <input
            id="register-confirm"
            className="input"
            type="password"
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
          />
        </label>

        <span className="field-label">I am a</span>
        <div className="register-types">
          {['customer', 'vendor'].map(type => (
            <label
              key={type}
              className={`register-type ${userType === type ? 'is-active' : ''}`}
              htmlFor={`type-${type}`}
            >
              <input
                id={`type-${type}`}
                type="radio"
                name="user_type"
                value={type}
                checked={userType === type}
                onChange={event => setUserType(event.target.value)}
              />
              {type}
            </label>
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Register'}
        </button>

        {errorMsg !== '' && <p className="status-msg">*{errorMsg}</p>}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterForm
