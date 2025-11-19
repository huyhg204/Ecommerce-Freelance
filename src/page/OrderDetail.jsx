import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { authService } from '../utils/authService'

const OrderDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    if (id) {
      fetchOrderDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axiosInstance.get(`/user/orders/${id}`)
      if (response.data.status === 'success') {
        setOrder(response.data.data)
      } else {
        setError('Không tìm thấy đơn hàng')
      }
    } catch (error) {
      
      if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      } else if (error.response?.status === 403) {
        // Không có quyền truy cập
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản khách hàng.'
        setError(errorMessage)
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy đơn hàng')
      } else {
        setError(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getFinalStatus = (orderData) => {
    // Logic xác định trạng thái cuối cùng giống AdminOrderDetail
    if (!orderData) return { label: 'Không xác định', color: '#6c757d' }

    const statusUserOrder = orderData.status_user_order
    const statusOrder = orderData.status_order
    const statusDelivery = orderData.status_delivery

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

  // Hàm render workflow trạng thái đơn hàng
  const renderWorkflow = () => {
    if (!orderData) return null

    const isCancelled = orderData.status_user_order === 1
    const workflowSteps = []
    
    // Bước 1: Chờ xác nhận (status_order = 0)
    workflowSteps.push({
      step: 1,
      label: 'Chờ xác nhận',
      completed: !isCancelled && orderData.status_order >= 0,
      active: !isCancelled && orderData.status_order === 0,
      color: '#ffa500',
      cancelled: isCancelled
    })

    // Bước 2: Đang xử lý (status_order = 1)
    workflowSteps.push({
      step: 2,
      label: 'Đang xử lý',
      completed: !isCancelled && orderData.status_order >= 1,
      active: !isCancelled && orderData.status_order === 1,
      color: '#17a2b8',
      cancelled: isCancelled
    })

    // Bước 3: Đã giao cho bên vận chuyển (status_order = 2)
    workflowSteps.push({
      step: 3,
      label: 'Đã giao cho bên vận chuyển',
      completed: !isCancelled && orderData.status_order >= 2,
      active: !isCancelled && orderData.status_order === 2,
      color: '#28a745',
      cancelled: isCancelled
    })

    // Chỉ hiển thị các bước delivery khi status_order = 2
    if (orderData.status_order === 2) {
      // Bước 4: Đã nhận hàng (status_delivery = 0)
      workflowSteps.push({
        step: 4,
        label: 'Đã nhận hàng',
        completed: !isCancelled && orderData.status_delivery >= 0,
        active: !isCancelled && orderData.status_delivery === 0,
        color: '#ffa500',
        cancelled: isCancelled
      })

      // Bước 5: Đang giao hàng (status_delivery = 1)
      workflowSteps.push({
        step: 5,
        label: 'Đang giao hàng',
        completed: !isCancelled && orderData.status_delivery >= 1,
        active: !isCancelled && orderData.status_delivery === 1,
        color: '#17a2b8',
        cancelled: isCancelled
      })

      // Bước 6: Đã giao hàng (status_delivery = 2)
      workflowSteps.push({
        step: 6,
        label: 'Đã giao hàng',
        completed: !isCancelled && orderData.status_delivery >= 2,
        active: !isCancelled && orderData.status_delivery === 2,
        color: '#28a745',
        cancelled: isCancelled
      })
    }

    // Bước cuối: Trạng thái user order
    if (orderData.status_user_order === 0) {
      workflowSteps.push({
        step: workflowSteps.length + 1,
        label: 'Đã nhận hàng',
        completed: true,
        active: false,
        color: '#28a745',
        cancelled: false
      })
    } else if (orderData.status_user_order === 1) {
      workflowSteps.push({
        step: workflowSteps.length + 1,
        label: 'Đã hủy đơn',
        completed: true,
        active: true,
        color: '#dc3545',
        cancelled: false
      })
    }

    return (
      <div style={{ 
        marginBottom: '30px',
        padding: '15px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', fontWeight: 'bold', color: '#333' }}>
          Tiến trình đơn hàng
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0',
          minWidth: 'max-content',
          paddingBottom: '5px'
        }}>
          {workflowSteps.map((step, index) => {
            const isCancelledStep = step.cancelled
            const nextStep = workflowSteps[index + 1]
            const isNextCancelled = nextStep?.cancelled
            
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '6px', 
                  minWidth: '90px',
                  maxWidth: '90px',
                  padding: '0 5px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCancelledStep ? '#e0e0e0' : (step.completed ? step.color : '#e0e0e0'),
                    color: isCancelledStep ? '#999' : (step.completed ? 'white' : '#999'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    border: step.active ? `2px solid ${step.color}` : 'none',
                    boxShadow: step.active ? `0 0 0 2px rgba(25, 118, 210, 0.15)` : 'none',
                    zIndex: 2,
                    flexShrink: 0,
                    opacity: isCancelledStep ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}>
                    {step.label === 'Đã hủy đơn' ? '✕' : (step.completed && !isCancelledStep ? '✓' : step.step)}
                  </div>
                  <p style={{ 
                    fontSize: '1rem', 
                    fontWeight: step.active ? '600' : '400',
                    color: isCancelledStep ? '#999' : (step.completed ? '#333' : '#999'),
                    margin: 0,
                    textAlign: 'center',
                    lineHeight: '1.2',
                    opacity: isCancelledStep ? 0.6 : 1,
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {step.label}
                  </p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: isNextCancelled ? '#e0e0e0' : (nextStep?.completed ? nextStep.color : '#e0e0e0'),
                    margin: '0 2px',
                    marginTop: '16px',
                    flexShrink: 0,
                    opacity: isNextCancelled ? 0.5 : 1
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const orderData = order ? (order.order || order) : null
  const orderProducts = order ? (order.products || []) : []
  const finalStatus = orderData ? getFinalStatus(orderData) : null
  const paymentMethod = orderData ? getPaymentMethod(orderData.method_pay) : null
  const total = orderData ? (orderData.total_order || 0) : 0

  // Kiểm tra điều kiện để hiển thị nút xác nhận đơn
  // Điều kiện: status_delivery = 2 (đã giao hàng) — bắt buộc và status_user_order != 1 (chưa hủy) và status_user_order != 0 (chưa xác nhận)
  const canConfirmReceived = orderData && 
    orderData.status_delivery === 2 && // Đã giao hàng — bắt buộc
    orderData.status_user_order !== 1 && // Chưa hủy đơn
    orderData.status_user_order !== 0 // Chưa xác nhận đã nhận hàng

  // Kiểm tra điều kiện để hiển thị nút hủy đơn
  // Điều kiện 1: status_order = 0 (Chờ xác nhận) và status_user_order = null (chưa có hành động)
  // HOẶC Điều kiện 2: status_order = 1 (đang xử lý) và status_delivery != 2 (chưa giao) và status_user_order = null (chưa có hành động)
  const canCancelOrder = orderData && 
    (orderData.status_user_order === null || orderData.status_user_order === undefined) && // Chưa có hành động (bắt buộc)
    (
      (orderData.status_order === 0) || // Điều kiện 1: Chờ xác nhận - luôn cho phép hủy
      (orderData.status_order === 1 && orderData.status_delivery !== 2) // Điều kiện 2: Đang xử lý nhưng chưa giao hàng
    )

  const handleConfirmReceived = async () => {
    if (!canConfirmReceived) {
      toast.error('Không thể xác nhận đã nhận hàng. Đơn hàng chưa được giao hoặc đã bị hủy.')
      return
    }

    try {
      setUpdating(true)
      const response = await axiosInstance.put(`/user/orders/${id}/status`, {
        status_user_order: 0
      })
      
      if (response.data.status === 'success') {
        toast.success('Xác nhận đã nhận hàng thành công')
        fetchOrderDetail()
      } else {
        toast.error(response.data.message || 'Xác nhận đã nhận hàng thất bại')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Xác nhận đã nhận hàng thất bại'
      toast.error(errorMessage)
      console.error('Lỗi khi xác nhận đã nhận hàng:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn hàng')
      return
    }

    if (!canCancelOrder) {
      toast.error('Không thể hủy đơn hàng này')
      return
    }

    try {
      setUpdating(true)
      const response = await axiosInstance.put(`/user/orders/${id}/status`, {
        status_user_order: 1,
        reason_user_order: cancelReason.trim()
      })
      
      if (response.data.status === 'success') {
        toast.success('Hủy đơn hàng thành công')
        setShowCancelModal(false)
        setCancelReason('')
        fetchOrderDetail()
      } else {
        toast.error(response.data.message || 'Hủy đơn hàng thất bại')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Hủy đơn hàng thất bại'
      toast.error(errorMessage)
      console.error('Lỗi khi hủy đơn hàng:', error)
    } finally {
      setUpdating(false)
    }
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
            <Link to="/orders" className="breadcrumb_link">
              Đơn hàng của tôi
            </Link>
            <span className="breadcrumb_separator"> / </span>
            <span className="breadcrumb_current">Chi tiết đơn hàng #{id || (orderData?.id || '')}</span>
          </nav>
        </div>
      </section>

      {/* Order Detail Content */}
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
              <h2 className="profile_main_title">Thông tin đơn hàng</h2>
              
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
                    Đang tải chi tiết đơn hàng...
                  </p>
                </div>
              ) : error || !order ? (
                <div style={{ 
                  color: '#d32f2f', 
                  marginBottom: '20px', 
                  padding: '20px', 
                  backgroundColor: '#ffebee', 
                  border: '1px solid #ef5350',
                  borderRadius: '5px',
                  fontSize: '1.4rem'
                }}>
                  <strong>⚠️ Lỗi:</strong> {error || 'Không tìm thấy đơn hàng'}
                  {error && error.includes('Customer access only') && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ marginBottom: '10px', fontSize: '1.3rem' }}>
                        Có vẻ như tài khoản của bạn không có quyền truy cập trang này.
                      </p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <Link 
                          to="/orders" 
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            borderRadius: '5px',
                            textDecoration: 'none',
                            fontSize: '1.3rem'
                          }}
                        >
                          Quay lại danh sách đơn hàng
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
                          Đăng nhập lại
                        </Link>
                      </div>
                    </div>
                  )}
                  {!error && (
                    <div style={{ marginTop: '15px' }}>
                      <Link 
                        to="/orders" 
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
                        Quay lại danh sách đơn hàng
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Workflow */}
                  {renderWorkflow()}

                  {/* Order Header */}
                  <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <div>
                  <p style={{ fontSize: '1.4rem', color: '#666', marginBottom: '5px' }}>
                    Ngày đặt: {formatDate(orderData.date_order)}
                  </p>
                  <p style={{ fontSize: '1.4rem', color: '#666' }}>
                    Phương thức thanh toán: {paymentMethod}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {finalStatus && (
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
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', fontWeight: 'bold' }}>
                  Thông tin giao hàng
                </h3>
                <div style={{ 
                  backgroundColor: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <p style={{ fontSize: '1.4rem' }}>
                    <strong>Người nhận:</strong> {orderData.name_customer || 'N/A'}
                  </p>
                  <p style={{ fontSize: '1.4rem' }}>
                    <strong>Địa chỉ:</strong> {orderData.address_customer || 'N/A'}
                  </p>
                  <p style={{ fontSize: '1.4rem' }}>
                    <strong>Số điện thoại:</strong> {orderData.phone_customer || 'N/A'}
                  </p>
                  {orderData.note_customer && (
                    <p style={{ fontSize: '1.4rem' }}>
                      <strong>Ghi chú:</strong> {orderData.note_customer}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', fontWeight: 'bold' }}>
                  Sản phẩm
                </h3>
                <div style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {/* Table Header */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderBottom: '1px solid #e0e0e0',
                    fontWeight: 'bold',
                    fontSize: '1.4rem'
                  }}>
                    <div>Sản phẩm</div>
                    <div style={{ textAlign: 'right' }}>Giá</div>
                    <div style={{ textAlign: 'center' }}>Số lượng</div>
                    <div style={{ textAlign: 'right' }}>Tổng tiền</div>
                  </div>
                  
                  {/* Table Body */}
                  <div>
                    {orderProducts.length > 0 ? (
                      orderProducts.map((product, index) => {
                        const productName = product.name_product || 'Sản phẩm'
                        const productImage = product.image_product || ''
                        const quantity = product.quantity_detail || 0
                        const totalDetail = product.total_detail || 0
                        const unitPrice = quantity > 0 ? totalDetail / quantity : 0

                        return (
                          <div 
                            key={index} 
                            style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '2fr 1fr 1fr 1fr',
                              padding: '15px',
                              borderBottom: index < orderProducts.length - 1 ? '1px solid #e0e0e0' : 'none',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '5px'
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '5px',
                                    fontSize: '1.2rem',
                                    color: '#999'
                                  }}
                                >
                                  No Image
                                </div>
                              )}
                              <span style={{ fontSize: '1.4rem' }}>{productName}</span>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '1.4rem' }}>
                              {formatCurrency(unitPrice)}
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '1.4rem' }}>
                              {quantity}
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '1.4rem', fontWeight: 'bold' }}>
                              {formatCurrency(totalDetail)}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.4rem', color: '#666' }}>
                        Không có sản phẩm
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ 
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Tổng cộng:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1976d2' }}>
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginTop: '20px' }}>
                <Link 
                  to="/orders" 
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    fontSize: '1.4rem',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  ← Quay lại danh sách đơn hàng
                </Link>

                {/* Nút xác nhận đã nhận hàng */}
                {canConfirmReceived && (
                  <button
                    onClick={handleConfirmReceived}
                    disabled={updating}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontSize: '1.4rem',
                      fontWeight: '500',
                      opacity: updating ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (!updating) {
                        e.target.style.backgroundColor = '#218838'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!updating) {
                        e.target.style.backgroundColor = '#28a745'
                      }
                    }}
                  >
                    {updating ? (
                      <>
                        <ClipLoader color="#fff" size={16} />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '1.6rem' }}>✓</span>
                        <span>Xác nhận đã nhận hàng</span>
                      </>
                    )}
                  </button>
                )}

                {/* Nút hủy đơn hàng */}
                {canCancelOrder && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={updating}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontSize: '1.4rem',
                      fontWeight: '500',
                      opacity: updating ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (!updating) {
                        e.target.style.backgroundColor = '#c82333'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!updating) {
                        e.target.style.backgroundColor = '#dc3545'
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>✕</span>
                    <span>Hủy đơn hàng</span>
                  </button>
                )}
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal hủy đơn hàng */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => !updating && setShowCancelModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>
              Hủy đơn hàng
            </h2>
            <p style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#666' }}>
              Vui lòng nhập lý do hủy đơn hàng:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              rows="4"
              disabled={updating}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1.4rem',
                border: '1px solid #e0e0e0',
                borderRadius: '5px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '20px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                disabled={updating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '1.4rem',
                  opacity: updating ? 0.6 : 1
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={updating || !cancelReason.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: updating || !cancelReason.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1.4rem',
                  opacity: updating || !cancelReason.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {updating ? (
                  <>
                    <ClipLoader color="#fff" size={16} />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Xác nhận hủy</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail

