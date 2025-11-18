import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaSearch, FaHeart, FaShoppingCart, FaUser } from 'react-icons/fa'
import { authService } from '../utils/authService'
import { axiosInstance } from '../utils/axiosConfig'

const Nav = () => {
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
    if (authService.isAuthenticated()) {
      fetchUser()
    }
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'user') {
        checkAuth()
        if (authService.isAuthenticated()) {
          fetchUser()
        }
      }
    }
    
    // Listen for custom auth event (when user logs in/out in same tab)
    const handleAuthChange = () => {
      checkAuth()
      if (authService.isAuthenticated()) {
        fetchUser()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  const checkAuth = () => {
    setIsAuthenticated(authService.isAuthenticated())
    setUser(authService.getUser())
  }

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/user')
      if (response.data.status === 'success') {
        const userData = response.data.data
        setUser(userData)
        authService.setUser(userData)
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout')
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error)
    } finally {
      authService.removeToken()
      setIsAuthenticated(false)
      setUser(null)
      setIsUserMenuOpen(false)
      navigate('/')
      window.location.reload()
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchKeyword.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const accountMenu = [
    { label: 'Quản lý tài khoản', href: '/profile', action: null },
    { label: 'Đơn hàng của tôi', href: '/orders', action: null },
    { label: 'Danh sách yêu thích', href: '/wishlist', action: null },
    { label: 'Đăng xuất', href: '#', action: handleLogout },
  ]

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
            {!isAuthenticated && (
              <li className="nav_item">
                <Link to="/register" className="nav_link">
                  Đăng ký
                </Link>
              </li>
            )}
          </ul>
          <div className="nav_items">
            <form onSubmit={handleSearch} className="nav_form">
              <input 
                type="text" 
                className="nav_input" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="nav_search_btn" aria-label="Tìm kiếm">
                <FaSearch className="nav_search" />
              </button>
            </form>
            <Link to="/wishlist" className="nav_heart" aria-label="Danh sách yêu thích">
              <FaHeart />
            </Link>
            {isAuthenticated ? (
              <div className="nav_user_wrapper">
                <button
                  type="button"
                  className="nav_user_btn"
                  onClick={handleUserMenuToggle}
                  aria-label="Tài khoản"
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <FaUser className="nav_user" />
                </button>
                {isUserMenuOpen && (
                  <div className="nav_user_menu">
                    <p className="nav_user_menu_title">
                      Xin chào, {user?.name || user?.email || 'User'}
                    </p>
                    <ul className="nav_user_menu_list">
                      {accountMenu.map((item) => (
                        <li key={item.label}>
                          {item.action ? (
                            <button
                              type="button"
                              className="nav_user_menu_link"
                              onClick={(e) => {
                                e.preventDefault()
                                item.action()
                                setIsUserMenuOpen(false)
                              }}
                              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}
                            >
                              {item.label}
                            </button>
                          ) : (
                            <Link
                              to={item.href}
                              className="nav_user_menu_link"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsUserMenuOpen(false)
                              }}
                              style={{ display: 'block', padding: '0.5rem 0' }}
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav_user_btn" aria-label="Đăng nhập">
                <FaUser className="nav_user" />
              </Link>
            )}
            <Link to="/cart" className="nav_cart" aria-label="Giỏ hàng">
              <FaShoppingCart />
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