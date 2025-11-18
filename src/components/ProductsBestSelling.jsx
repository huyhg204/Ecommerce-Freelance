import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const HeartIcon = () => <FaHeart className="card_top_icon" />

const EyeIcon = () => <FaEye className="card_top_icon" />

const StarIcon = () => <FaStar className="w-6 h-6" />

const ProductsBestSelling = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/products')
      if (response.data.status === 'success') {
        const data = response.data.data
        const productsList = Array.isArray(data) ? data : (data?.products || [])
        // Chỉ lấy sản phẩm đang hoạt động (status_product === 0)
        const activeProducts = productsList.filter(product => product.status_product === 0)
        // Lấy 4 sản phẩm đầu tiên cho best selling
        setProducts(activeProducts.slice(0, 4).map(product => ({
          id: product.id,
          title: product.name_product,
          price: product.price_product || 0,
          image: product.image_product || '',
          discount: product.discount || '-10%',
        })))
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm bán chạy:', error)
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!authService.isAuthenticated()) {
      if (window.confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đi đến trang đăng nhập?')) {
        navigate('/login')
      }
      return
    }

    try {
      await cartService.addToCart(productId, 1)
      toast.success('Đã thêm vào giỏ hàng!', {
        description: 'Sản phẩm đã được thêm vào giỏ hàng.',
      })
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng', {
        description: error.message || 'Vui lòng thử lại sau.',
      })
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section_category">
          <p className="section_category_p">Tháng này</p>
        </div>
        <div className="section_header section_header--between">
          <h3 className="section_title">Sản phẩm bán chạy</h3>
          <Link to="/products" className="section_btn section_btn--primary">
            Xem tất cả
          </Link>
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
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="card_img" />
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
                        onClick={(e) => handleAddToCart(product.id, e)}
                      >
                        Thêm vào giỏ
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
          </>
        )}
      </div>
    </section>
  )
}

export default ProductsBestSelling