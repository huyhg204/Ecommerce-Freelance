import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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

const productImages = [
  'https://images.unsplash.com/photo-1614680376573-e720cdb88866?auto=format&fit=crop&w=600&q=80', // Gamepad
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80', // Gamepad angle
  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&q=80', // Gamepad close
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80', // Gamepad detail
]

const colors = [
  { id: 1, name: 'Xanh dương', value: '#4285F4', selected: true },
  { id: 2, name: 'Đỏ', value: '#EA4335', selected: false },
]

const sizes = ['XS', 'S', 'M', 'L', 'XL']

const relatedProducts = [
  {
    id: 1,
    title: 'Bàn phím cơ Gaming RGB',
    price: 120,
    originalPrice: 160,
    discount: '-40%',
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    reviews: 88,
  },
  {
    id: 2,
    title: 'Màn hình Gaming 27 inch',
    price: 960,
    originalPrice: 1160,
    discount: '-35%',
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    reviews: 75,
  },
  {
    id: 3,
    title: 'Chuột Gaming không dây',
    price: 370,
    originalPrice: 400,
    discount: '-30%',
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80',
    reviews: 99,
  },
  {
    id: 4,
    title: 'Tai nghe Gaming 7.1',
    price: 160,
    originalPrice: 170,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    reviews: 65,
  },
]

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
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(colors[0].id)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(2)
  const [newComment, setNewComment] = useState({ rating: 5, content: '', user: '' })
  const [productComments, setProductComments] = useState(comments)

  const updateQuantity = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

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
            <Link to="/categories/gaming" className="breadcrumb_link">
              Gaming
            </Link>
            <span className="breadcrumb_separator"> / </span>
            <span className="breadcrumb_current">Tay cầm Gaming HAVIT HV-G92</span>
          </nav>
        </div>
      </section>

      {/* Product Detail Section */}
      <section className="section">
        <div className="container">
          <div className="product_detail_wrapper">
            {/* Left Column - Product Images */}
            <div className="product_detail_images">
              <div className="product_main_image">
                <img
                  src={productImages[selectedImage]}
                  alt="Tay cầm Gaming HAVIT HV-G92"
                  className="product_main_img"
                />
              </div>
              <div className="product_thumbnails">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    className={`product_thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="product_detail_info">
              <h1 className="product_detail_title">Tay cầm Gaming HAVIT HV-G92</h1>

              <div className="product_detail_rating">
                <div className="product_stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className="product_star" />
                  ))}
                </div>
                <span className="product_reviews_count">(150 đánh giá)</span>
                <span className="product_stock">| Còn hàng</span>
              </div>

              <div className="product_detail_price">{formatCurrency(192)}</div>

              <p className="product_detail_description">
                PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy
                bubble free install & mess free removal Pressure sensitive.
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
                <button className="product_buy_btn">Mua ngay</button>
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
            {relatedProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="card">
                  <div className="card_top">
                    <img src={product.image} alt={product.title} className="card_img" />
                    {product.discount && <div className="card_tag">{product.discount}</div>}
                    <div className="card_top_icons">
                      <FaHeart className="card_top_icon" />
                      <FaEye className="card_top_icon" />
                    </div>
                  </div>
                  <div className="card_body">
                    <Link to={`/products/${product.id}`} className="card_title_link">
                      <h3 className="card_title">{product.title}</h3>
                    </Link>
                    <div className="card_price_wrapper">
                      <p className="card_price">{formatCurrency(product.price)}</p>
                      {product.originalPrice && (
                        <p className="card_price_original">{formatCurrency(product.originalPrice)}</p>
                      )}
                    </div>
                    <div className="card_ratings">
                      <div className="card_stars">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FaStar key={index} className="w-6 h-6" />
                        ))}
                      </div>
                      <p className="card_rating_numbers">({product.reviews})</p>
                    </div>
                    <button className="add_to_cart">Thêm vào giỏ</button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  )
}

export default ProductsDetail
