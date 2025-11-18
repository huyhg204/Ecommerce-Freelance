import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import {
  FaMobileAlt,
  FaLaptop,
  FaClock,
  FaCamera,
  FaHeadphonesAlt,
  FaGamepad,
  FaTshirt,
  FaFemale,
  FaMale,
  FaRunning,
  FaBed,
  FaGem,
  FaShoePrints,
} from 'react-icons/fa'
import { axiosInstance } from '../utils/axiosConfig'

// Icon mapping cho các category
const iconMap = {
  'Điện thoại': FaMobileAlt,
  'Smartphone': FaMobileAlt,
  'Máy tính': FaLaptop,
  'Laptop': FaLaptop,
  'Đồng hồ thông minh': FaClock,
  'Wearable': FaClock,
  'Máy ảnh': FaCamera,
  'Camera': FaCamera,
  'Tai nghe': FaHeadphonesAlt,
  'Audio': FaHeadphonesAlt,
  'Thiết bị gaming': FaGamepad,
  'Gaming': FaGamepad,
  // Danh mục thời trang
  'Áo Nữ': FaTshirt,
  'Quần Nam': FaMale,
  'Quần Nữ': FaFemale,
  'Váy Đầm': FaFemale,
  'Áo Khoác': FaTshirt,
  'Đồ Thể Thao': FaRunning,
  'Đồ Ngủ': FaBed,
  'Phụ Kiện': FaGem,
  'Giày Dép': FaShoePrints,
  'default': FaMobileAlt,
}

const Category = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/categories')
      if (response.data.status === 'success') {
        const data = response.data.data
        const categoriesList = Array.isArray(data) ? data : (data?.categories || [])
        // Chỉ lấy danh mục đang hoạt động (status_category === 0)
        const activeCategories = categoriesList.filter(category => category.status_category === 0)
        setCategories(activeCategories)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (categoryName) => {
    const Icon = iconMap[categoryName] || iconMap.default
    return Icon
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section_category">
          <p className="section_category_p">Danh mục</p>
        </div>
        <div className="section_header">
          <h3 className="section_title">Khám phá theo danh mục</h3>
        </div>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            padding: '40px 0',
            gap: '15px'
          }}>
            <ClipLoader color="#1976d2" size={40} />
            <p style={{ fontSize: '1.4rem', color: '#666' }}>
              Đang tải danh mục...
            </p>
          </div>
        ) : categories.length === 0 ? null : (
          <div className="categories">
            {categories.map((category) => {
              const categoryName = category.name_category || category.name || ''
              const Icon = getIcon(categoryName)
              return (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(categoryName)}`}
                  className="category"
                >
                  <span className="category_icon_wrapper">
                    <Icon className="category_icon" />
                  </span>
                  <p className="category_name">{categoryName}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Category