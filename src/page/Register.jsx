import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ClipLoader } from 'react-spinners';
import { axiosInstance } from '../utils/axiosConfig';
import { authService } from '../utils/authService';

const Register = () => {
  const navigate = useNavigate();
  const [formRegister, setformRegister] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    password_confirmation: '',
    address: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation phía client
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formRegister.name.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc';
    } else if (formRegister.name.length > 255) {
      newErrors.name = 'Họ và tên không được vượt quá 255 ký tự';
    }
    
    // Validate email
    if (!formRegister.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formRegister.email)) {
      newErrors.email = 'Email không hợp lệ';
    } else if (formRegister.email.length > 255) {
      newErrors.email = 'Email không được vượt quá 255 ký tự';
    }
    
    // Validate password
    if (!formRegister.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formRegister.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Validate password confirmation
    if (!formRegister.password_confirmation) {
      newErrors.password_confirmation = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formRegister.password !== formRegister.password_confirmation) {
      newErrors.password_confirmation = 'Mật khẩu xác nhận không khớp';
    }
    
    // Validate address
    if (!formRegister.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    } else if (formRegister.address.length > 255) {
      newErrors.address = 'Địa chỉ không được vượt quá 255 ký tự';
    }
    
    // Validate phone
    if (!formRegister.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^\d{10}$/.test(formRegister.phone)) {
      newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    
    // Validate form trước khi gửi
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin', {
        description: 'Có một số trường không hợp lệ',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const apiRegister = await axiosInstance.post('/register', formRegister);
      
      // Nếu đăng ký thành công, tự động đăng nhập
      if (apiRegister.data.status === 'success') {
        // Có thể server trả về token ngay sau khi đăng ký
        if (apiRegister.data.data?.access_token) {
          authService.setToken(apiRegister.data.data.access_token);
          if (apiRegister.data.data.user) {
            authService.setUser(apiRegister.data.data.user);
          }
        }
        toast.success('Đăng ký thành công!', {
          description: 'Vui lòng đăng nhập để tiếp tục.',
        });
        // Redirect về trang chủ hoặc trang login
        navigate('/login');
      }
    } catch (error) {
      if (error.response) {
        // Xử lý validation errors từ server (Laravel format)
        if (error.response.data?.errors) {
          const serverErrors = {};
          // Laravel trả về errors dạng { field: ['error1', 'error2'] }
          Object.keys(error.response.data.errors).forEach(key => {
            const fieldErrors = error.response.data.errors[key];
            // Lấy lỗi đầu tiên cho mỗi field
            serverErrors[key] = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
          });
          setErrors(serverErrors);
          toast.error('Đăng ký thất bại', {
            description: 'Vui lòng kiểm tra lại thông tin',
          });
        } else {
          const errorMessage = error.response.data?.message || error.response.data?.error || 'Đăng ký thất bại';
          setError(errorMessage);
          toast.error('Đăng ký thất bại', {
            description: errorMessage,
          });
        }
      } else if (error.request) {
        setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
        toast.error('Lỗi kết nối', {
          description: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        });
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        toast.error('Đã xảy ra lỗi', {
          description: 'Vui lòng thử lại sau.',
        });
      }
    } finally {
      setLoading(false);
    }
  };  
  return (
    <section className="section">
      <div className="auth_container">
        <div className="auth_img">
          <img
            src="https://plus.unsplash.com/premium_photo-1681487814165-018814e29155?q=80"
            alt="Đăng ký"
            className="auth_image"
          />
        </div>
        <div className="auth_content">
          <form className="auth_form" onSubmit={handleRegister}>
            <h2 className="form_title">Tạo tài khoản</h2>
            <p className="auth_p">Nhập thông tin của bạn bên dưới</p>
            <div className="form_group">
              <input 
                type="text" 
                placeholder="Họ và tên" 
                className={`form_input ${errors.name ? 'error' : ''}`}
                value={formRegister.name} 
                onChange={(e) => {
                  setformRegister({ ...formRegister, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                maxLength={255}
              />
              {errors.name && (
                <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                  {errors.name}
                </span>
              )}
            </div>
            <div className="form_group">
              <input 
                type="email" 
                placeholder="Email" 
                className={`form_input ${errors.email ? 'error' : ''}`}
                value={formRegister.email} 
                onChange={(e) => {
                  setformRegister({ ...formRegister, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                maxLength={255}
              />
              {errors.email && (
                <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>
            {error && (
              <div className="form_group" style={{ color: 'red', marginBottom: '10px' }}>
                {error}
              </div>
            )}
            <div className="form_group form_pass">
              <input 
                type="password" 
                placeholder="Mật khẩu (tối thiểu 6 ký tự)" 
                className={`form_input ${errors.password ? 'error' : ''}`}
                value={formRegister.password} 
                onChange={(e) => {
                  setformRegister({ ...formRegister, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
              />
              {errors.password && (
                <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                  {errors.password}
                </span>
              )}
            </div>
            <div className="form_group form_pass">
              <input 
                type="password" 
                placeholder="Xác nhận mật khẩu" 
                className={`form_input ${errors.password_confirmation ? 'error' : ''}`}
                value={formRegister.password_confirmation} 
                onChange={(e) => {
                  setformRegister({ ...formRegister, password_confirmation: e.target.value });
                  if (errors.password_confirmation) setErrors({ ...errors, password_confirmation: '' });
                }}
              />
              {errors.password_confirmation && (
                <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                  {errors.password_confirmation}
                </span>
              )}
            </div>
            <div className="form_group form_address">
              <input 
                type="text" 
                placeholder="Địa chỉ" 
                className={`form_input ${errors.address ? 'error' : ''}`}
                value={formRegister.address} 
                onChange={(e) => {
                  setformRegister({ ...formRegister, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: '' });
                }}
                maxLength={255}
              />
              {errors.address && (
                <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                  {errors.address}
                </span>
              )}
            </div>
            <div className="form_group form_phone">
              <input 
                type="tel" 
                placeholder="Số điện thoại (10 chữ số)" 
                className={`form_input ${errors.phone ? 'error' : ''}`}
                value={formRegister.phone} 
                onChange={(e) => {
                  // Chỉ cho phép nhập số
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setformRegister({ ...formRegister, phone: value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }
                }}
                maxLength={10}
              />
              {errors.phone && (
                <span style={{ color: 'red', fontSize: '1.2rem', marginTop: '0.5rem', display: 'block' }}>
                  {errors.phone}
                </span>
              )}
            </div>
            <div className="form_group">
              <button type="submit" className="form_btn" disabled={loading} style={{ position: 'relative' }}>
                {loading ? (
                  <span className="form_link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <ClipLoader color="#fff" size={16} />
                    Đang tạo tài khoản...
                  </span>
                ) : (
                  <span className="form_link">Tạo tài khoản</span>
                )}
              </button>
            </div>
            <div className="form_group">
              <span>
                Đã có tài khoản?{' '}
                <Link to="/login" className="form_auth_link">
                  Đăng nhập
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Register