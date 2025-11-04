import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'
const PAGE_SIZE = 15

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpToPage, setJumpToPage] = useState('')
  const [pagination, setPagination] = useState({
    page_size: PAGE_SIZE,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })

  // Refresh data whenever current page changes
  useEffect(() => {
    fetchItems(currentPage)
  }, [currentPage])

  const fetchItems = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/dogs?page=${page}&page_size=${pagination.page_size}`)
      if (!response.ok) throw new Error('Failed to fetch items')
      const data = await response.json()
      setItems(data.items)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleJumpToPage = (e) => {
    e.preventDefault()
    const pageNum = parseInt(jumpToPage, 10)
    if (pageNum >= 1 && pageNum <= pagination.total_pages) {
      handlePageChange(pageNum)
      setJumpToPage('')
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const { total_pages, page } = pagination

    // Always show first page
    if (total_pages > 0) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`page-btn ${page === 1 ? 'active' : ''}`}
        >
          1
        </button>
      )
    }

    // Show ellipsis if needed
    if (page > 3) {
      pages.push(<span key="ellipsis-1" className="ellipsis">...</span>)
    }

    // Show pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(total_pages - 1, page + 1); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-btn ${page === i ? 'active' : ''}`}
        >
          {i}
        </button>
      )
    }

    // Show ellipsis if needed
    if (page < total_pages - 2) {
      pages.push(<span key="ellipsis-2" className="ellipsis">...</span>)
    }

    // Always show last page if there's more than one page
    if (total_pages > 1) {
      pages.push(
        <button
          key={total_pages}
          onClick={() => handlePageChange(total_pages)}
          className={`page-btn ${page === total_pages ? 'active' : ''}`}
        >
          {total_pages}
        </button>
      )
    }

    return pages
  }

  return (
    <div className="app">
      <header>
        <h1>Olive - React + FastAPI</h1>
        <p>A simple full-stack application with pagination</p>
      </header>

      <main>
        <section className="api-status">
          <h2>API Connection</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="error">Error: {error}</p>}
          {!loading && !error && (
            <p className="success">
              Connected to API - Showing {items.length} of {pagination.total_items} items
            </p>
          )}
        </section>

        <section className="items">
          <h2>Dog Breeds (Page {Math.min(pagination.total_pages, currentPage)} of {pagination.total_pages})</h2>
          {items.length > 0 ? (
            <>
              <div className="items-grid">
                {items.map((item, index) => (
                  <div key={item.breed || index} className="item-card">
                    {item.image && (
                      <div className="dog-image-container">
                        <img
                          src={item.image}
                          alt={item.breed}
                          className="dog-image"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <h3 className="dog-breed">{item.breed}</h3>
                  </div>
                ))}
              </div>

              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_prev}
                  className="pagination-btn"
                >
                  &laquo; Previous
                </button>

                <div className="page-numbers">
                  {renderPageNumbers()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  className="pagination-btn"
                >
                  Next &raquo;
                </button>
              </div>

              <form onSubmit={handleJumpToPage} className="jump-to-page">
                <label htmlFor="page-jump">Jump to page:</label>
                <input
                  id="page-jump"
                  type="number"
                  min="1"
                  max={pagination.total_pages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  placeholder={`1-${pagination.total_pages}`}
                  className="page-jump-input"
                />
                <button type="submit" className="page-jump-btn">
                  Go
                </button>
              </form>
            </>
          ) : (
            !loading && <p>No items found</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App


