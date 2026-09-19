import {useEffect, useState} from 'react'
import {ClipLoader} from 'react-spinners'

import {apiFetch} from '../../api'
import ProductCard from '../ProductCard'
import ProductsHeader from '../ProductsHeader'
import FiltersGroup from '../FiltersGroup'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

// The label a person reads and the value the server reads are two different
// things. The value here is the category word Django stores, not a number.
export const categoryOptions = [
  {label: 'Fruits & Vegetables', categoryId: 'Fruits & Vegetables'},
  {label: 'Dairy & Bakery', categoryId: 'Dairy & Bakery'},
  {label: 'Snacks & Packaged Food', categoryId: 'Snacks & Packaged Food'},
  {label: 'Beverages', categoryId: 'Beverages'},
  {label: 'Household Care', categoryId: 'Household Care'},
]

export const brandOptions = [
  {label: 'Amul', brandId: 'Amul'},
  {label: 'Fresh Harvest', brandId: 'Fresh Harvest'},
  {label: 'Farm Fresh', brandId: 'Farm Fresh'},
  {label: 'Britannia', brandId: 'Britannia'},
  {label: "Haldiram's", brandId: "Haldiram's"},
  {label: 'Real', brandId: 'Real'},
]

// "4 & up" on the button, and the server reads it as "4 and up" too.
export const ratingOptions = [
  {label: '4 & up', ratingId: '4'},
  {label: '3 & up', ratingId: '3'},
]

// -price and price, not made-up words. A leading minus means biggest first.
export const sortOptions = [
  {label: 'Relevance', value: ''},
  {label: 'Price: High to Low', value: '-price'},
  {label: 'Price: Low to High', value: 'price'},
  {label: 'Rating: High to Low', value: '-rating'},
  {label: 'Name: A to Z', value: 'title'},
]

const AllProductsSection = () => {
  const [productsList, setProductsList] = useState([])
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial)

  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [activeBrandId, setActiveBrandId] = useState('')
  const [activeRatingId, setActiveRatingId] = useState('')
  const [sortBy, setSortBy] = useState('')

  // Two pieces of state, on purpose. searchInput holds what is being typed and
  // sends nothing. searchQuery holds what was actually submitted, and only that
  // one is in the effect's dependency list, so typing fires no requests.
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const getProducts = async () => {
      setApiStatus(apiStatusConstants.inProgress)

      const params = new URLSearchParams()
      params.set('page', page)
      if (activeCategoryId !== '') params.set('category', activeCategoryId)
      if (activeBrandId !== '') params.set('brand', activeBrandId)
      if (activeRatingId !== '') params.set('rating', activeRatingId)
      if (searchQuery !== '') params.set('search', searchQuery)
      if (sortBy !== '') params.set('ordering', sortBy)

      try {
        const response = await apiFetch(`/api/products/?${params.toString()}`)
        if (!response.ok) {
          setApiStatus(apiStatusConstants.failure)
          return
        }
        const fetchedData = await response.json()
        // The answer is wrapped. The products are in results, never at the top.
        setProductsList(fetchedData.results)
        setCount(fetchedData.count)
        setTotalPages(fetchedData.total_pages)
        setApiStatus(apiStatusConstants.success)
      } catch {
        setApiStatus(apiStatusConstants.failure)
      }
    }

    getProducts()
  }, [page, activeCategoryId, activeBrandId, activeRatingId, searchQuery, sortBy])

  const changeFilter = setter => value => {
    setter(value)
    setPage(1)
  }

  const onSubmitSearch = () => {
    setSearchQuery(searchInput)
    setPage(1)
  }

  const clearFilters = () => {
    setActiveCategoryId('')
    setActiveBrandId('')
    setActiveRatingId('')
    setSearchInput('')
    setSearchQuery('')
    setSortBy('')
    setPage(1)
  }

  const renderProducts = () => {
    if (productsList.length === 0) {
      return (
        <div className="centered-state">
          <h2>No products found</h2>
          <p>Try a different category, or clear the filters.</p>
          <button type="button" className="btn btn-secondary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )
    }

    return (
      <>
        <ul className="products-grid">
          {productsList.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>

        <div className="paginator">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(current => current - 1)}
          >
            Previous
          </button>
          <span className="paginator-label">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(current => current + 1)}
          >
            Next
          </button>
        </div>
      </>
    )
  }

  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <div className="centered-state">
            <ClipLoader color="#15803d" size={36} />
          </div>
        )
      case apiStatusConstants.failure:
        return (
          <div className="centered-state">
            <h2>We could not reach the shop</h2>
            <p>Check that the backend is running on port 8000, then try again.</p>
            <button type="button" className="btn btn-primary" onClick={() => setPage(1)}>
              Retry
            </button>
          </div>
        )
      default:
        return renderProducts()
    }
  }

  return (
    <div className="all-products">
      <FiltersGroup
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        ratingOptions={ratingOptions}
        activeCategoryId={activeCategoryId}
        activeBrandId={activeBrandId}
        activeRatingId={activeRatingId}
        searchInput={searchInput}
        changeCategory={changeFilter(setActiveCategoryId)}
        changeBrand={changeFilter(setActiveBrandId)}
        changeRating={changeFilter(setActiveRatingId)}
        setSearchInput={setSearchInput}
        onSubmitSearch={onSubmitSearch}
        clearFilters={clearFilters}
      />

      <div className="all-products-main">
        <ProductsHeader
          count={count}
          sortBy={sortBy}
          sortOptions={sortOptions}
          changeSortBy={changeFilter(setSortBy)}
        />
        {renderContent()}
      </div>
    </div>
  )
}

export default AllProductsSection
