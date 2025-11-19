import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { toast } from 'sonner'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { authService } from '../utils/authService'

const Orders = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 2

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Thử refresh user info từ backend để đảm bảo có thông tin mới nhất
      try {
        const userResponse = await axiosInstance.get('/user')
        if (userResponse.data.status === 'success') {
          const updatedUser = userResponse.data.data
          authService.setUser(updatedUser)
        }
      } catch (userError) {
        // Tiếp tục với user info hiện tại
      }
      
      const response = await axiosInstance.get('/user/orders')
      if (response.data.status === 'success') {
        const data = response.data.data
        // API trả về { orders: [...], pagination: {...} }
        const ordersList = Array.isArray(data?.orders) ? data.orders : (Array.isArray(data) ? data : [])
        setOrders(ordersList)
        if (ordersList.length === 0) {
          setError('Bạn chưa có đơn hàng nào')
        }
      } else {
        setOrders([])
        setError('Không thể tải danh sách đơn hàng')
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Token không hợp lệ hoặc hết hạn
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        // Interceptor sẽ tự động redirect về login
      } else if (error.response?.status === 403) {
        // Không có quyền truy cập
        const user = authService.getUser()
        
        // Tạo thông báo lỗi chi tiết hơn
        let errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập trang này.'
        
        // Nếu là admin, thông báo rõ ràng hơn
        if (user?.role_user === 1) {
          errorMessage = 'Tài khoản Admin không thể truy cập trang đơn hàng của khách hàng. Vui lòng đăng nhập với tài khoản khách hàng (Customer) để xem đơn hàng.'
        } else {
          errorMessage += ' Vui lòng đăng nhập với tài khoản khách hàng.'
        }
        
        setError(errorMessage)
      } else {
        setError(error.response?.data?.message || 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.')
      }
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getFinalStatus = (order) => {
    // Logic xác định trạng thái cuối cùng giống AdminOrderDetail
    const statusUserOrder = order.status_user_order
    const statusOrder = order.status_order
    const statusDelivery = order.status_delivery

    // Nếu đã hủy đơn
    if (statusUserOrder === 1) {
      return { label: 'Đã hủy đơn', color: '#dc3545' }
    }

    // Nếu Đã nhận hàng
    if (statusUserOrder === 0 && statusOrder === 2 && statusDelivery === 2) {
      return { label: 'Đã nhận hàng', color: '#28a745' }
    }

    // Nếu đã giao cho bên vận chuyển, kiểm tra trạng thái giao hàng
    if (statusOrder === 2) {
      if (statusDelivery === 2) {
        return { label: 'Đã giao hàng', color: '#28a745' }
      } else if (statusDelivery === 1) {
        return { label: 'Đang giao hàng', color: '#17a2b8' }
      } else if (statusDelivery === 0) {
        return { label: 'Đã nhận hàng', color: '#ffa500' }
      } else {
        return { label: 'Đã giao cho bên vận chuyển', color: '#28a745' }
      }
    }

    // Các trạng thái đơn hàng ban đầu
    if (statusOrder === 1) {
      return { label: 'Đang xử lý', color: '#17a2b8' }
    }

    if (statusOrder === 0) {
      return { label: 'Chờ xác nhận', color: '#ffa500' }
    }

    return { label: 'Không xác định', color: '#6c757d' }
  }

  const getPaymentMethod = (methodPay) => {
    // method_pay: 0 = cash, 1 = bank
    const methodMap = {
      0: 'Thanh toán khi nhận hàng',
      1: 'Thanh toán qua ngân hàng',
    }
    return methodMap[methodPay] || 'Không xác định'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSearchOrder = async (e) => {
    e.preventDefault()
    if (!orderCode.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng')
      return
    }

    setIsSearching(true)
    try {
      const response = await axiosInstance.post('/search-order', {
        order_code: orderCode.trim()
      })
      
      if (response.data.status === 'success' && response.data.data?.order) {
        const orderId = response.data.data.order.id
        navigate(`/orders/${orderId}`)
        setOrderCode('')
        toast.success('Tìm thấy đơn hàng')
      } else {
        toast.error('Không tìm thấy đơn hàng với mã này')
      }
    } catch (error) {
      toast.error('Không tìm thấy đơn hàng', {
        description: error.response?.data?.message || 'Vui lòng kiểm tra lại mã đơn hàng.'
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Reset to page 1 when orders change
  useEffect(() => {
    setCurrentPage(1)
  }, [orders.length])

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = orders.slice(startIndex, endIndex)

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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
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
            <span className="breadcrumb_current">Đơn hàng của tôi</span>
          </nav>
        </div>
      </section>

      {/* Orders Content */}
      <section className="section">
        <div className="container">
          <div className="profile_wrapper">
            {/* Left Sidebar */}
            <aside className="profile_sidebar">
              <div className="profile_sidebar_section">
                <h3 className="profile_sidebar_title">Quản lý tài khoản</h3>
                <ul className="profile_sidebar_list">
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/profile" 
                      className={`profile_sidebar_link ${location.pathname === '/profile' ? 'active' : ''}`}
                    >
                      Thông tin tài khoản
                    </Link>
                  </li>
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/profile/address" 
                      className={`profile_sidebar_link ${location.pathname === '/profile/address' ? 'active' : ''}`}
                    >
                      Address Book
                    </Link>
                  </li>
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/profile/payment" 
                      className={`profile_sidebar_link ${location.pathname === '/profile/payment' ? 'active' : ''}`}
                    >
                      My Payment Options
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="profile_sidebar_section">
                <h3 className="profile_sidebar_title">Đơn hàng của tôi</h3>
                <ul className="profile_sidebar_list">
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/orders" 
                      className={`profile_sidebar_link ${location.pathname === '/orders' || location.pathname.startsWith('/orders/') ? 'active' : ''}`}
                    >
                      Đơn hàng của tôi
                    </Link>
                  </li>
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/profile/returns" 
                      className={`profile_sidebar_link ${location.pathname === '/profile/returns' ? 'active' : ''}`}
                    >
                      My Returns
                    </Link>
                  </li>
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/profile/cancellations" 
                      className={`profile_sidebar_link ${location.pathname === '/profile/cancellations' ? 'active' : ''}`}
                    >
                      My Cancellations
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="profile_sidebar_section">
                <h3 className="profile_sidebar_title">Danh sách yêu thích</h3>
                <ul className="profile_sidebar_list">
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/wishlist" 
                      className={`profile_sidebar_link ${location.pathname === '/wishlist' ? 'active' : ''}`}
                    >
                      Danh sách yêu thích
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Right Main Content */}
            <div className="profile_main">
              {loading ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '400px',
                  gap: '15px'
                }}>
                  <ClipLoader color="#1976d2" size={50} />
                  <p style={{ fontSize: '1.4rem', color: '#666' }}>
                    Đang tải danh sách đơn hàng...
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '25px',
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}>
                    <h2 className="profile_main_title" style={{ margin: 0 }}>Danh sách đơn hàng</h2>
                    
                    {/* Search Order Form */}
                    <form 
                      onSubmit={handleSearchOrder}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        flex: '0 0 auto'
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Tìm đơn hàng theo mã..."
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                        disabled={isSearching}
                        style={{
                          padding: '10px 15px',
                          fontSize: '1.4rem',
                          border: '1px solid #e0e0e0',
                          borderRadius: '5px',
                          outline: 'none',
                          minWidth: '250px',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <button
                        type="submit"
                        disabled={isSearching || !orderCode.trim()}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: isSearching || !orderCode.trim() ? 'not-allowed' : 'pointer',
                          opacity: isSearching || !orderCode.trim() ? 0.6 : 1,
                          fontSize: '1.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: '500',
                          transition: 'opacity 0.2s'
                        }}
                      >
                        {isSearching ? (
                          <>
                            <ClipLoader color="#fff" size={16} />
                            <span>Đang tìm...</span>
                          </>
                        ) : (
                          <>
                            <FaSearch />
                            <span>Tìm kiếm</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {error && (
                <div style={{ 
                  color: '#d32f2f', 
                  marginBottom: '20px', 
                  padding: '20px', 
                  backgroundColor: '#ffebee', 
                  border: '1px solid #ef5350',
                  borderRadius: '5px',
                  fontSize: '1.4rem'
                }}>
                  <strong>⚠️ Lỗi:</strong> {error}
                  {(error.includes('Customer access only') || error.includes('Admin không thể truy cập')) && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ marginBottom: '10px', fontSize: '1.3rem' }}>
                        {authService.getUser()?.role_user === 1 
                          ? 'Tài khoản Admin không thể xem đơn hàng của khách hàng. Vui lòng đăng nhập với tài khoản Customer để sử dụng tính năng này.'
                          : 'Có vẻ như tài khoản của bạn không có quyền truy cập trang này.'}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <Link 
                          to="/profile" 
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            borderRadius: '5px',
                            textDecoration: 'none',
                            fontSize: '1.3rem'
                          }}
                        >
                          Về trang tài khoản
                        </Link>
                        <Link 
                          to="/login" 
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '5px',
                            textDecoration: 'none',
                            fontSize: '1.3rem'
                          }}
                        >
                          {authService.getUser()?.role_user === 1 ? 'Đăng nhập với tài khoản Customer' : 'Đăng nhập lại'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!error && orders.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: '1.6rem', marginBottom: '20px', color: '#666' }}>
                    Bạn chưa có đơn hàng nào
                  </p>
                  <Link 
                    to="/products" 
                    style={{
                      display: 'inline-block',
                      padding: '12px 24px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      borderRadius: '5px',
                      textDecoration: 'none',
                      fontSize: '1.4rem'
                    }}
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              ) : (
                <>
                <div className="orders_list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {paginatedOrders.map((order) => {
                    const finalStatus = getFinalStatus(order)
                    const paymentMethod = getPaymentMethod(order.method_pay)

                    return (
                      <div 
                        key={order.id} 
                        style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '20px',
                          backgroundColor: '#fff'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '15px',
                          paddingBottom: '15px',
                          borderBottom: '1px solid #e0e0e0'
                        }}>
                          <div>
                            <p style={{ marginBottom: '8px', fontSize: '1.5rem' }}>
                              <strong>Mã đơn hàng: #{order.id}</strong>
                            </p>
                            <p style={{ marginBottom: '5px', fontSize: '1.3rem', color: '#666' }}>
                              Ngày đặt: {formatDate(order.date_order)}
                            </p>
                            <p style={{ marginBottom: '5px', fontSize: '1.3rem', color: '#666' }}>
                              Phương thức thanh toán: {paymentMethod}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <span
                              style={{
                                padding: '8px 16px',
                                borderRadius: '5px',
                                color: 'white',
                                fontSize: '1.3rem',
                                backgroundColor: finalStatus.color
                              }}
                            >
                              {finalStatus.label}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <p style={{ marginBottom: '8px', fontSize: '1.4rem' }}>
                            <strong>Người nhận:</strong> {order.name_customer}
                          </p>
                          <p style={{ marginBottom: '8px', fontSize: '1.4rem' }}>
                            <strong>Địa chỉ:</strong> {order.address_customer}
                          </p>
                          <p style={{ marginBottom: '8px', fontSize: '1.4rem' }}>
                            <strong>Số điện thoại:</strong> {order.phone_customer}
                          </p>
                          {order.note_customer && (
                            <p style={{ marginBottom: '8px', fontSize: '1.4rem' }}>
                              <strong>Ghi chú:</strong> {order.note_customer}
                            </p>
                          )}
                        </div>

                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          paddingTop: '15px',
                          borderTop: '1px solid #e0e0e0'
                        }}>
                          <div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                              Tổng tiền: {formatCurrency(order.total_order)}
                            </span>
                          </div>
                          <Link
                            to={`/orders/${order.id}`}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              borderRadius: '5px',
                              textDecoration: 'none',
                              fontSize: '1.4rem'
                            }}
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {!loading && orders.length > 0 && totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '30px',
                    flexWrap: 'wrap'
                  }}>
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

                {/* Info */}
                {!loading && orders.length > 0 && (
                  <div style={{
                    textAlign: 'center',
                    marginTop: '15px',
                    fontSize: '1.3rem',
                    color: '#666'
                  }}>
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, orders.length)} trong tổng số {orders.length} đơn hàng
                  </div>
                )}
                  </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Orders

