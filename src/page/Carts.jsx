import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'

const initialCartItems = [
  {
    id: 1,
    name: 'Màn hình LCD',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=200&q=80',
    price: 650,
    quantity: 1,
  },
  {
    id: 2,
    name: 'Tay cầm H1',
    image: 'https://images.unsplash.com/photo-1614680376573-e720cdb88866?auto=format&fit=crop&w=200&q=80',
    price: 550,
    quantity: 2,
  },
]

const Carts = () => {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [couponCode, setCouponCode] = useState('')

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(
      cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    )
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  const handleApplyCoupon = () => {
    // Logic apply coupon
    alert('Mã giảm giá đã được áp dụng!')
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
          <div className="cart_wrapper">
            {/* Left Column - Product List */}
            <div className="cart_products">
              <div className="cart_table">
                <div className="cart_table_header">
                  <div className="cart_table_col cart_table_col--product">Sản phẩm</div>
                  <div className="cart_table_col cart_table_col--price">Giá</div>
                  <div className="cart_table_col cart_table_col--quantity">Số lượng</div>
                  <div className="cart_table_col cart_table_col--subtotal">Tổng tiền</div>
                </div>

                <div className="cart_table_body">
                  {cartItems.length === 0 ? (
                    <div className="cart_empty">
                      <p>Giỏ hàng của bạn đang trống</p>
                      <Link to="/" className="cart_empty_link">
                        Tiếp tục mua sắm
                      </Link>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="cart_table_row">
                        <div className="cart_table_col cart_table_col--product">
                          <button
                            className="cart_remove_btn"
                            onClick={() => removeItem(item.id)}
                            aria-label="Xóa sản phẩm"
                          >
                            <FaTimes />
                          </button>
                          <img src={item.image} alt={item.name} className="cart_product_img" />
                          <span className="cart_product_name">{item.name}</span>
                        </div>
                        <div className="cart_table_col cart_table_col--price">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="cart_table_col cart_table_col--quantity">
                          <div className="quantity_control">
                            <button
                              className="quantity_btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Giảm số lượng"
                            >
                              <FaChevronDown />
                            </button>
                            <input
                              type="number"
                              className="quantity_input"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              min="1"
                            />
                            <button
                              className="quantity_btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Tăng số lượng"
                            >
                              <FaChevronUp />
                            </button>
                          </div>
                        </div>
                        <div className="cart_table_col cart_table_col--subtotal">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="cart_actions">
                <Link to="/" className="cart_action_btn cart_action_btn--secondary">
                  Quay lại cửa hàng
                </Link>
                <button className="cart_action_btn cart_action_btn--secondary">
                  Cập nhật giỏ hàng
                </button>
              </div>

              {/* Coupon Section */}
              <div className="cart_coupon">
                <h3 className="cart_coupon_title">Mã giảm giá</h3>
                <div className="cart_coupon_form">
                  <input
                    type="text"
                    className="cart_coupon_input"
                    placeholder="Nhập mã giảm giá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button className="cart_coupon_btn" onClick={handleApplyCoupon}>
                    Áp dụng mã
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Cart Total */}
            <div className="cart_total">
              <h3 className="cart_total_title">Tổng giỏ hàng</h3>
              <div className="cart_total_content">
                <div className="cart_total_row">
                  <span className="cart_total_label">Tạm tính:</span>
                  <span className="cart_total_value">{formatCurrency(subtotal)}</span>
                </div>
                <div className="cart_total_row">
                  <span className="cart_total_label">Phí vận chuyển:</span>
                  <span className="cart_total_value">Miễn phí</span>
                </div>
                <div className="cart_total_row cart_total_row--total">
                  <span className="cart_total_label">Tổng cộng:</span>
                  <span className="cart_total_value">{formatCurrency(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="cart_checkout_btn">
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
