import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import {
  FaHeart,
  FaStar,
  FaChevronUp,
  FaChevronDown,
  FaTruck,
  FaUndo,
  FaUser,
  FaEye,
} from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'
import { axiosInstance } from '../utils/axiosConfig'
import { cartService } from '../utils/cartService'
import { authService } from '../utils/authService'

const colors = [
  { id: 1, name: 'Xanh dương', value: '#4285F4', selected: true },
  { id: 2, name: 'Đỏ', value: '#EA4335', selected: false },
]

const sizes = ['XS', 'S', 'M', 'L', 'XL']

const comments = [
  {
    id: 1,
    user: 'Nguyễn Văn A',
    rating: 5,
    date: '2024-01-15',
    content:
      'Sản phẩm rất tốt, chất lượng cao. Tay cầm rất thoải mái khi sử dụng, pin bền. Rất hài lòng với sản phẩm này!',
  },
  {
    id: 2,
    user: 'Trần Thị B',
    rating: 4,
    date: '2024-01-10',
    content:
      'Sản phẩm đẹp, giá cả hợp lý. Chỉ có một chút nhỏ là thời gian sạc hơi lâu, nhưng nhìn chung rất ổn.',
  },
  {
    id: 3,
    user: 'Lê Văn C',
    rating: 5,
    date: '2024-01-05',
    content:
      'Tuyệt vời! Sản phẩm vượt quá mong đợi. Chất lượng build rất tốt, cảm giác cầm rất chắc chắn.',
  },
]

const ProductsDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(colors[0]?.id || 1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [newComment, setNewComment] = useState({ rating: 5, content: '', user: '' })
  const [productComments, setProductComments] = useState(comments)

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchRelatedProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/product/${id}`)
      if (response.data.status === 'success') {
        const productData = response.data.data
        setProduct({
          id: productData.id,
          name: productData.name_product,
          price: productData.price_product || 0,
          description: productData.description_product || '',
          image: productData.image_product || '',
          images: productData.images || [productData.image_product],
          stock: productData.quantity_product || 0,
          category: productData.name_category || productData.category,
        })
        // Set first image as default
        if (productData.images && productData.images.length > 0) {
          setSelectedImage(0)
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const response = await axiosInstance.get('/products')
      if (response.data.status === 'success') {
        const data = response.data.data
        const productsList = Array.isArray(data) ? data : (data?.products || [])
        // Lấy 4 sản phẩm khác (loại trừ sản phẩm hiện tại)
        const related = productsList
          .filter(p => p.id !== parseInt(id))
          .slice(0, 4)
          .map(p => ({
            id: p.id,
            title: p.name_product,
            price: p.price_product || 0,
            image: p.image_product || '',
            reviews: p.reviews_count || 0,
          }))
        setRelatedProducts(related)
      }
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm liên quan:', error)
      setRelatedProducts([])
    }
  }

  const updateQuantity = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!authService.isAuthenticated()) {
      if (window.confirm('Bạn cần đăng nhập để thêm vào giỏ hàng. Đi đến trang đăng nhập?')) {
        navigate('/login')
      }
      return
    }

    try {
      await cartService.addToCart(product.id, quantity)
      toast.success('Đã thêm vào giỏ hàng!', {
        description: `Đã thêm ${quantity} sản phẩm vào giỏ hàng.`,
      })
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng', {
        description: error.message || 'Vui lòng thử lại sau.',
      })
    }
  }

  if (!product && !loading) {
    return (
      <div>
        <section className="breadcrumb_section">
          <div className="container">
            <nav className="breadcrumb">
              <Link to="/" className="breadcrumb_link">
                Trang chủ
              </Link>
              <span className="breadcrumb_separator"> / </span>
              <span className="breadcrumb_current">Sản phẩm</span>
            </nav>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <p>Sản phẩm không tồn tại</p>
            <Link to="/products">Quay lại danh sách sản phẩm</Link>
          </div>
        </section>
      </div>
    )
  }

  const productImages = product && product.images && product.images.length > 0 
    ? product.images 
    : product && product.image 
      ? [product.image] 
      : ['https://via.placeholder.com/600']

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (newComment.content.trim() && newComment.user.trim()) {
      const comment = {
        id: productComments.length + 1,
        user: newComment.user,
        rating: newComment.rating,
        date: new Date().toISOString().split('T')[0],
        content: newComment.content,
      }
      setProductComments([comment, ...productComments])
      setNewComment({ rating: 5, content: '', user: '' })
    }
  }

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
            {product?.category && (
              <>
                <Link to={`/products?category=${encodeURIComponent(product.category?.name || product.category || '')}`} className="breadcrumb_link">
                  {product.category?.name || product.category || 'Danh mục'}
                </Link>
                <span className="breadcrumb_separator"> / </span>
              </>
            )}
            <span className="breadcrumb_current">{product?.name || 'Sản phẩm'}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail Section */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '400px',
              padding: '40px 0',
              gap: '15px'
            }}>
              <ClipLoader color="#1976d2" size={50} />
              <p style={{ fontSize: '1.4rem', color: '#666' }}>
                Đang tải chi tiết sản phẩm...
              </p>
            </div>
          ) : product ? (
          <div className="product_detail_wrapper">
            {/* Left Column - Product Images */}
            <div className="product_detail_images">
              <div className="product_main_image">
                {productImages[selectedImage] ? (
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="product_main_img"
                  />
                ) : (
                  <div className="product_main_img" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    <span>No Image</span>
                  </div>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="product_thumbnails">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      className={`product_thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      {img ? (
                        <img src={img} alt={`Thumbnail ${index + 1}`} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="product_detail_info">
              <h1 className="product_detail_title">{product.name}</h1>

              <div className="product_detail_rating">
                <div className="product_stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className="product_star" />
                  ))}
                </div>
                <span className="product_reviews_count">(150 đánh giá)</span>
                <span className="product_stock">| {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
              </div>

              <div className="product_detail_price">{formatCurrency(product.price)}</div>

              <p className="product_detail_description">
                {product.description || 'Không có mô tả cho sản phẩm này.'}
              </p>

              <div className="product_detail_divider"></div>

              {/* Color Selection */}
              <div className="product_option">
                <label className="product_option_label">Màu sắc:</label>
                <div className="product_colors">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      className={`product_color_btn ${selectedColor === color.id ? 'active' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.id)}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="product_option">
                <label className="product_option_label">Kích thước:</label>
                <div className="product_sizes">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`product_size_btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="product_actions">
                <div className="product_quantity">
                  <button
                    className="quantity_btn"
                    onClick={() => updateQuantity(-1)}
                    aria-label="Giảm số lượng"
                  >
                    <FaChevronDown />
                  </button>
                  <input
                    type="number"
                    className="quantity_input"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button
                    className="quantity_btn"
                    onClick={() => updateQuantity(1)}
                    aria-label="Tăng số lượng"
                  >
                    <FaChevronUp />
                  </button>
                </div>
                <button className="product_buy_btn" onClick={handleAddToCart}>
                  Thêm vào giỏ
                </button>
                <button className="product_wishlist_btn" aria-label="Thêm vào yêu thích">
                  <FaHeart />
                </button>
              </div>

              {/* Delivery Info */}
              <div className="product_delivery">
                <div className="product_delivery_item">
                  <FaTruck className="product_delivery_icon" />
                  <div>
                    <p className="product_delivery_title">Giao hàng miễn phí</p>
                    <Link to="/shipping" className="product_delivery_link">
                      Nhập mã bưu điện để kiểm tra khả năng giao hàng
                    </Link>
                  </div>
                </div>
                <div className="product_delivery_item">
                  <FaUndo className="product_delivery_icon" />
                  <div>
                    <p className="product_delivery_title">Đổi trả miễn phí</p>
                    <Link to="/returns" className="product_delivery_link">
                      Đổi trả miễn phí trong 30 ngày. Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : null}
        </div>
      </section>

      {/* Comments Section */}
      <section className="section">
        <div className="container">
          <div className="product_comments">
            <h2 className="product_comments_title">Đánh giá sản phẩm</h2>

            {/* Comment Form */}
            <div className="comment_form_wrapper">
              <h3 className="comment_form_title">Viết đánh giá</h3>
              <form className="comment_form" onSubmit={handleSubmitComment}>
                <div className="comment_form_group">
                  <label className="comment_form_label">Tên của bạn:</label>
                  <input
                    type="text"
                    className="comment_form_input"
                    value={newComment.user}
                    onChange={(e) => setNewComment({ ...newComment, user: e.target.value })}
                    required
                  />
                </div>
                <div className="comment_form_group">
                  <label className="comment_form_label">Đánh giá:</label>
                  <div className="comment_rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`comment_rating_btn ${i < newComment.rating ? 'active' : ''}`}
                        onClick={() => setNewComment({ ...newComment, rating: i + 1 })}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="comment_form_group">
                  <label className="comment_form_label">Nội dung đánh giá:</label>
                  <textarea
                    className="comment_form_textarea"
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <button type="submit" className="comment_submit_btn">
                  Gửi đánh giá
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="comments_list">
              {productComments.map((comment) => (
                <div key={comment.id} className="comment_item">
                  <div className="comment_header">
                    <div className="comment_user_info">
                      <FaUser className="comment_user_icon" />
                      <div>
                        <p className="comment_user_name">{comment.user}</p>
                        <div className="comment_meta">
                          <div className="comment_stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar
                                key={i}
                                className={`comment_star ${i < comment.rating ? 'active' : ''}`}
                              />
                            ))}
                          </div>
                          <span className="comment_date">{comment.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="comment_content">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="section">
        <div className="container">
          <div className="section_category">
            <p className="section_category_p">Sản phẩm liên quan</p>
          </div>
          <div className="section_header">
            <h3 className="section_title">Sản phẩm liên quan</h3>
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
            {relatedProducts.length > 0 ? relatedProducts.map((relatedProduct) => (
              <SwiperSlide key={relatedProduct.id}>
                <div className="card">
                  <div className="card_top">
                    {relatedProduct.image ? (
                      <img src={relatedProduct.image} alt={relatedProduct.title} className="card_img" />
                    ) : (
                      <div className="card_img" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                        <span>No Image</span>
                      </div>
                    )}
                    {relatedProduct.discount && <div className="card_tag">{relatedProduct.discount}</div>}
                    <div className="card_top_icons">
                      <FaHeart className="card_top_icon" />
                      <FaEye className="card_top_icon" />
                    </div>
                  </div>
                  <div className="card_body">
                    <Link to={`/products/${relatedProduct.id}`} className="card_title_link">
                      <h3 className="card_title">{relatedProduct.title}</h3>
                    </Link>
                    <div className="card_price_wrapper">
                      <p className="card_price">{formatCurrency(relatedProduct.price)}</p>
                    </div>
                    <div className="card_ratings">
                      <div className="card_stars">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FaStar key={index} className="w-6 h-6" />
                        ))}
                      </div>
                      <p className="card_rating_numbers">({relatedProduct.reviews})</p>
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
                          await cartService.addToCart(relatedProduct.id, 1)
                          toast.success('Đã thêm vào giỏ hàng!', {
                            description: `${relatedProduct.name_product} đã được thêm vào giỏ hàng.`,
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
            )) : (
              <SwiperSlide>
                <p>Không có sản phẩm liên quan</p>
              </SwiperSlide>
            )}
          </Swiper>
        </div>
      </section>
    </div>
  )
}

export default ProductsDetail
