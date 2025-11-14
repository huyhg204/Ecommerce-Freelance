import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const sidebarCategories = [
  { id: 1, label: 'Gaming', href: '/products?category=Gaming' },
  { id: 2, label: 'Smartphone', href: '/products?category=Smartphone' },
  { id: 3, label: 'Laptop', href: '/products?category=Laptop' },
  { id: 4, label: 'Audio', href: '/products?category=Audio' },
  { id: 5, label: 'Camera', href: '/products?category=Camera' },
  { id: 6, label: 'Monitor', href: '/products?category=Monitor' },
  { id: 7, label: 'Tablet', href: '/products?category=Tablet' },
  { id: 8, label: 'Wearable', href: '/products?category=Wearable' },
  { id: 9, label: 'PC Parts', href: '/products?category=PC Parts' },
  { id: 10, label: 'Accessories', href: '/products?category=Accessories' },
]

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

  return (
    <header className="header">
      <div className="container header_container">
        <aside className="header_filter">
          <ul className="header_filter_list">
            {sidebarCategories.map((category) => (
              <li key={category.id} className="header_filter_item">
                <Link to={category.href} className="header_filter_link">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
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