import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { FaHeart, FaEye, FaStar } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'

const flashSaleProducts = [
  {
    id: 1,
    title: 'Tay cầm Gaming HAVIT HV-G92',
    price: 120,
    image:
      'https://images.unsplash.com/photo-1614680376573-e720cdb88866?auto=format&fit=crop&w=600&q=80',
    discount: '-40%',
  },
  {
    id: 2,
    title: 'Bàn phím cơ Gaming RGB',
    price: 80,
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    discount: '-35%',
  },
  {
    id: 3,
    title: 'Màn hình Gaming 27 inch',
    price: 320,
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    discount: '-25%',
  },
  {
    id: 4,
    title: 'Laptop Gaming ASUS ROG',
    price: 180,
    image:
      'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    discount: '-30%',
  },
  {
    id: 5,
    title: 'Tai nghe Gaming 7.1',
    price: 150,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    discount: '-20%',
  },
  {
    id: 6,
    title: 'Chuột Gaming RGB',
    price: 65,
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80',
    discount: '-18%',
  },
]

const HeartIcon = () => <FaHeart className="card_top_icon" />

const EyeIcon = () => <FaEye className="card_top_icon" />

const StarIcon = () => <FaStar className="w-6 h-6" />

const ProductsFlashSale = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  const saleDeadline = useMemo(() => {
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 5)
    return deadline
  }, [])

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = saleDeadline.getTime() - now

      if (distance <= 0) return setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [saleDeadline])

  return (
    <section className="section">
      <div className="container">
        <div className="section_category">
          <p className="section_category_p">Trong ngày</p>
        </div>
        <div className="section_header section_header--between">
          <h3 className="section_title">Ưu đãi chớp nhoáng</h3>
          <div className="countdown">
            {Object.entries(timeLeft).map(([label, value]) => {
              const labelMap = {
                days: 'Ngày',
                hours: 'Giờ',
                minutes: 'Phút',
                seconds: 'Giây',
              }
              return (
                <div key={label} className="countdown_item">
                  <span className="countdown_value">{value}</span>
                  <span className="countdown_label">{labelMap[label]}</span>
                </div>
              )
            })}
          </div>
        </div>
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={1}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="mySwiper"
        >
          {flashSaleProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="card">
                <div className="card_top">
                  <img src={product.image} alt={product.title} className="card_img" />
                  <div className="card_tag">{product.discount}</div>
                  <div className="card_top_icons">
                    <HeartIcon />
                    <EyeIcon />
                  </div>
                </div>
                <div className="card_body">
                  <Link to={`/products/${product.id}`} className="card_title_link">
                    <h3 className="card_title">{product.title}</h3>
                  </Link>
                  <p className="card_price">{formatCurrency(product.price)}</p>
                  <div className="card_ratings">
                    <div className="card_stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <StarIcon key={index} />
                      ))}
                    </div>
                    <p className="card_rating_numbers">(88)</p>
                  </div>
                  <button
                    className="add_to_cart"
                    data-id={product.id}
                    data-title={product.title}
                    data-image={product.image}
                    data-price={product.price}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="container_btn">
          <Link to="/collections/flash-sale" className="container_btn_a">
            XEM TẤT CẢ SẢN PHẨM
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductsFlashSale