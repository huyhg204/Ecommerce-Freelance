import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { axiosInstance } from '../utils/axiosConfig'
import { authService } from '../utils/authService'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/user')
      if (response.data.status === 'success') {
        const userData = response.data.data
        setUser(userData)
        setFormData({
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ').slice(1).join(' ') || '',
          email: userData.email || '',
          address: userData.address || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Note: API có thể không có endpoint để update profile
    // Nếu có, sẽ cần gọi API ở đây
    toast.info('Thông tin đã được cập nhật!', {
      description: 'Chức năng này cần API endpoint để update.',
    })
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        address: user.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
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
                    Đang tải thông tin cá nhân...
                  </p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Profile

