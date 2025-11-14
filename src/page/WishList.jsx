import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaTrash, FaEye, FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'

const wishlistProducts = [
  {
    id: 1,
    title: 'Túi duffle Gucci',
    price: 960,
    originalPrice: 1160,
    discount: '-35%',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Tản nhiệt CPU RGB',
    price: 1960,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Tay cầm Gaming GP11',
    price: 550,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Áo khoác Satin',
    price: 750,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  },
]

const justForYouProducts = [
  {
    id: 5,
    title: 'Laptop Gaming ASUS FHD',
    price: 960,
    originalPrice: 1160,
    discount: '-35%',
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    reviews: 65,
  },
  {
    id: 6,
    title: 'Màn hình Gaming IPS LCD',
    price: 1160,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    reviews: 65,
  },
  {
    id: 7,
    title: 'Tay cầm Gaming HAVIT HV-G92',
    price: 560,
    image: 'https://images.unsplash.com/photo-1614680376573-e720cdb88866?auto=format&fit=crop&w=600&q=80',
    badge: 'Mới',
    rating: 5,
    reviews: 65,
  },
  {
    id: 8,
    title: 'Bàn phím cơ AK-900',
    price: 200,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    reviews: 65,
  },
]

const WishList = () => {
  const [wishlistItems, setWishlistItems] = useState(wishlistProducts)

  const handleRemoveFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
  }

  const handleMoveAllToBag = () => {
    // Logic to move all items to cart
    alert('Tất cả sản phẩm đã được thêm vào giỏ hàng!')
  }

  const handleAddToCart = (product) => {
    // Logic to add product to cart
    alert(`${product.title} đã được thêm vào giỏ hàng!`)
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
            <span className="breadcrumb_current">Danh sách yêu thích</span>
          </nav>
        </div>
      </section>

      {/* Wishlist Section */}
      <section className="section">
        <div className="container">
          <div className="wishlist_header">
            <h2 className="wishlist_title">Danh sách yêu thích ({wishlistItems.length})</h2>
            {wishlistItems.length > 0 && (
              <button className="wishlist_move_all_btn" onClick={handleMoveAllToBag}>
                Chuyển tất cả vào giỏ hàng
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="wishlist_empty">
              <FaHeart className="wishlist_empty_icon" />
              <p className="wishlist_empty_text">Danh sách yêu thích của bạn đang trống</p>
              <Link to="/products" className="wishlist_empty_link">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="wishlist_grid">
              {wishlistItems.map((product) => (
                <div key={product.id} className="card">
                  <div className="card_top">
                    <Link to={`/products/${product.id}`}>
                      <img src={product.image} alt={product.title} className="card_img" />
                    </Link>
                    {product.discount && (
                      <div className="card_tag">{product.discount}</div>
                    )}
                    <button
                      className="wishlist_remove_btn"
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      aria-label="Xóa khỏi danh sách yêu thích"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="card_body">
                    <Link to={`/products/${product.id}`} className="card_title_link">
                      <h3 className="card_title">{product.title}</h3>
                    </Link>
                    <div className="card_price_wrapper">
                      <p className="card_price">{formatCurrency(product.price)}</p>
                      {product.originalPrice && (
                        <p className="card_price_original">
                          {formatCurrency(product.originalPrice)}
                        </p>
                      )}
                    </div>
                    <button
                      className="add_to_cart wishlist_add_to_cart"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FaShoppingCart /> Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Just For You Section */}
      <section className="section">
        <div className="container">
          <div className="wishlist_section_header">
            <div className="wishlist_section_header_left">
              <div className="wishlist_section_bar"></div>
              <h3 className="wishlist_section_title">Dành cho bạn</h3>
            </div>
            <Link to="/products" className="wishlist_see_all_btn">
              Xem tất cả
            </Link>
          </div>

          <div className="wishlist_grid">
            {justForYouProducts.map((product) => (
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
                    <Link
                      to={`/products/${product.id}`}
                      className="card_top_icon_btn"
                      aria-label="Xem nhanh"
                    >
                      <FaEye />
                    </Link>
                  </div>
                </div>
                <div className="card_body">
                  <Link to={`/products/${product.id}`} className="card_title_link">
                    <h3 className="card_title">{product.title}</h3>
                  </Link>
                  <div className="card_price_wrapper">
                    <p className="card_price">{formatCurrency(product.price)}</p>
                    {product.originalPrice && (
                      <p className="card_price_original">
                        {formatCurrency(product.originalPrice)}
                      </p>
                    )}
                  </div>
                  <div className="card_ratings">
                    <div className="card_stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FaStar
                          key={index}
                          className={`w-6 h-6 ${index < product.rating ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                    <p className="card_rating_numbers">({product.reviews})</p>
                  </div>
                  <button className="add_to_cart">Thêm vào giỏ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default WishList

