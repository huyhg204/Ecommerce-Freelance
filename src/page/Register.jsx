import { Link } from 'react-router-dom'

const Register = () => {
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
          <form action className="auth_form">
            <h2 className="form_title">Tạo tài khoản</h2>
            <p className="auth_p">Nhập thông tin của bạn bên dưới</p>
            <div className="form_group">
              <input type="text" placeholder="Họ và tên" className="form_input" />
            </div>
            <div className="form_group">
              <input type="email" placeholder="Email" className="form_input" />
            </div>
            <div className="form_group form_pass">
              <input type="password" placeholder="Mật khẩu" className="form_input" />
            </div>
            <div className="form_group">
              <button type="submit" className="form_btn">
                <span className="form_link">Tạo tài khoản</span>
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