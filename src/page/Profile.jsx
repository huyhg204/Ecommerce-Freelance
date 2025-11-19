import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { axiosInstance } from '../utils/axiosConfig'
import { authService } from '../utils/authService'

const Profile = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    
    // Thử lấy dữ liệu từ localStorage trước (nếu có)
    const cachedUser = authService.getUser()
    if (cachedUser) {
      setUser(cachedUser)
      setFormData({
        name: cachedUser.name || '',
        email: cachedUser.email || '',
        address: cachedUser.address || '',
        phone: cachedUser.phone || '',
        password: '',
        password_confirmation: '',
      })
    }
    
    // Sau đó fetch từ API để cập nhật dữ liệu mới nhất
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/user')
      
      // Xử lý nhiều trường hợp cấu trúc dữ liệu có thể có
      let userData = null
      
      // Trường hợp 1: API trả về với wrapper {status: 'success', data: {...}}
      if (response.data.status === 'success' && response.data.data) {
        if (response.data.data.name || response.data.data.email) {
          userData = response.data.data
        } else if (response.data.data.user) {
          userData = response.data.data.user
        } else if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          userData = response.data.data[0]
        }
      }
      // Trường hợp 2: API trả về dữ liệu user trực tiếp (không có wrapper)
      else if (response.data.id || response.data.name || response.data.email) {
        userData = response.data
      }
      
      if (userData) {
        setUser(userData)
        // Cập nhật localStorage với dữ liệu mới
        authService.setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          address: userData.address || '',
          phone: userData.phone || '',
          password: '',
          password_confirmation: '',
        })
      } else {
        console.error('Không tìm thấy dữ liệu user trong response:', response.data)
        // Nếu không tìm thấy trong API, giữ nguyên dữ liệu từ localStorage (nếu có)
        const cachedUser = authService.getUser()
        if (!cachedUser) {
          toast.error('Không thể tải thông tin người dùng')
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
      }
      toast.error('Không thể tải thông tin người dùng')
    } finally {
      setLoading(false)
    }
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Xử lý phone: chỉ cho phép nhập số và tối đa 10 ký tự
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '')
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10)
      }
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    })
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }
  
  // Validation phía client
  const validateForm = () => {
    const newErrors = {}
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc'
    } else if (formData.name.length > 255) {
      newErrors.name = 'Họ và tên không được vượt quá 255 ký tự'
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email không được vượt quá 255 ký tự'
    }
    
    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc'
    } else if (formData.address.length > 255) {
      newErrors.address = 'Địa chỉ không được vượt quá 255 ký tự'
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc'
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số'
    }
    
    // Validate password (chỉ validate nếu có nhập)
    if (formData.password || formData.password_confirmation) {
      if (!formData.password) {
        newErrors.password = 'Mật khẩu là bắt buộc'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
      }
      
      if (!formData.password_confirmation) {
        newErrors.password_confirmation = 'Xác nhận mật khẩu là bắt buộc'
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Mật khẩu xác nhận không khớp'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validate form trước khi gửi
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin', {
        description: 'Có một số trường không hợp lệ',
      })
      return
    }
    
    setSubmitting(true)
    
    try {
      // Chuẩn bị dữ liệu gửi lên API /update-profile
      // Format: { name, email, password, password_confirmation, address, phone }
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      }
      
      // Chỉ gửi password và password_confirmation nếu người dùng muốn thay đổi mật khẩu
      // Nếu không gửi, API sẽ không cập nhật mật khẩu
      if (formData.password && formData.password_confirmation) {
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }
      
      const response = await axiosInstance.put('/update-profile', updateData)
      
      if (response.data.status === 'success') {
        // Cập nhật thông tin user trong state
        const updatedUser = response.data.data?.user || {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
        }
        setUser(updatedUser)
        
        // Reset password fields sau khi cập nhật thành công
        setFormData({
          ...formData,
          password: '',
          password_confirmation: '',
        })
        
        toast.success('Cập nhật thành công!', {
          description: 'Thông tin của bạn đã được cập nhật.',
        })
      }
    } catch (error) {
      if (error.response) {
        // Xử lý validation errors từ server (Laravel format)
        if (error.response.data?.errors) {
          const serverErrors = {}
          Object.keys(error.response.data.errors).forEach(key => {
            const fieldErrors = error.response.data.errors[key]
            serverErrors[key] = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors
          })
          setErrors(serverErrors)
          toast.error('Cập nhật thất bại', {
            description: 'Vui lòng kiểm tra lại thông tin',
          })
        } else {
          const errorMessage = error.response.data?.message || error.response.data?.error || 'Cập nhật thất bại'
          toast.error('Cập nhật thất bại', {
            description: errorMessage,
          })
        }
      } else if (error.request) {
        toast.error('Lỗi kết nối', {
          description: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        })
      } else {
        toast.error('Đã xảy ra lỗi', {
          description: 'Vui lòng thử lại sau.',
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
      })
      setErrors({})
    }
  }

  const menuItems = [
    {
      id: 'profile',
      label: 'Thông tin tài khoản',
      href: '/profile',
      active: pathname === '/profile',
    },
    {
      id: 'address',
      label: 'Address Book',
      href: '/profile/address',
      active: pathname === '/profile/address',
    },
    {
      id: 'payment',
      label: 'My Payment Options',
      href: '/profile/payment',
      active: pathname === '/profile/payment',
    },
  ]

  const orderItems = [
    {
      id: 'orders',
      label: 'Đơn hàng của tôi',
      href: '/orders',
      active: pathname === '/orders' || pathname.startsWith('/orders/'),
    },
    {
      id: 'returns',
      label: 'My Returns',
      href: '/profile/returns',
      active: pathname === '/profile/returns',
    },
    {
      id: 'cancellations',
      label: 'My Cancellations',
      href: '/profile/cancellations',
      active: pathname === '/profile/cancellations',
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
                  {orderItems.map((item) => (
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
                <h3 className="profile_sidebar_title">Danh sách yêu thích</h3>
                <ul className="profile_sidebar_list">
                  <li className="profile_sidebar_item">
                    <Link 
                      to="/wishlist" 
                      className={`profile_sidebar_link ${pathname === '/wishlist' ? 'active' : ''}`}
                    >
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
                    <label htmlFor="name" className="profile_form_label">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`profile_form_input ${errors.name ? 'error' : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      maxLength={255}
                    />
                    {errors.name && (
                      <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.name}
                      </span>
                    )}
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
                      className={`profile_form_input ${errors.email ? 'error' : ''}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      maxLength={255}
                    />
                    {errors.email && (
                      <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div className="profile_form_group">
                    <label htmlFor="phone" className="profile_form_label">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`profile_form_input ${errors.phone ? 'error' : ''}`}
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      placeholder="10 chữ số"
                    />
                    {errors.phone && (
                      <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Third Row */}
                <div className="profile_form_row">
                  <div className="profile_form_group">
                    <label htmlFor="address" className="profile_form_label">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className={`profile_form_input ${errors.address ? 'error' : ''}`}
                      value={formData.address}
                      onChange={handleInputChange}
                      maxLength={255}
                    />
                    {errors.address && (
                      <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password Changes Section */}
                <div className="profile_form_section">
                  <h3 className="profile_form_section_title">Thay đổi mật khẩu (tùy chọn)</h3>
                  <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1.5rem' }}>
                    Để trống nếu không muốn thay đổi mật khẩu
                  </p>
                  <div className="profile_form_group">
                    <label htmlFor="password" className="profile_form_label">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`profile_form_input ${errors.password ? 'error' : ''}`}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    {errors.password && (
                      <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.password}
                      </span>
                    )}
                  </div>
                  <div className="profile_form_group">
                    <label htmlFor="password_confirmation" className="profile_form_label">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      className={`profile_form_input ${errors.password_confirmation ? 'error' : ''}`}
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                    />
                    {errors.password_confirmation && (
                      <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.password_confirmation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="profile_form_actions">
                  <button
                    type="button"
                    className="profile_form_btn profile_form_btn--cancel"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="profile_form_btn profile_form_btn--save"
                    disabled={submitting}
                    style={{ position: 'relative' }}
                  >
                    {submitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <ClipLoader color="#fff" size={16} />
                        Đang lưu...
                      </span>
                    ) : (
                      'Lưu thay đổi'
                    )}
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

