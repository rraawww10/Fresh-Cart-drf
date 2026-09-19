import {FiSearch} from 'react-icons/fi'

import './index.css'

const FiltersGroup = props => {
  const {
    categoryOptions,
    brandOptions,
    ratingOptions,
    activeCategoryId,
    activeBrandId,
    activeRatingId,
    searchInput,
    changeCategory,
    changeBrand,
    changeRating,
    setSearchInput,
    onSubmitSearch,
    clearFilters,
  } = props

  const onKeyDownSearch = event => {
    // Typing sends nothing. Enter sends exactly one request.
    if (event.key === 'Enter') {
      onSubmitSearch()
    }
  }

  const toggle = (current, value, change) => change(current === value ? '' : value)

  return (
    <aside className="filters">
      <div className="filters-search">
        <FiSearch className="filters-search-icon" />
        <input
          className="filters-search-input"
          type="search"
          value={searchInput}
          placeholder="Search name or brand"
          onChange={event => setSearchInput(event.target.value)}
          onKeyDown={onKeyDownSearch}
        />
      </div>

      <div className="filters-block">
        <h3 className="filters-heading">Category</h3>
        <ul className="filters-list">
          {categoryOptions.map(option => (
            <li key={option.categoryId}>
              <button
                type="button"
                className={`filters-item ${
                  activeCategoryId === option.categoryId ? 'is-active' : ''
                }`}
                onClick={() => toggle(activeCategoryId, option.categoryId, changeCategory)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="filters-block">
        <h3 className="filters-heading">Brand</h3>
        <ul className="filters-list">
          {brandOptions.map(option => (
            <li key={option.brandId}>
              <button
                type="button"
                className={`filters-item ${
                  activeBrandId === option.brandId ? 'is-active' : ''
                }`}
                onClick={() => toggle(activeBrandId, option.brandId, changeBrand)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="filters-block">
        <h3 className="filters-heading">Rating</h3>
        <ul className="filters-list">
          {ratingOptions.map(option => (
            <li key={option.ratingId}>
              <button
                type="button"
                className={`filters-item ${
                  activeRatingId === option.ratingId ? 'is-active' : ''
                }`}
                onClick={() => toggle(activeRatingId, option.ratingId, changeRating)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" className="btn btn-secondary btn-block btn-sm" onClick={clearFilters}>
        Clear Filters
      </button>
    </aside>
  )
}

export default FiltersGroup
