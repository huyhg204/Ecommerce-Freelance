import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { axiosInstance } from '../utils/axiosConfig'

const heroSlides = [
  {
    id: 1,
    badge: 'iPhone 15 Series',
    title: 'Voucher giảm đến 10%',
    description: 'Thiết bị cao cấp với chip A17 siêu nhanh cho mọi nhu cầu.',
    image:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    badge: 'Gaming Essentials',
    title: 'Cảm nhận sức mạnh mới',
    description: 'Máy console và phụ kiện dành riêng cho game thủ chuyên nghiệp.',
    image:
      'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    badge: 'Smart Living',
    title: 'Thiết bị nhà thông minh',
    description: 'Camera, loa và công cụ tự động hóa cho mọi không gian sống.',
    image:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80',
  },
]

const Header = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/categories')
      if (response.data.status === 'success') {
        const data = response.data.data
        const categoriesList = Array.isArray(data) ? data : (data?.categories || [])
        // Chỉ lấy danh mục đang hoạt động (status_category === 0)
        const activeCategories = categoriesList.filter(category => category.status_category === 0)
        setCategories(activeCategories)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="header">
      <div className="container header_container">
        <aside className="header_filter">
          {loading ? (
            <ul className="header_filter_list">
              <li className="header_filter_item" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '20px',
                gap: '10px'
              }}>
                <ClipLoader color="#1976d2" size={20} />
                <span style={{ fontSize: '1.2rem', color: '#666' }}>Đang tải...</span>
              </li>
            </ul>
          ) : (
            <ul className="header_filter_list">
              {categories.map((category) => {
                const categoryName = category.name_category || category.name || ''
                return (
                  <li key={category.id} className="header_filter_item">
                    <Link 
                      to={`/products?category=${encodeURIComponent(categoryName)}`} 
                      className="header_filter_link"
                    >
                      {categoryName}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
        <div className="hero_slider">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            loop
            className="hero_swiper"
          >
            {heroSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="hero_slide">
                  <div className="hero_slide_content">
                    <p className="hero_slide_badge">{slide.badge}</p>
                    <h2 className="hero_slide_title">{slide.title}</h2>
                    <p className="hero_slide_desc">{slide.description}</p>
                    <Link to="/collections/featured" className="hero_cta">
                      Mua ngay
                    </Link>
                  </div>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="hero_slide_img"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </header>
  )
}

export default Header