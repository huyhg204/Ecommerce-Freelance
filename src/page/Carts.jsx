import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { authService } from '../utils/authService'

const Carts = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([])
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCart = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    
    try {
      setLoading(true)
      const response = await axiosInstance.get('/cart')
      if (response.data.status === 'success' && response.data.data?.cart) {
        setCartItems(response.data.data.cart)
      } else {
        setCartItems([])
      }
    } catch (error) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    try {
      await axiosInstance.post('/cart/add', {
        product_id: productId,
        quantity: newQuantity,
      })
      // Cập nhật local state
      setCartItems(
        cartItems.map((item) => 
          item.product_id === productId
            ? { ...item, quantity_item: newQuantity, total_item: item.price_product * newQuantity }
            : item
        )
      )
    } catch (error) {
      toast.error('Không thể cập nhật số lượng', {
        description: 'Vui lòng thử lại sau.',
      })
    }
  }

  const removeItem = async (productId) => {
    try {
      await axiosInstance.post('/cart/remove', {
        product_id: productId,
      })
      setCartItems(cartItems.filter((item) => item.product_id !== productId))
    } catch (error) {
      toast.error('Không thể xóa sản phẩm', {
        description: 'Vui lòng thử lại sau.',
      })
    }
  }

  // Lấy giỏ hàng từ API
  useEffect(() => {
    fetchCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price_product * item.quantity_item)
  }, 0)
  const shipping = 0 // Free shipping
  const total = subtotal + shipping

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
            <span className="breadcrumb_current">Giỏ hàng</span>
          </nav>
        </div>
      </section>

      {/* Cart Content */}
      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '2.4rem', marginBottom: '30px', fontWeight: 'bold' }}>
            Giỏ hàng của bạn
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
            gridTemplateColumns: '1fr 400px', 
            gap: '30px'
          }}>
            {/* Left Column - Product List */}
            <div>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  backgroundColor: '#f5f5f5',
                  padding: '15px 20px',
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
                  {loading ? (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      minHeight: '300px',
                      padding: '40px 0',
                      gap: '15px'
                    }}>
                      <ClipLoader color="#1976d2" size={40} />
                      <p style={{ fontSize: '1.4rem', color: '#666', marginTop: '10px' }}>
                        Đang tải giỏ hàng...
                      </p>
                    </div>
                  ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '60px 20px',
                      fontSize: '1.6rem',
                      color: '#666'
                    }}>
                      <p style={{ marginBottom: '20px' }}>Giỏ hàng của bạn đang trống</p>
                      <Link 
                        to="/" 
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
                    cartItems.map((item, index) => {
                      const productId = item.product_id
                      const productName = item.name_product
                      const productImage = item.image_product
                      const productPrice = item.price_product
                      const quantity = item.quantity_item
                      
                      return (
                        <div 
                          key={productId}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr',
                            padding: '20px',
                            borderBottom: index < cartItems.length - 1 ? '1px solid #e0e0e0' : 'none',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button
                              onClick={() => removeItem(productId)}
                              aria-label="Xóa sản phẩm"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#d32f2f',
                                cursor: 'pointer',
                                fontSize: '1.6rem',
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <FaTimes />
                            </button>
                            {productImage ? (
                              <img 
                                src={productImage} 
                                alt={productName}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '5px'
                                }}
                              />
                            ) : (
                              <div style={{ 
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '5px',
                                fontSize: '1.2rem',
                                color: '#999'
                              }}>
                                No Image
                              </div>
                            )}
                            <span style={{ fontSize: '1.4rem', fontWeight: '500' }}>{productName}</span>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '1.4rem' }}>
                            {formatCurrency(productPrice)}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              border: '1px solid #e0e0e0',
                              borderRadius: '5px',
                              overflow: 'hidden'
                            }}>
                              <button
                                onClick={() => updateQuantity(productId, quantity - 1)}
                                aria-label="Giảm số lượng"
                                style={{
                                  padding: '8px 12px',
                                  border: 'none',
                                  backgroundColor: '#f5f5f5',
                                  cursor: 'pointer',
                                  fontSize: '1.2rem',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <FaChevronDown />
                              </button>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                  updateQuantity(productId, parseInt(e.target.value) || 1)
                                }
                                min="1"
                                style={{
                                  width: '50px',
                                  padding: '8px',
                                  border: 'none',
                                  textAlign: 'center',
                                  fontSize: '1.4rem',
                                  outline: 'none'
                                }}
                              />
                              <button
                                onClick={() => updateQuantity(productId, quantity + 1)}
                                aria-label="Tăng số lượng"
                                style={{
                                  padding: '8px 12px',
                                  border: 'none',
                                  backgroundColor: '#f5f5f5',
                                  cursor: 'pointer',
                                  fontSize: '1.2rem',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <FaChevronUp />
                              </button>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>
                            {formatCurrency(productPrice * quantity)}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginTop: '20px',
                marginBottom: '20px'
              }}>
                <Link 
                  to="/" 
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#fff',
                    color: '#1976d2',
                    border: '1px solid #1976d2',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    fontSize: '1.4rem',
                    fontWeight: '500'
                  }}
                >
                  Quay lại cửa hàng
                </Link>
                <button 
                  onClick={fetchCart}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#fff',
                    color: '#1976d2',
                    border: '1px solid #1976d2',
                    borderRadius: '5px',
                    fontSize: '1.4rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cập nhật giỏ hàng
                </button>
              </div>

              {/* Coupon Section */}
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', fontWeight: 'bold' }}>
                  Mã giảm giá
                </h3>
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
                    Áp dụng mã
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Cart Total */}
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
                Tổng giỏ hàng
              </h3>
              <div style={{ marginBottom: '25px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '15px',
                  fontSize: '1.4rem'
                }}>
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '15px',
                  fontSize: '1.4rem'
                }}>
                  <span>Phí vận chuyển:</span>
                  <span style={{ color: '#28a745' }}>Miễn phí</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: '15px',
                  borderTop: '2px solid #e0e0e0',
                  fontSize: '1.8rem',
                  fontWeight: 'bold'
                }}>
                  <span>Tổng cộng:</span>
                  <span style={{ color: '#1976d2' }}>{formatCurrency(total)}</span>
                </div>
              </div>
              <Link 
                to="/checkout" 
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontSize: '1.6rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
              >
                Thanh toán
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Carts
