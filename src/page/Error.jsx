import React from 'react'
import { Link } from 'react-router-dom'

const Error = () => {
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
            <span className="breadcrumb_current">404 Lỗi</span>
          </nav>
        </div>
      </section>

      {/* 404 Error Content */}
      <section className="section">
        <div className="container">
          <div className="error_wrapper">
            <h1 className="error_title">404 Không tìm thấy</h1>
            <p className="error_message">
              Trang bạn đang tìm kiếm không tồn tại. Bạn có thể quay về trang chủ.
            </p>
            <Link to="/" className="error_btn">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Error

