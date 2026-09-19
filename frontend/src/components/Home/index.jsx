import {Link} from 'react-router'

import './index.css'

const Home = () => (
  <div className="home">
    <section className="home-hero">
      <p className="home-eyebrow">Groceries, delivered when it suits you</p>
      <h1 className="home-title">Fresh food, fair prices, one cart</h1>
      <p className="home-lead">
        Fruit and vegetables, dairy and bakery, snacks and drinks — picked for the shelf
        this morning. Members get the Deals of the Day.
      </p>
      <div className="home-cta">
        <Link to="/products" className="btn btn-primary">
          Start shopping
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Create an account
        </Link>
      </div>
    </section>

    <section className="home-strip">
      <div className="home-strip-item">
        <span className="home-strip-number">54</span>
        <span className="home-strip-label">products on the shelf</span>
      </div>
      <div className="home-strip-item">
        <span className="home-strip-number">6</span>
        <span className="home-strip-label">Deals of the Day, members only</span>
      </div>
      <div className="home-strip-item">
        <span className="home-strip-number">3</span>
        <span className="home-strip-label">delivery times to choose from</span>
      </div>
    </section>
  </div>
)

export default Home
