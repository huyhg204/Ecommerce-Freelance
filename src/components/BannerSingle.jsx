import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  { id: 1, value: '05K', label: 'Khách hàng hài lòng' },
  { id: 2, value: '16K', label: 'Sản phẩm cao cấp' },
  { id: 3, value: '12K', label: 'Đơn hàng đã giao' },
  { id: 4, value: '25K', label: 'Thành viên hoạt động' },
]

const BannerSingle = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="trending">
          <div className="trending_content">
            <p className="trending_p">Danh mục</p>
            <h2 className="trending_title">Nâng tầm trải nghiệm âm nhạc</h2>
            <div className="trending_stats">
              {stats.map((stat) => (
                <div key={stat.id}>
                  <span>{stat.value}</span>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
            <Link to="/collections/audio" className="trending_btn">
              Mua ngay
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1462219184704-54ee455faac1?auto=format&fit=crop&w=800&q=80"
            alt="Portable speaker"
            className="trending_img"
          />
        </div>
      </div>
    </section>
  )
}

export default BannerSingle