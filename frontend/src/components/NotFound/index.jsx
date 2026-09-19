import {Link} from 'react-router'

import './index.css'

const NotFound = () => (
  <div className="not-found centered-state">
    <p className="not-found-code">404</p>
    <h2>That aisle does not exist</h2>
    <p>The address you tried does not match any screen in FreshCart.</p>
    <Link to="/" className="btn btn-primary">
      Back to the home page
    </Link>
  </div>
)

export default NotFound
