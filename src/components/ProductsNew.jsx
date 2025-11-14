import React from 'react'
import { Link } from 'react-router-dom'

const galleryItems = [
  {
    id: 1,
    title: 'PlayStation 5',
    description: 'Phiên bản Đen - Trắng của PS5 sắp mở bán.',
    cta: 'Mua ngay',
    image:
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1100&q=80',
    modifier: 'gallery_item_1',
  },
  {
    id: 2,
    title: "Women's Collections",
    description: 'Bộ sưu tập thời trang nữ mang phong cách mới.',
    cta: 'Mua ngay',
    image:
      'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1100&q=80',
    modifier: 'gallery_item_2',
  },
  {
    id: 3,
    title: 'Speakers',
    description: 'Loa không dây Amazon chất lượng cao.',
    cta: 'Mua ngay',
    image:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1100&q=80',
    modifier: 'gallery_item_3',
  },
  {
    id: 4,
    title: 'Perfume',
    description: 'GUCCI INTENSE OUD EDP chính hãng.',
    cta: 'Mua ngay',
    image:
      'https://images.unsplash.com/photo-1509940821842-98cfeea102b0?auto=format&fit=crop&w=1100&q=80',
    modifier: 'gallery_item_4',
  },
]

const ProductsNew = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="section_category">
          <p className="section_category_p">Nổi bật</p>
        </div>
        <div className="section_header">
          <h3 className="section_title">Hàng mới về</h3>
        </div>
        <div className="gallery">
          {galleryItems.map((item) => (
            <div key={item.id} className={`gallery_item ${item.modifier}`}>
              <img src={item.image} alt={item.title} className="gallery_item_img" />
              <div className="gallery_item_content">
                <div className="gallery_item_title">{item.title}</div>
                <p className="gallery_item_p">{item.description}</p>
                <Link to="/collections/new-arrival" className="gallery_item_link">
                  {item.cta.toUpperCase()}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductsNew
