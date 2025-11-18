import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { FaHeart, FaEye, FaStar } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { cartService } from '../utils/cartService'
import { authService } from '../utils/authService'

const ProductsExploreOur = () => {
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
        // Lấy 8 sản phẩm đầu tiên
        setProducts(activeProducts.slice(0, 8).map(product => ({
          id: product.id,
          title: product.name_product,
          price: product.price_product || 0,
          image: product.image_product || '',
          reviews: product.reviews_count || 0,
          badge: product.badge || '',
        })))
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error)
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
          <p className="section_category_p">Sản phẩm của chúng tôi</p>
        </div>
        <div className="section_header section_header--between">
          <h3 className="section_title">Khám phá sản phẩm</h3>
          <div className="section_arrows">
            <button aria-label="Sản phẩm trước" className="section_arrow">
              ‹
            </button>
            <button aria-label="Sản phẩm kế tiếp" className="section_arrow">
              ›
            </button>
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
            <div className="products">
              {products.map((product) => (
                <div key={product.id} className="card">
                  <div className="card_top">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="card_img" />
                    ) : (
                      <div className="card_img" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                        <span>No Image</span>
                      </div>
                    )}
                    {product.badge && <div className="card_tag">{product.badge}</div>}
                    <div className="card_top_icons">
                      <FaHeart className="card_top_icon" />
                      <FaEye className="card_top_icon" />
                    </div>
                  </div>
                  <div className="card_body">
                    <Link to={`/products/${product.id}`} className="card_title_link">
                      <h3 className="card_title">{product.title}</h3>
                    </Link>
                    <p className="card_price">{formatCurrency(product.price)}</p>
                    <div className="card_ratings">
                      <div className="card_stars">
                        <FaStar className="w-6 h-6" />
                        <FaStar className="w-6 h-6" />
                        <FaStar className="w-6 h-6" />
                        <FaStar className="w-6 h-6" />
                        <FaStar className="w-6 h-6" />
                      </div>
                      <p className="card_rating_numbers">({product.reviews})</p>
                    </div>
                    <button 
                      className="add_to_cart add_to_cart--inline"
                      onClick={(e) => handleAddToCart(product.id, e)}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="container_btn">
              <Link to="/collections/all" className="container_btn_a">
                XEM TOÀN BỘ
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default ProductsExploreOur