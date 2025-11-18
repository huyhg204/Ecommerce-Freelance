import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { authService } from '../utils/authService'

// Helper function để lấy cart items từ API
const fetchCartItems = async () => {
  const response = await axiosInstance.get('/cart')
  if (response.data.status === 'success' && response.data.data?.cart) {
    return response.data.data.cart
  }
  return []
}

// Helper function để clear cart trên server
const clearCartOnServer = async () => {
  try {
    const cartItems = await fetchCartItems()
    await Promise.all(
      cartItems.map(async (item) => {
        try {
          await axiosInstance.post('/cart/remove', { product_id: item.product_id })
        } catch (error) {
          console.error(`Lỗi khi xóa item ${item.product_id}:`, error)
        }
      })
    )
  } catch (error) {
    console.error('Lỗi khi clear cart:', error)
  }
}

// Helper function để xử lý error từ API
const handleApiError = (error) => {
  if (error.response?.status === 400 || error.response?.status === 422) {
    const errorData = error.response.data
    if (errorData.errors) {
      // Laravel validation errors format: {errors: {field: [messages]}}
      return Object.values(errorData.errors).flat().join(', ')
    }
    return errorData.message || errorData.error || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
  }
  return error.response?.data?.message || error.response?.data?.error || 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
}

const CheckOut = () => {
  const navigate = useNavigate()
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name_customer: '',
    address_customer: '',
    phone_customer: '',
    note: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [couponCode, setCouponCode] = useState('')
  const [error, setError] = useState('')

  // Lấy giỏ hàng khi component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    // Pre-fill thông tin user nếu có
    const user = authService.getUser()
    if (user && user.name) {
      setFormData(prev => ({
        ...prev,
        name_customer: user.name
      }))
    }
    fetchCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const items = await fetchCartItems()
      setOrderItems(items)
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error)
      setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.')
      setOrderItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.name_customer.trim()) {
      setError('Vui lòng nhập tên khách hàng')
      return false
    }
    if (!formData.address_customer.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng')
      return false
    }
    if (!formData.phone_customer.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!validateForm()) {
      return
    }

    // Kiểm tra authentication
    if (!authService.isAuthenticated()) {
      setError('Vui lòng đăng nhập để đặt hàng')
      navigate('/login')
      return
    }

    setSubmitting(true)

    try {
      // Refresh cart trước khi checkout để đảm bảo có dữ liệu mới nhất
      const currentCartItems = await fetchCartItems()

      if (currentCartItems.length === 0) {
        setError('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.')
        setSubmitting(false)
        return
      }

      setOrderItems(currentCartItems)

      // Chuẩn bị dữ liệu gửi API theo format mới
      const checkoutData = {
        name_customer: formData.name_customer,
        address_customer: formData.address_customer,
        phone_customer: formData.phone_customer,
        note: formData.note || '',
      }

      // Gửi request checkout
      const response = await axiosInstance.post('/checkout', checkoutData)

      if (response.data.status === 'success') {
        // Clear form và cart sau khi checkout thành công
        const user = authService.getUser()
        setFormData({
          name_customer: user && user.name ? user.name : '',
          address_customer: '',
          phone_customer: '',
          note: '',
        })
        setOrderItems([])

        // Clear cart trên server
        await clearCartOnServer()

        toast.success('Đặt hàng thành công!', {
          description: 'Đơn hàng của bạn đã được xử lý thành công.',
          duration: 3000,
        })
        navigate('/')
      } else {
        setError(response.data.message || 'Đặt hàng thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      setError(handleApiError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }
    // Logic apply coupon
    toast.success('Mã giảm giá đã được áp dụng!', {
      description: `Mã ${couponCode} đã được áp dụng thành công.`,
    })
  }

  // Tính toán tổng tiền
  const { subtotal, total } = useMemo(() => {
    const sub = orderItems.reduce((sum, item) => {
      return sum + (item.price_product * item.quantity_item)
    }, 0)
    return {
      subtotal: sub,
      total: sub, // Free shipping
    }
  }, [orderItems])

  // Helper function để lấy thông tin sản phẩm từ item
  const getProductInfo = (item) => {
    return {
      id: item.product_id,
      name: item.name_product,
      image: item.image_product,
      price: item.price_product,
      quantity: item.quantity_item,
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
            <Link to="/cart" className="breadcrumb_link">
              Giỏ hàng
            </Link>
            <span className="breadcrumb_separator"> / </span>
            <span className="breadcrumb_current">Thanh toán</span>
          </nav>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '2.4rem', marginBottom: '30px', fontWeight: 'bold' }}>
            Thanh toán
          </h2>
          
          {error && (
            <div style={{ 
              color: '#d32f2f', 
              marginBottom: '20px', 
              padding: '15px 20px', 
              backgroundColor: '#ffebee', 
              border: '1px solid #ef5350',
              borderRadius: '8px',
              fontSize: '1.4rem'
            }}>
              <strong>⚠️ Lỗi:</strong> {error}
            </div>
          )}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '30px',
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            {/* Left Column - Billing Details */}
            <div style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '25px', fontWeight: 'bold' }}>
                Thông tin giao hàng
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '1.4rem',
                    fontWeight: '500'
                  }}>
                    Tên khách hàng <span style={{ color: '#d32f2f' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name_customer"
                    value={formData.name_customer}
                    onChange={handleInputChange}
                    placeholder="Nhập tên khách hàng"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '1.4rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '1.4rem',
                    fontWeight: '500'
                  }}>
                    Địa chỉ giao hàng <span style={{ color: '#d32f2f' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="address_customer"
                    value={formData.address_customer}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ giao hàng"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '1.4rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '1.4rem',
                    fontWeight: '500'
                  }}>
                    Số điện thoại <span style={{ color: '#d32f2f' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_customer"
                    value={formData.phone_customer}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '1.4rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '1.4rem',
                    fontWeight: '500'
                  }}>
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '1.4rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || orderItems.length === 0}
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '1.6rem',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: orderItems.length === 0 ? '#ccc' : '#1976d2',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: orderItems.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (orderItems.length > 0 && !submitting) {
                      e.target.style.backgroundColor = '#1565c0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (orderItems.length > 0) {
                      e.target.style.backgroundColor = '#1976d2'
                    }
                  }}
                >
                  {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              height: 'fit-content',
              position: 'sticky',
              top: '20px'
            }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '25px', fontWeight: 'bold' }}>
                Tóm tắt đơn hàng
              </h3>

              {/* Order Items */}
              <div style={{ marginBottom: '25px', maxHeight: '300px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '200px',
                    padding: '40px 0',
                    gap: '15px'
                  }}>
                    <ClipLoader color="#1976d2" size={40} />
                    <p style={{ fontSize: '1.4rem', color: '#666', marginTop: '10px' }}>
                      Đang tải đơn hàng...
                    </p>
                  </div>
                ) : orderItems.length === 0 ? (
                  <p style={{ fontSize: '1.4rem', color: '#666', textAlign: 'center', padding: '20px' }}>
                    Giỏ hàng trống
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {orderItems.map((item) => {
                      const product = getProductInfo(item)
                      return (
                        <div 
                          key={product.id} 
                          style={{
                            display: 'flex',
                            gap: '15px',
                            paddingBottom: '15px',
                            borderBottom: '1px solid #e0e0e0'
                          }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '5px'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '80px',
                                height: '80px',
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
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '1.4rem', marginBottom: '5px', fontWeight: '500' }}>
                              {product.name}
                            </p>
                            <p style={{ fontSize: '1.3rem', color: '#666' }}>
                              Số lượng: {product.quantity}
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2', marginTop: '5px' }}>
                              {formatCurrency(product.price * product.quantity)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Order Totals */}
              <div style={{ 
                marginBottom: '25px',
                paddingTop: '20px',
                borderTop: '2px solid #e0e0e0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '10px',
                  fontSize: '1.4rem'
                }}>
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '10px',
                  fontSize: '1.4rem'
                }}>
                  <span>Phí vận chuyển:</span>
                  <span style={{ color: '#28a745' }}>Miễn phí</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: '15px',
                  borderTop: '1px solid #e0e0e0',
                  fontSize: '1.8rem',
                  fontWeight: 'bold'
                }}>
                  <span>Tổng cộng:</span>
                  <span style={{ color: '#1976d2' }}>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment Options */}
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ fontSize: '1.6rem', marginBottom: '15px', fontWeight: 'bold' }}>
                  Phương thức thanh toán
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1.4rem'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Thanh toán qua ngân hàng</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1.4rem'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Thanh toán khi nhận hàng</span>
                  </label>
                </div>
              </div>

              {/* Coupon Section */}
              <div>
                <h4 style={{ fontSize: '1.6rem', marginBottom: '15px', fontWeight: 'bold' }}>
                  Mã giảm giá
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 15px',
                      fontSize: '1.4rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    style={{
                      padding: '12px 20px',
                      fontSize: '1.4rem',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CheckOut
