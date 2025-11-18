import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { FaHeart, FaEye, FaStar } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { cartService } from '../utils/cartService'
import { authService } from '../utils/authService'
import { useNavigate } from 'react-router-dom'

const HeartIcon = () => <FaHeart className="card_top_icon" />

const EyeIcon = () => <FaEye className="card_top_icon" />

const StarIcon = () => <FaStar className="w-6 h-6" />

const ProductsFlashSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Thử lấy từ API /home hoặc /products
      const response = await axiosInstance.get('/products')
      if (response.data.status === 'success') {
        const data = response.data.data
        const productsList = Array.isArray(data) ? data : (data?.products || [])
        // Chỉ lấy sản phẩm đang hoạt động (status_product === 0)
        const activeProducts = productsList.filter(product => product.status_product === 0)
        // Lấy 6 sản phẩm đầu tiên cho flash sale
        setProducts(activeProducts.slice(0, 6).map(product => ({
          id: product.id,
          name_product: product.name_product,
          price_product: product.price_product || 0,
          image_product: product.image_product || '',
          discount: product.discount || '-20%',
        })))
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm flash sale:', error)
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

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
        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            padding: '40px 0',
            gap: '15px'
          }}>
            <ClipLoader color="#1976d2" size={40} />
            <p style={{ fontSize: '1.4rem', color: '#666' }}>
              Đang tải sản phẩm...
            </p>
          </div>
        ) : error ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            padding: '40px 0'
          }}>
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        ) : products.length === 0 ? null : (
          <>
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
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="card">
                    <div className="card_top">
                      {product.image_product ? (
                        <img src={product.image_product} alt={product.name_product} className="card_img" />
                      ) : (
                        <div className="card_img" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                          <span>No Image</span>
                        </div>
                      )}
                      {product.discount && <div className="card_tag">{product.discount}</div>}
                      <div className="card_top_icons">
                        <HeartIcon />
                        <EyeIcon />
                      </div>
                    </div>
                    <div className="card_body">
                      <Link to={`/products/${product.id}`} className="card_title_link">
                        <h3 className="card_title">{product.name_product}</h3>
                      </Link>
                      <p className="card_price">{formatCurrency(product.price_product)}</p>
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
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          
                          if (!authService.isAuthenticated()) {
                            if (window.confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đi đến trang đăng nhập?')) {
                              navigate('/login')
                            }
                            return
                          }

                          try {
                            await cartService.addToCart(product.id, 1)
                            toast.success('Đã thêm vào giỏ hàng!', {
                              description: `${product.name_product} đã được thêm vào giỏ hàng.`,
                            })
                          } catch (error) {
                            toast.error('Không thể thêm vào giỏ hàng', {
                              description: error.message || 'Vui lòng thử lại sau.',
                            })
                          }
                        }}
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
          </>
        )}
      </div>
    </section>
  )
}

export default ProductsFlashSale