import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaStar, FaHeart, FaEye, FaFilter } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'

// Tổng hợp tất cả sản phẩm từ các component
const allProducts = [
  // Flash Sale Products
  {
    id: 1,
    title: 'Tay cầm Gaming HAVIT HV-G92',
    price: 120,
    image: 'https://images.unsplash.com/photo-1614680376573-e720cdb88866?auto=format&fit=crop&w=600&q=80',
    discount: '-40%',
    category: 'Gaming',
    brand: 'HAVIT',
    rating: 4.5,
    reviews: 88,
  },
  {
    id: 2,
    title: 'Bàn phím cơ Gaming RGB',
    price: 80,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    discount: '-35%',
    category: 'Gaming',
    brand: 'AK',
    rating: 4.3,
    reviews: 75,
  },
  {
    id: 3,
    title: 'Màn hình Gaming 27 inch',
    price: 320,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    discount: '-25%',
    category: 'Monitor',
    brand: 'IPS',
    rating: 4.7,
    reviews: 99,
  },
  {
    id: 4,
    title: 'Laptop Gaming ASUS ROG',
    price: 180,
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    discount: '-30%',
    category: 'Laptop',
    brand: 'ASUS',
    rating: 4.6,
    reviews: 120,
  },
  {
    id: 5,
    title: 'Tai nghe Gaming 7.1',
    price: 150,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    discount: '-20%',
    category: 'Audio',
    brand: 'Gaming',
    rating: 4.4,
    reviews: 65,
  },
  {
    id: 6,
    title: 'Chuột Gaming RGB',
    price: 65,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80',
    discount: '-18%',
    category: 'Gaming',
    brand: 'RGB',
    rating: 4.2,
    reviews: 45,
  },
  // Best Selling Products
  {
    id: 7,
    title: 'Smartphone iPhone 15 Pro',
    price: 260,
    image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=600&q=80',
    discount: '-30%',
    category: 'Smartphone',
    brand: 'Apple',
    rating: 4.8,
    reviews: 200,
  },
  {
    id: 8,
    title: 'Máy ảnh Canon EOS DSLR',
    price: 960,
    image: 'https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=600&q=80',
    discount: '-15%',
    category: 'Camera',
    brand: 'Canon',
    rating: 4.9,
    reviews: 150,
  },
  {
    id: 9,
    title: 'Tản nhiệt CPU RGB',
    price: 170,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    discount: '-25%',
    category: 'PC Parts',
    brand: 'RGB',
    rating: 4.3,
    reviews: 88,
  },
  {
    id: 10,
    title: 'Loa Bluetooth JBL',
    price: 360,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    discount: '-10%',
    category: 'Audio',
    brand: 'JBL',
    rating: 4.5,
    reviews: 95,
  },
  // Explore Products
  {
    id: 11,
    title: 'Tablet iPad Pro 12.9 inch',
    price: 100,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
    category: 'Tablet',
    brand: 'Apple',
    rating: 4.7,
    reviews: 180,
    badge: 'Mới',
  },
  {
    id: 12,
    title: 'Smartwatch Apple Watch',
    price: 80,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    category: 'Wearable',
    brand: 'Apple',
    rating: 4.6,
    reviews: 140,
  },
  {
    id: 13,
    title: 'Điện thoại Samsung Galaxy',
    price: 960,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    category: 'Smartphone',
    brand: 'Samsung',
    rating: 4.5,
    reviews: 160,
  },
  {
    id: 14,
    title: 'Webcam Logitech 4K',
    price: 116,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80',
    category: 'Accessories',
    brand: 'Logitech',
    rating: 4.4,
    reviews: 75,
  },
  {
    id: 15,
    title: 'Tay cầm Gaming Xbox',
    price: 660,
    image: 'https://images.unsplash.com/photo-1614680376573-e720cdb88866?auto=format&fit=crop&w=600&q=80',
    category: 'Gaming',
    brand: 'Xbox',
    rating: 4.6,
    reviews: 110,
  },
  {
    id: 16,
    title: 'Loa Bluetooth Sony',
    price: 780,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    category: 'Audio',
    brand: 'Sony',
    rating: 4.7,
    reviews: 125,
  },
]

const categories = ['Tất cả', 'Gaming', 'Smartphone', 'Laptop', 'Audio', 'Camera', 'Monitor', 'Tablet', 'Wearable', 'PC Parts', 'Accessories']
const brands = ['Tất cả', 'Apple', 'Samsung', 'ASUS', 'Canon', 'HAVIT', 'JBL', 'Sony', 'Logitech', 'Xbox', 'RGB', 'IPS', 'AK', 'Gaming']
const priceRanges = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 100.000₫', min: 0, max: 100 },
  { label: '100.000₫ - 200.000₫', min: 100, max: 200 },
  { label: '200.000₫ - 500.000₫', min: 200, max: 500 },
  { label: '500.000₫ - 1.000.000₫', min: 500, max: 1000 },
  { label: 'Trên 1.000.000₫', min: 1000, max: Infinity },
]
const ratings = [5, 4, 3, 2, 1]

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'Tất cả')
  const [selectedBrand, setSelectedBrand] = useState('Tất cả')
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0])
  const [selectedRating, setSelectedRating] = useState(null)
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

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

    // Filter by brand
    if (selectedBrand !== 'Tất cả') {
      filtered = filtered.filter((p) => p.brand === selectedBrand)
    }

    // Filter by price range
    if (selectedPriceRange.min !== 0 || selectedPriceRange.max !== Infinity) {
      filtered = filtered.filter(
        (p) => p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max,
      )
    }

    // Filter by rating
    if (selectedRating !== null) {
      filtered = filtered.filter((p) => p.rating >= selectedRating)
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
  }, [selectedCategory, selectedBrand, selectedPriceRange, selectedRating, sortBy])

  const handleResetFilters = () => {
    setSelectedCategory('Tất cả')
    setSelectedBrand('Tất cả')
    setSelectedPriceRange(priceRanges[0])
    setSelectedRating(null)
    setSortBy('default')
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
          {/* Mobile Overlay */}
          {showFilters && (
            <div
              className="product_list_overlay active"
              onClick={() => setShowFilters(false)}
            />
          )}
          <div className="product_list_wrapper">
            {/* Sidebar Filters */}
            <aside className={`product_list_sidebar ${showFilters ? 'active' : ''}`}>
              <div className="product_list_sidebar_header">
                <h3 className="product_list_sidebar_title">
                  <FaFilter /> Bộ lọc
                </h3>
                <button
                  className="product_list_sidebar_close"
                  onClick={() => setShowFilters(false)}
                  aria-label="Đóng bộ lọc"
                >
                  ×
                </button>
              </div>

              {/* Category Filter */}
              <div className="product_list_filter_group">
                <h4 className="product_list_filter_title">Danh mục</h4>
                <div className="product_list_filter_options">
                  {categories.map((category) => (
                    <label key={category} className="product_list_filter_option">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="product_list_filter_group">
                <h4 className="product_list_filter_title">Thương hiệu</h4>
                <div className="product_list_filter_options">
                  {brands.map((brand) => (
                    <label key={brand} className="product_list_filter_option">
                      <input
                        type="radio"
                        name="brand"
                        value={brand}
                        checked={selectedBrand === brand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="product_list_filter_group">
                <h4 className="product_list_filter_title">Khoảng giá</h4>
                <div className="product_list_filter_options">
                  {priceRanges.map((range, index) => (
                    <label key={index} className="product_list_filter_option">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPriceRange.label === range.label}
                        onChange={() => setSelectedPriceRange(range)}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="product_list_filter_group">
                <h4 className="product_list_filter_title">Đánh giá</h4>
                <div className="product_list_filter_options">
                  {ratings.map((rating) => (
                    <label key={rating} className="product_list_filter_option">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      />
                      <span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            className={`product_list_star ${i < rating ? 'active' : ''}`}
                          />
                        ))}
                        <span className="product_list_rating_text"> trở lên</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters Button */}
              <button className="product_list_reset_btn" onClick={handleResetFilters}>
                Xóa bộ lọc
              </button>
            </aside>

            {/* Main Content */}
            <div className="product_list_main">
              {/* Header with Sort and Filter Toggle */}
              <div className="product_list_header">
                <div className="product_list_header_left">
                  <button
                    className="product_list_filter_toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FaFilter /> Bộ lọc
                  </button>
                  <p className="product_list_count">
                    Hiển thị {filteredProducts.length} sản phẩm
                  </p>
                </div>
                <div className="product_list_header_right">
                  <label className="product_list_sort_label">
                    Sắp xếp theo:
                    <select
                      className="product_list_sort_select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Mặc định</option>
                      <option value="price-low">Giá: Thấp đến cao</option>
                      <option value="price-high">Giá: Cao đến thấp</option>
                      <option value="rating">Đánh giá cao nhất</option>
                      <option value="reviews">Nhiều đánh giá nhất</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Products Grid */}
              <div className="product_list_grid">
                {filteredProducts.length === 0 ? (
                  <div className="product_list_empty">
                    <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
                    <button className="product_list_reset_btn" onClick={handleResetFilters}>
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="card">
                      <div className="card_top">
                        <Link to={`/products/${product.id}`}>
                          <img src={product.image} alt={product.title} className="card_img" />
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
                        <button className="add_to_cart">Thêm vào giỏ</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductList

