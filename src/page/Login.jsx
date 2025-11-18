import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ClipLoader } from 'react-spinners';
import { axiosInstance } from '../utils/axiosConfig';
import { authService } from '../utils/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formLogin, setformLogin] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const apiLogin = await axiosInstance.post('/login', formLogin);
      
      // Lưu token và thông tin user
      if (apiLogin.data.status === 'success' && apiLogin.data.data?.access_token) {
        authService.setToken(apiLogin.data.data.access_token);
        if (apiLogin.data.data.user) {
          authService.setUser(apiLogin.data.data.user);
        }
        
        // Dispatch custom event để Nav component biết đã login thành công
        window.dispatchEvent(new Event('authStateChanged'));
        
        const user = apiLogin.data.data.user;
        const userName = user?.name || 'User';
        const userRole = user?.role_user;
        
        toast.success('Đăng nhập thành công!', {
          description: `Chào mừng bạn trở lại, ${userName}!`,
        });
        
        // Redirect dựa trên role_user
        // role_user: 1 = Admin, 0 = Customer
        if (userRole === 1) {
          // Admin redirect đến trang admin
          navigate('/admin');
        } else {
          // Customer redirect về trang chủ
          navigate('/');
        }
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
        toast.error('Đăng nhập thất bại', {
          description: 'Vui lòng kiểm tra lại thông tin đăng nhập.',
        });
      }
    } catch (error) {
      if (error.response) {
        // Server trả về response với status code
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Đăng nhập thất bại';
        setError(errorMessage);
        toast.error('Đăng nhập thất bại', {
          description: errorMessage,
        });
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
        toast.error('Lỗi kết nối', {
          description: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        });
      } else {
        // Lỗi khác
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
            alt="Đăng nhập"
            className="auth_image"
          />
        </div>
        <div className="auth_content">
          <form className="auth_form" onSubmit={handleLogin}>
            <h2 className="form_title">Đăng nhập tài khoản</h2>
            <p className="auth_p">Nhập thông tin của bạn bên dưới</p>
            {error && (
              <div className="form_group" style={{ color: 'red', marginBottom: '10px' }}>
                {error}
              </div>
            )}
            <div className="form_group">
              <input 
                type="email" 
                placeholder="Email" 
                className="form_input" 
                value={formLogin.email} 
                onChange={(e) => setformLogin({ ...formLogin, email: e.target.value })}
                required
              />
            </div>
            <div className="form_group form_pass">
              <input 
                type="password" 
                placeholder="Mật khẩu" 
                className="form_input" 
                value={formLogin.password} 
                onChange={(e) => setformLogin({ ...formLogin, password: e.target.value })}
                required
              />
            </div>
            <div className="form_group">
              <button type="submit" className="form_btn" disabled={loading} style={{ position: 'relative' }}>
                {loading ? (
                  <span className="form_link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <ClipLoader color="#fff" size={16} />
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="form_link">Đăng nhập</span>
                )}
              </button>
            </div>
            <div className="form_group">
              <span>
                Chưa có tài khoản?{' '}
                <Link to="/register" className="form_auth_link">
                  Đăng ký
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;