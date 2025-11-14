import React from 'react'
import { Link } from 'react-router-dom'
import { FaHeart, FaEye, FaStar } from 'react-icons/fa'
import { formatCurrency } from '../utils/formatCurrency'

const exploreProducts = [
  {
    id: 1,
    title: 'Tablet iPad Pro 12.9 inch',
    price: 100,
    reviews: 24,
    image:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
    badge: 'Mới',
    hasCTA: true,
  },
  {
    id: 2,
    title: 'Máy ảnh Canon EOS DSLR',
    price: 360,
    reviews: 65,
    image:
      'https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Laptop Gaming ASUS ROG',
    price: 1160,
    reviews: 40,
    image:
      'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    badge: 'Hot',
  },
  {
    id: 4,
    title: 'Smartwatch Apple Watch',
    price: 80,
    reviews: 48,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Điện thoại Samsung Galaxy',
    price: 960,
    reviews: 12,
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    title: 'Webcam Logitech 4K',
    price: 116,
    reviews: 32,
    image:
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    title: 'Tay cầm Gaming Xbox',
    price: 660,
    reviews: 58,
    image:
      'https://images.unsplash.com/photo-1614680376573-e720cdb88866?auto=format&fit=crop&w=600&q=80',
    hasCTA: true,
  },
  {
    id: 8,
    title: 'Loa Bluetooth Sony',
    price: 780,
    reviews: 22,
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
  },
]

const ProductsExploreOur = () => {
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
        <div className="products">
          {exploreProducts.map((product) => (
            <div key={product.id} className="card">
              <div className="card_top">
                <img src={product.image} alt={product.title} className="card_img" />
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
                {product.hasCTA && (
                  <button className="add_to_cart add_to_cart--inline">Thêm vào giỏ</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="container_btn">
          <Link to="/collections/all" className="container_btn_a">
            XEM TOÀN BỘ
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductsExploreOur