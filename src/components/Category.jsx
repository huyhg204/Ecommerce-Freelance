import React from 'react'
import {
  FaMobileAlt,
  FaLaptop,
  FaClock,
  FaCamera,
  FaHeadphonesAlt,
  FaGamepad,
} from 'react-icons/fa'

const categories = [
  { id: 1, name: 'Điện thoại', icon: FaMobileAlt },
  { id: 2, name: 'Máy tính', icon: FaLaptop },
  { id: 3, name: 'Đồng hồ thông minh', icon: FaClock },
  { id: 4, name: 'Máy ảnh', icon: FaCamera },
  { id: 5, name: 'Tai nghe', icon: FaHeadphonesAlt },
  { id: 6, name: 'Thiết bị gaming', icon: FaGamepad },
]

const Category = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="section_category">
          <p className="section_category_p">Danh mục</p>
        </div>
        <div className="section_header">
          <h3 className="section_title">Khám phá theo danh mục</h3>
        </div>
        <div className="categories">
          {categories.map(({ id, name, icon: Icon }) => (
            <div key={id} className="category">
              <span className="category_icon_wrapper">
                <Icon className="category_icon" />
              </span>
              <p className="category_name">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Category