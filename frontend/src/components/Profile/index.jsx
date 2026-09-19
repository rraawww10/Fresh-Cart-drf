import {useContext} from 'react'
import {Link} from 'react-router'
import {ClipLoader} from 'react-spinners'

import UserContext from '../../context/UserContext'

import './index.css'

const Profile = () => {
  const {user} = useContext(UserContext)

  if (user === null) {
    return (
      <div className="centered-state">
        <ClipLoader color="#15803d" size={36} />
      </div>
    )
  }

  return (
    <div className="page profile">
      <h1 className="page-title">Your account</h1>
      <p className="page-subtitle">Who the server thinks you are, read from your token.</p>

      <div className="profile-card card">
        <div className="profile-avatar">{user.username.slice(0, 1).toUpperCase()}</div>

        <div className="profile-rows">
          <div className="profile-row">
            <span className="muted">Username</span>
            <span>{user.username}</span>
          </div>
          <div className="profile-row">
            <span className="muted">Email</span>
            <span>{user.email === '' ? '—' : user.email}</span>
          </div>
          <div className="profile-row">
            <span className="muted">Account type</span>
            <span className="profile-type">{user.user_type}</span>
          </div>
        </div>
      </div>

      <div className="profile-links">
        <Link to="/orders" className="btn btn-secondary">
          My Orders
        </Link>
        {user.user_type === 'vendor' && (
          <Link to="/vendor" className="btn btn-secondary">
            Vendor dashboard
          </Link>
        )}
      </div>
    </div>
  )
}

export default Profile
