import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { FaStar, FaHeart, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { cartService } from '../utils/cartService'
import { authService } from '../utils/authService'

// const brands = ['Tất cả', 'Apple', 'Samsung', 'ASUS', 'Canon', 'HAVIT', 'JBL', 'Sony', 'Logitech', 'Xbox', 'RGB', 'IPS', 'AK', 'Gaming']
const priceRanges = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 100.000₫', min: 0, max: 100000 },
  { label: '100.000₫ - 200.000₫', min: 100000, max: 200000 },
  { label: '200.000₫ - 300.000₫', min: 200000, max: 300000 },
  { label: '300.000₫ - 400.000₫', min: 300000, max: 400000 },
  { label: '400.000₫ - 500.000₫', min: 400000, max: 500000 },
  { label: 'Trên 500.000₫', min: 500000, max: Infinity },
]

const ProductList = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')
  
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState(['Tất cả'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'Tất cả')
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0])
  const [sortBy, setSortBy] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Fetch products and categories from API
  useEffect(() => {
    if (searchParam) {
      searchProducts(searchParam)
    } else {
      fetchProducts()
    }
    fetchCategories()
  }, [searchParam])

  const searchProducts = async (keyword) => {
    try {
      setLoading(true)
      const response = await axiosInstance.post('/search', { keyword })
      if (response.data.status === 'success') {
        const data = response.data.data
        const productsList = Array.isArray(data) ? data : (data?.products || [])
        // Chỉ lấy sản phẩm đang hoạt động (status_product === 0)
        const activeProducts = productsList.filter(product => product.status_product === 0)
        setAllProducts(activeProducts.map(product => ({
          id: product.id,
          title: product.name_product,
          price: product.price_product || 0,
          image: product.image_product || '',
          category: product.name_category || product.category?.name || 'Uncategorized',
          brand: product.brand || '',
          rating: product.rating || 4.0,
          reviews: product.reviews_count || 0,
          discount: product.discount || '',
        })))
      } else {
        setAllProducts([])
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error)
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.')
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/products')
      if (response.data.status === 'success') {
        const data = response.data.data
        const productsList = Array.isArray(data) ? data : (data?.products || [])
        // Chỉ lấy sản phẩm đang hoạt động (status_product === 0)
        const activeProducts = productsList.filter(product => product.status_product === 0)
        setAllProducts(activeProducts.map(product => ({
          id: product.id,
          title: product.name_product,
          price: product.price_product || 0,
          image: product.image_product || '',
          category: product.name_category || product.category?.name || 'Uncategorized',
          brand: product.brand || '',
          rating: product.rating || 4.0,
          reviews: product.reviews_count || 0,
          discount: product.discount || '',
        })))
      } else {
        setAllProducts([])
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error)
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.')
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories')
      if (response.data.status === 'success') {
        const data = response.data.data
        const categoriesList = Array.isArray(data) ? data : (data?.categories || [])
        // Chỉ lấy danh mục đang hoạt động (status_category === 0)
        const activeCategories = categoriesList.filter(category => category.status_category === 0)
        setCategories(['Tất cả', ...activeCategories.map(cat => cat.name_category || cat.name)])
      } else {
        setCategories(['Tất cả'])
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error)
      setCategories(['Tất cả'])
    }
  }

  // Update category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    } else {
      setSelectedCategory('Tất cả')
    }
  }, [categoryParam])

  // Update URL when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (category === 'Tất cả') {
      setSearchParams({})
    } else {
      setSearchParams({ category })
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Filter by category
    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Filter by price range
    if (selectedPriceRange.label !== 'Tất cả') {
      filtered = filtered.filter((p) => {
        const price = Number(p.price) || 0
        if (selectedPriceRange.max === Infinity) {
          return price >= selectedPriceRange.min
        }
        return price >= selectedPriceRange.min && price <= selectedPriceRange.max
      })
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        break
    }

    return filtered
  }, [allProducts, selectedCategory, selectedPriceRange, sortBy])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedPriceRange, sortBy, searchParam])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Show first 3 pages, ellipsis, and last page
        for (let i = 1; i <= 3; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Show first page, ellipsis, and last 3 pages
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const handleResetFilters = () => {
    setSelectedCategory('Tất cả')
    setSelectedPriceRange(priceRanges[0])
    setSortBy('default')
    setCurrentPage(1)
    setSearchParams({})
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <section className="breadcrumb_section">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb_link">
              Trang chủ
            </Link>
            <span className="breadcrumb_separator"> / </span>
            <span className="breadcrumb_current">Tất cả sản phẩm</span>
          </nav>
        </div>
      </section>

      {/* Product List Section */}
      <section className="section">
        <div className="container">
          {error && (
            <div style={{ color: 'red', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          {/* Filters Bar - Nằm trên cùng */}
          <div style={{
            backgroundColor: '#fff',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                {/* Category Filter */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: '600', color: '#333', whiteSpace: 'nowrap' }}>Danh mục:</span>
                  <select
                    className="product_list_sort_select"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    style={{ 
                      minWidth: '180px',
                      padding: '10px 14px',
                      fontSize: '1.4rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1976d2'
                      e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Price Range Filter */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: '600', color: '#333', whiteSpace: 'nowrap' }}>Khoảng giá:</span>
                  <select
                    className="product_list_sort_select"
                    value={selectedPriceRange.label}
                    onChange={(e) => {
                      const range = priceRanges.find(r => r.label === e.target.value) || priceRanges[0]
                      setSelectedPriceRange(range)
                    }}
                    style={{ 
                      minWidth: '200px',
                      padding: '10px 14px',
                      fontSize: '1.4rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1976d2'
                      e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    {priceRanges.map((range, index) => (
                      <option key={index} value={range.label}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Sort */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: '600', color: '#333', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
                  <select
                    className="product_list_sort_select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ 
                      minWidth: '180px',
                      padding: '10px 14px',
                      fontSize: '1.4rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1976d2'
                      e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="default">Mặc định</option>
                    <option value="price-low">Giá: Thấp đến cao</option>
                    <option value="price-high">Giá: Cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="reviews">Nhiều đánh giá nhất</option>
                  </select>
                </label>
              </div>

              {/* Reset Filters Button */}
              {(selectedCategory !== 'Tất cả' || selectedPriceRange.label !== 'Tất cả') && (
                <button 
                  onClick={handleResetFilters}
                  style={{
                    padding: '10px 20px',
                    fontSize: '1.3rem',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e8e8e8'
                    e.target.style.borderColor = '#1976d2'
                    e.target.style.color = '#1976d2'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f5f5f5'
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.color = '#333'
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Products Count */}
          <div style={{ marginBottom: '20px' }}>
            <p className="product_list_count" style={{ fontSize: '1.4rem', color: '#666', margin: 0 }}>
              Hiển thị {filteredProducts.length > 0 ? `${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)}` : '0'} trong tổng số {filteredProducts.length} sản phẩm
            </p>
          </div>

          {/* Products Grid */}
          <div className="product_list_grid">
            {loading ? (
                  <div className="product_list_empty" style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    width: '100%',
                    gridColumn: '1 / -1',
                    gap: '15px'
                  }}>
                    <ClipLoader color="#1976d2" size={50} />
                    <p style={{ fontSize: '1.4rem', color: '#666' }}>
                      Đang tải danh sách sản phẩm...
                    </p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="product_list_empty">
                    <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
                    <button className="product_list_reset_btn" onClick={handleResetFilters}>
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  paginatedProducts.map((product) => (
                    <div key={product.id} className="card">
                      <div className="card_top">
                        <Link to={`/products/${product.id}`}>
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="card_img" />
                          ) : (
                            <div className="card_img" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                              <span>No Image</span>
                            </div>
                          )}
                        </Link>
                        {product.discount && (
                          <div className="card_tag">{product.discount}</div>
                        )}
                        {product.badge && (
                          <div className="card_tag card_tag--new">{product.badge}</div>
                        )}
                        <div className="card_top_icons">
                          <button className="card_top_icon_btn" aria-label="Yêu thích">
                            <FaHeart />
                          </button>
                          <button className="card_top_icon_btn" aria-label="Xem nhanh">
                            <FaEye />
                          </button>
                        </div>
                      </div>
                      <div className="card_body">
                        <Link to={`/products/${product.id}`} className="card_title_link">
                          <h3 className="card_title">{product.title}</h3>
                        </Link>
                        <p className="card_price">{formatCurrency(product.price)}</p>
                        <div className="card_ratings">
                          <div className="card_stars">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <FaStar
                                key={index}
                                className={`w-6 h-6 ${index < Math.floor(product.rating) ? 'active' : ''}`}
                              />
                            ))}
                          </div>
                          <p className="card_rating_numbers">({product.reviews})</p>
                        </div>
                        <button 
                          className="add_to_cart"
                          onClick={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            
                            if (!authService.isAuthenticated()) {
                              if (window.confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đi đến trang đăng nhập?')) {
                                navigate('/login')
                              }
                              return
                            }

                            try {
                              await cartService.addToCart(product.id, 1)
                              toast.success('Đã thêm vào giỏ hàng!', {
                                description: `${product.name_product} đã được thêm vào giỏ hàng.`,
                              })
                            } catch (error) {
                              toast.error('Không thể thêm vào giỏ hàng', {
                                description: error.message || 'Vui lòng thử lại sau.',
                              })
                            }
                          }}
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {!loading && filteredProducts.length > 0 && totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '40px',
                  flexWrap: 'wrap'
                }}>
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    style={{
                      padding: '10px 15px',
                      fontSize: '1.4rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                      backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                      color: currentPage === 1 ? '#ccc' : '#333',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.3s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = '#f0f0f0'
                        e.target.style.borderColor = '#1976d2'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = '#fff'
                        e.target.style.borderColor = '#e0e0e0'
                      }
                    }}
                  >
                    <FaChevronLeft />
                    <span>Trước</span>
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          style={{
                            padding: '10px 5px',
                            fontSize: '1.4rem',
                            color: '#666'
                          }}
                        >
                          ...
                        </span>
                      )
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                          padding: '10px 15px',
                          fontSize: '1.4rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '5px',
                          backgroundColor: currentPage === page ? '#1976d2' : '#fff',
                          color: currentPage === page ? '#fff' : '#333',
                          cursor: 'pointer',
                          minWidth: '40px',
                          transition: 'all 0.3s',
                          fontWeight: currentPage === page ? 'bold' : '500'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== page) {
                            e.target.style.backgroundColor = '#f0f0f0'
                            e.target.style.borderColor = '#1976d2'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== page) {
                            e.target.style.backgroundColor = '#fff'
                            e.target.style.borderColor = '#e0e0e0'
                          }
                        }}
                      >
                        {page}
                      </button>
                    )
                  })}

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '10px 15px',
                      fontSize: '1.4rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                      backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                      color: currentPage === totalPages ? '#ccc' : '#333',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.3s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.backgroundColor = '#f0f0f0'
                        e.target.style.borderColor = '#1976d2'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.backgroundColor = '#fff'
                        e.target.style.borderColor = '#e0e0e0'
                      }
                    }}
                  >
                    <span>Sau</span>
                    <FaChevronRight />
                  </button>
                </div>
              )}
        </div>
      </section>
    </div>
  )
}

export default ProductList

