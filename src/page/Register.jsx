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
    password_confirmation: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Kiểm tra password confirmation
    if (formRegister.password !== formRegister.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }
    
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
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Đăng ký thất bại';
        setError(errorMessage);
        toast.error('Đăng ký thất bại', {
          description: errorMessage,
        });
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
              <input type="text" placeholder="Họ và tên" className="form_input" value={formRegister.name} onChange={(e) => setformRegister({ ...formRegister, name: e.target.value })} />
            </div>
            <div className="form_group">
              <input type="email" placeholder="Email" className="form_input" value={formRegister.email} onChange={(e) => setformRegister({ ...formRegister, email: e.target.value })} />
            </div>
            {error && (
              <div className="form_group" style={{ color: 'red', marginBottom: '10px' }}>
                {error}
              </div>
            )}
            <div className="form_group form_pass">
              <input 
                type="password" 
                placeholder="Mật khẩu" 
                className="form_input" 
                value={formRegister.password} 
                onChange={(e) => setformRegister({ ...formRegister, password: e.target.value })}
                required
              />
            </div>
            <div className="form_group form_pass">
              <input 
                type="password" 
                placeholder="Xác nhận mật khẩu" 
                className="form_input" 
                value={formRegister.password_confirmation} 
                onChange={(e) => setformRegister({ ...formRegister, password_confirmation: e.target.value })}
                required
              />
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