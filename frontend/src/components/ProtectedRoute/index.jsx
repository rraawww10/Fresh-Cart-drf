import {Navigate, Outlet} from 'react-router'

import {getAccessToken} from '../../api'

import './index.css'

// Hiding a screen here is a courtesy. The lock is always in the Django view.
const ProtectedRoute = () => {
  if (getAccessToken() === undefined) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export default ProtectedRoute
