import React from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { FaHeart, FaEye, FaStar } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'

const bestSellingProducts = [
  {
    id: 1,
    title: 'Smartphone iPhone 15 Pro',
    price: 260,
    image:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=600&q=80',
    discount: '-30%',
  },
  {
    id: 2,
    title: 'Máy ảnh Canon EOS DSLR',
    price: 960,
    image:
      'https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=600&q=80',
    discount: '-15%',
  },
  {
    id: 3,
    title: 'Tản nhiệt CPU RGB',
    price: 170,
    image:
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
    discount: '-25%',
  },
  {
    id: 4,
    title: 'Loa Bluetooth JBL',
    price: 360,
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    discount: '-10%',
  },
]

const HeartIcon = () => <FaHeart className="card_top_icon" />

const EyeIcon = () => <FaEye className="card_top_icon" />

const StarIcon = () => <FaStar className="w-6 h-6" />

const ProductsBestSelling = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="section_category">
          <p className="section_category_p">Tháng này</p>
        </div>
        <div className="section_header section_header--between">
          <h3 className="section_title">Sản phẩm bán chạy</h3>
          <Link to="/collections/best-selling" className="section_btn section_btn--primary">
            Xem tất cả
          </Link>
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
            {bestSellingProducts.map((product) => (
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
                    Add to Cart
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="container_btn">
          <Link to="/collections/best-selling" className="container_btn_a">
            XEM TẤT CẢ SẢN PHẨM
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductsBestSelling