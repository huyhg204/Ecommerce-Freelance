import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'

const orderItems = [
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

const CheckOut = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    streetAddress: '',
    apartment: '',
    townCity: '',
    phoneNumber: '',
    emailAddress: '',
    saveInfo: false,
  })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [couponCode, setCouponCode] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle checkout logic
    alert('Đặt hàng thành công!')
  }

  const handleApplyCoupon = () => {
    // Logic apply coupon
    alert('Mã giảm giá đã được áp dụng!')
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0 // Free shipping
  const total = subtotal + shipping

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
            <Link to="/account" className="breadcrumb_link">
              Tài khoản
            </Link>
            <span className="breadcrumb_separator"> / </span>
            <Link to="/account/my-account" className="breadcrumb_link">
              Tài khoản của tôi
            </Link>
            <span className="breadcrumb_separator"> / </span>
            <Link to="/products" className="breadcrumb_link">
              Sản phẩm
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
          <div className="checkout_wrapper">
            {/* Left Column - Billing Details */}
            <div className="checkout_billing">
              <h2 className="checkout_title">Thông tin thanh toán</h2>
              <form className="checkout_form" onSubmit={handleSubmit}>
                <div className="checkout_form_group">
                  <label className="checkout_label">
                    Họ và tên <span className="checkout_required">*</span>
                  </label>
                  <input
                    type="text"
                    className="checkout_input"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout_form_group">
                  <label className="checkout_label">Tên công ty</label>
                  <input
                    type="text"
                    className="checkout_input"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="checkout_form_group">
                  <label className="checkout_label">
                    Địa chỉ <span className="checkout_required">*</span>
                  </label>
                  <input
                    type="text"
                    className="checkout_input"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout_form_group">
                  <label className="checkout_label">
                    Căn hộ, tầng, v.v. (tùy chọn)
                  </label>
                  <input
                    type="text"
                    className="checkout_input"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="checkout_form_group">
                  <label className="checkout_label">
                    Thành phố/Tỉnh <span className="checkout_required">*</span>
                  </label>
                  <input
                    type="text"
                    className="checkout_input"
                    name="townCity"
                    value={formData.townCity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout_form_group">
                  <label className="checkout_label">
                    Số điện thoại <span className="checkout_required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="checkout_input"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout_form_group">
                  <label className="checkout_label">
                    Email <span className="checkout_required">*</span>
                  </label>
                  <input
                    type="email"
                    className="checkout_input"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="checkout_form_group checkout_checkbox_group">
                  <label className="checkout_checkbox_label">
                    <input
                      type="checkbox"
                      className="checkout_checkbox"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleInputChange}
                    />
                    <span>Lưu thông tin này để thanh toán nhanh hơn lần sau</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="checkout_summary">
              <h2 className="checkout_title">Tóm tắt đơn hàng</h2>

              {/* Order Items */}
              <div className="checkout_order_items">
                {orderItems.map((item) => (
                  <div key={item.id} className="checkout_order_item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="checkout_item_img"
                    />
                    <div className="checkout_item_info">
                      <p className="checkout_item_name">{item.name}</p>
                      <p className="checkout_item_price">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="checkout_totals">
                <div className="checkout_total_row">
                  <span className="checkout_total_label">Tạm tính:</span>
                  <span className="checkout_total_value">{formatCurrency(subtotal)}</span>
                </div>
                <div className="checkout_total_row">
                  <span className="checkout_total_label">Phí vận chuyển:</span>
                  <span className="checkout_total_value">Miễn phí</span>
                </div>
                <div className="checkout_total_row checkout_total_row--total">
                  <span className="checkout_total_label">Tổng cộng:</span>
                  <span className="checkout_total_value">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="checkout_payment">
                <h3 className="checkout_payment_title">Phương thức thanh toán</h3>
                <div className="checkout_payment_options">
                  <label className="checkout_payment_option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Ngân hàng</span>
                    <div className="checkout_payment_logos">
                      <span className="payment_logo">bKash</span>
                      <span className="payment_logo">VISA</span>
                      <span className="payment_logo">Mastercard</span>
                      <span className="payment_logo">Nagad</span>
                    </div>
                  </label>
                  <label className="checkout_payment_option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Thanh toán khi nhận hàng</span>
                  </label>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="checkout_coupon">
                <h3 className="checkout_coupon_title">Mã giảm giá</h3>
                <div className="checkout_coupon_form">
                  <input
                    type="text"
                    className="checkout_coupon_input"
                    placeholder="Nhập mã giảm giá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    className="checkout_coupon_btn"
                    onClick={handleApplyCoupon}
                  >
                    Áp dụng mã
                  </button>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                className="checkout_place_order_btn"
                onClick={handleSubmit}
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CheckOut

