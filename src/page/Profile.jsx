import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: 'Md',
    lastName: 'Rimel',
    email: 'rimell111@gmail.com',
    address: 'Kingston, 5236, United State',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    alert('Thông tin đã được cập nhật!')
  }

  const handleCancel = () => {
    // Reset form or navigate away
    setFormData({
      firstName: 'Md',
      lastName: 'Rimel',
      email: 'rimell111@gmail.com',
      address: 'Kingston, 5236, United State',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const menuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      href: '/profile',
      active: true,
    },
    {
      id: 'address',
      label: 'Address Book',
      href: '/profile/address',
      active: false,
    },
    {
      id: 'payment',
      label: 'My Payment Options',
      href: '/profile/payment',
      active: false,
    },
  ]

  const orderItems = [
    {
      id: 'returns',
      label: 'My Returns',
      href: '/profile/returns',
      active: false,
    },
    {
      id: 'cancellations',
      label: 'My Cancellations',
      href: '/profile/cancellations',
      active: false,
    },
  ]

  return (
    <div>
      {/* Breadcrumbs */}
      <section className="breadcrumb_section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb_link">
              Trang chủ
            </Link>
            <span className="breadcrumb_separator"> / </span>
            <span className="breadcrumb_current">Tài khoản của tôi</span>
          </div>
        </div>
      </section>

      {/* Welcome Message */}
      <section className="section">
        <div className="container">
          <div className="profile_welcome">
            <h2 className="profile_welcome_title">Xin chào! Md Rimel</h2>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="section">
        <div className="container">
          <div className="profile_wrapper">
            {/* Left Sidebar */}
            <aside className="profile_sidebar">
              <div className="profile_sidebar_section">
                <h3 className="profile_sidebar_title">Quản lý tài khoản</h3>
                <ul className="profile_sidebar_list">
                  {menuItems.map((item) => (
                    <li key={item.id} className="profile_sidebar_item">
                      <Link
                        to={item.href}
                        className={`profile_sidebar_link ${item.active ? 'active' : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="profile_sidebar_section">
                <h3 className="profile_sidebar_title">Đơn hàng của tôi</h3>
                <ul className="profile_sidebar_list">
                  <li className="profile_sidebar_item">
                    <Link to="/orders" className="profile_sidebar_link">
                      Đơn hàng của tôi
                    </Link>
                  </li>
                  {orderItems.map((item) => (
                    <li key={item.id} className="profile_sidebar_item">
                      <Link to={item.href} className="profile_sidebar_link">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="profile_sidebar_section">
                <h3 className="profile_sidebar_title">Danh sách yêu thích</h3>
                <ul className="profile_sidebar_list">
                  <li className="profile_sidebar_item">
                    <Link to="/wishlist" className="profile_sidebar_link">
                      Danh sách yêu thích
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Right Main Content */}
            <div className="profile_main">
              <h2 className="profile_main_title">Chỉnh sửa hồ sơ</h2>
              <form className="profile_form" onSubmit={handleSubmit}>
                {/* First Row */}
                <div className="profile_form_row">
                  <div className="profile_form_group">
                    <label htmlFor="firstName" className="profile_form_label">
                      Họ
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="profile_form_input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="profile_form_group">
                    <label htmlFor="lastName" className="profile_form_label">
                      Tên
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="profile_form_input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Second Row */}
                <div className="profile_form_row">
                  <div className="profile_form_group">
                    <label htmlFor="email" className="profile_form_label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="profile_form_input"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="profile_form_group">
                    <label htmlFor="address" className="profile_form_label">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="profile_form_input"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Password Changes Section */}
                <div className="profile_form_section">
                  <h3 className="profile_form_section_title">Thay đổi mật khẩu</h3>
                  <div className="profile_form_group">
                    <label htmlFor="currentPassword" className="profile_form_label">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="profile_form_input"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="profile_form_group">
                    <label htmlFor="newPassword" className="profile_form_label">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="profile_form_input"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="profile_form_group">
                    <label htmlFor="confirmPassword" className="profile_form_label">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="profile_form_input"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="profile_form_actions">
                  <button
                    type="button"
                    className="profile_form_btn profile_form_btn--cancel"
                    onClick={handleCancel}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="profile_form_btn profile_form_btn--save">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Profile

