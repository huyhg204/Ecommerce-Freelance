import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaSearch, FaHeart, FaShoppingCart, FaUser } from 'react-icons/fa'

const accountMenu = [
  { label: 'Quản lý tài khoản', href: '/profile' },
  { label: 'Đơn hàng của tôi', href: '/orders' },
  { label: 'Danh sách yêu thích', href: '/wishlist' },
  { label: 'Đăng xuất', href: '/logout' },
]

const Nav = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen((prev) => !prev)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isUserMenuOpen &&
        !event.target.closest('.nav_user_btn') &&
        !event.target.closest('.nav_user_menu')
      ) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  return (
    <div>
      <div className="top_nav">
        <div className="container top_nav_container">
          <div className="top_nav_wrapper">
            <p className="tap_nav_p">
              Siêu ưu đãi mùa hè – miễn phí giao hàng, giảm tới 50%!
            </p>
            <Link to="/collections/summer-sale" className="top_nav_link">
              MUA NGAY
            </Link>
          </div>
        </div>
      </div>
      <nav className="nav">
        <div className="container nav_container">
          <Link to="/" className="nav_logo">
            EXCLUSIVE
          </Link>
          <ul className="nav_list">
            <li className="nav_item">
              <Link to="/" className="nav_link">
                Trang chủ
              </Link>
            </li>
            <li className="nav_item">
              <Link to="/products" className="nav_link">
                Sản phẩm
              </Link>
            </li>
            <li className="nav_item">
              <Link to="/about" className="nav_link">
                Giới thiệu
              </Link>
            </li>
            <li className="nav_item">
              <Link to="/contact" className="nav_link">
                Liên hệ
              </Link>
            </li>
            <li className="nav_item">
              <Link to="/register" className="nav_link">
                Đăng ký
              </Link>
            </li>
          </ul>
          <div className="nav_items">
            <form action="#" className="nav_form">
              <input type="text" className="nav_input" placeholder="Tìm kiếm sản phẩm..." />
              <FaSearch className="nav_search" aria-label="Tìm kiếm" />
            </form>
            <Link to="/wishlist" className="nav_heart" aria-label="Danh sách yêu thích">
              <FaHeart className="nav_heart" aria-label="Danh sách yêu thích" />
            </Link>
            <div className="nav_user_wrapper">
              <button
                type="button"
                className="nav_user_btn"
                onClick={handleUserMenuToggle}
                aria-label="Tài khoản"
              >
                <FaUser className="nav_user" />
              </button>
              {isUserMenuOpen && (
                <div className="nav_user_menu">
                  <p className="nav_user_menu_title">Xin chào, User</p>
                  <ul className="nav_user_menu_list">
                    {accountMenu.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.href}
                          className="nav_user_menu_link"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Link to="/cart">
              <FaShoppingCart className="nav_cart" aria-label="Giỏ hàng" />
            </Link>
          </div>
          <span className="hamburger">
            <FaBars className="w-6 h-6" />
          </span>
        </div>
      </nav>
      <nav className="mobile_nav mobile_nav_hide">
        <ul className="mobile_nav_list">
          <li className="mobile_nav_item">
            <Link to="/" className="mobile_nav_link">
              Trang chủ
            </Link>
          </li>
          <li className="mobile_nav_item">
            <Link to="/about" className="mobile_nav_link">
              Giới thiệu
            </Link>
          </li>
          <li className="mobile_nav_item">
            <Link to="/contact" className="mobile_nav_link">
              Liên hệ
            </Link>
          </li>
          <li className="mobile_nav_item">
            <Link to="/register" className="mobile_nav_link">
              Đăng ký
            </Link>
          </li>
          <li className="mobile_nav_item">
            <Link to="/cart" className="mobile_nav_link">
              Giỏ hàng
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Nav