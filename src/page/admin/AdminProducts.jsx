import { useState, useEffect, useMemo } from 'react'
import { ClipLoader } from 'react-spinners'
import { FaPlus, FaEdit, FaTrash, FaUndo, FaSearch, FaEye, FaEyeSlash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { toast } from 'sonner'
import { axiosInstance } from '../../utils/axiosConfig'
import { formatCurrency } from '../../utils/formatCurrency'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    image: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Đảm bảo products luôn là mảng
  useEffect(() => {
    if (!Array.isArray(products)) {
      console.warn('products is not an array, resetting to []')
      setProducts([])
    }
  }, [products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/products')
      if (response.data.status === 'success') {
        // API trả về data.products, không phải data trực tiếp
        const productsData = response.data.data?.products || response.data.data
        setProducts(Array.isArray(productsData) ? productsData : [])
      } else {
        setProducts([])
      }
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm')
      console.error('Lỗi khi tải sản phẩm:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/admin/categories')
      if (response.data.status === 'success') {
        // Chỉ lấy các category đang hoạt động (status_category === 0)
        const activeCategories = (response.data.data || []).filter(
          cat => cat.status_category === 0
        )
        setCategories(activeCategories)
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        // Update - chỉ gửi các field cần thiết
        const updateData = {
          name: formData.name,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        }
        await axiosInstance.put(`/admin/products/${editingProduct.id}`, updateData)
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        // Create - gửi tất cả các field
        const createData = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
          stock: parseInt(formData.stock),
          image: formData.image
        }
        await axiosInstance.post('/admin/products', createData)
        toast.success('Tạo sản phẩm thành công')
      }
      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock: '',
        image: ''
      })
      fetchProducts()
    } catch (error) {
      toast.error(editingProduct ? 'Cập nhật thất bại' : 'Tạo sản phẩm thất bại')
      console.error('Lỗi:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name_product || '',
      description: product.description_product || '',
      price: product.price_product || '',
      category_id: product.category_id || '',
      stock: product.quantity_product || '',
      image: product.image_product || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    
    try {
      await axiosInstance.delete(`/admin/products/${id}/delete`)
      toast.success('Xóa sản phẩm thành công')
      fetchProducts()
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại')
      console.error('Lỗi:', error)
    }
  }

  const handleRestore = async (id) => {
    try {
      await axiosInstance.put(`/admin/products/${id}/restore`)
      toast.success('Khôi phục sản phẩm thành công')
      fetchProducts()
    } catch (error) {
      toast.error('Khôi phục sản phẩm thất bại')
      console.error('Lỗi:', error)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      const response = await axiosInstance.put(`/admin/products/${id}/toggle-status`)
      if (response.data.status === 'success') {
        const newStatus = response.data.data.status_product
        toast.success(newStatus === 1 ? 'Đã ẩn sản phẩm thành công' : 'Đã hiển thị sản phẩm thành công')
        fetchProducts()
      }
    } catch (error) {
      toast.error('Thay đổi trạng thái sản phẩm thất bại')
      console.error('Lỗi:', error)
    }
  }

  // Đảm bảo products luôn là mảng
  const safeProducts = useMemo(() => {
    if (!products) return []
    if (!Array.isArray(products)) {
      console.warn('products is not an array:', products)
      return []
    }
    return products
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(safeProducts)) {
      console.warn('safeProducts is not an array:', safeProducts)
      return []
    }
    return safeProducts.filter(product =>
      product.name_product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description_product?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [safeProducts, searchTerm])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        gap: '15px'
      }}>
        <ClipLoader color="#1976d2" size={50} />
        <p style={{ fontSize: '1.4rem', color: '#666' }}>
          Đang tải danh sách sản phẩm...
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '3.2rem', 
            margin: 0, 
            marginBottom: '8px',
            color: '#1a1a1a',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>
            Quản lý sản phẩm
          </h1>
          <p style={{
            fontSize: '1.5rem',
            color: '#6c757d',
            margin: 0
          }}>
            Quản lý và theo dõi tất cả sản phẩm của cửa hàng
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              category_id: '',
              stock: '',
              image: ''
            })
            setShowModal(true)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1.4rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)'
          }}
        >
          <FaPlus /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          position: 'relative',
          maxWidth: '450px'
        }}>
          <FaSearch style={{
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c757d',
            fontSize: '1.6rem',
            zIndex: 1
          }} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px 14px 50px',
              fontSize: '1.4rem',
              border: '2px solid #e9ecef',
              borderRadius: '10px',
              outline: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: '#fff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1976d2'
              e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e9ecef'
              }}>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  ID
                </th>
                <th style={{ 
                  padding: '18px 12px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em',
                  width: '70px'
                }}>
                  Hình ảnh
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Tên
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Danh mục
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Giá
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Tồn kho
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Trạng thái
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'center', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ 
                    padding: '60px 40px', 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    color: '#6c757d',
                    fontWeight: '500'
                  }}>
                    Không có sản phẩm nào
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '1.4rem',
                      color: '#495057',
                      fontWeight: '500'
                    }}>
                      #{product.id}
                    </td>
                    <td style={{ padding: '16px 12px', width: '70px' }}>
                      {product.image_product ? (
                        <img
                          src={product.image_product}
                          alt={product.name_product}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          color: '#adb5bd',
                          fontWeight: '500'
                        }}>
                          📷
                        </div>
                      )}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '1.4rem',
                      fontWeight: '500',
                      color: '#212529'
                    }}>
                      {product.name_product}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '1.4rem', 
                      color: '#6c757d'
                    }}>
                      {product.name_category || '-'}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '1.4rem',
                      fontWeight: '600',
                      color: '#1976d2'
                    }}>
                      {formatCurrency(product.price_product)}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      fontSize: '1.4rem',
                      fontWeight: '500',
                      color: '#212529'
                    }}>
                      {product.quantity_product}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        backgroundColor: product.status_product === 0 ? '#d4edda' : 
                                        product.status_product === 1 ? '#fff3cd' : '#f8d7da',
                        color: product.status_product === 0 ? '#155724' : 
                               product.status_product === 1 ? '#856404' : '#721c24',
                        display: 'inline-block'
                      }}>
                        {product.status_product === 0 ? 'Hoạt động' : 
                         product.status_product === 1 ? 'Đã ẩn' : 'Đã xóa'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }}>
                        {product.status_product > 1 ? (
                          // Đã xóa - chỉ hiển thị nút Khôi phục
                          <button
                            onClick={() => handleRestore(product.id)}
                            style={{
                              padding: '8px 14px',
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(23, 162, 184, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#138496'
                              e.target.style.transform = 'translateY(-1px)'
                              e.target.style.boxShadow = '0 4px 8px rgba(23, 162, 184, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#17a2b8'
                              e.target.style.transform = 'translateY(0)'
                              e.target.style.boxShadow = '0 2px 4px rgba(23, 162, 184, 0.2)'
                            }}
                          >
                            <FaUndo /> Khôi phục
                          </button>
                        ) : (
                          // Đang hoạt động (0) hoặc Đã ẩn (1) - hiển thị Sửa, Toggle, Xóa
                          <>
                            <button
                              onClick={() => handleEdit(product)}
                              style={{
                                padding: '8px 14px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#1565c0'
                                e.target.style.transform = 'translateY(-1px)'
                                e.target.style.boxShadow = '0 4px 8px rgba(25, 118, 210, 0.3)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#1976d2'
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = '0 2px 4px rgba(25, 118, 210, 0.2)'
                              }}
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product.id)}
                              style={{
                                padding: '8px 14px',
                                backgroundColor: product.status_product === 0 ? '#ffc107' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                                boxShadow: product.status_product === 0 
                                  ? '0 2px 4px rgba(255, 193, 7, 0.2)' 
                                  : '0 2px 4px rgba(40, 167, 69, 0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)'
                                if (product.status_product === 0) {
                                  e.target.style.backgroundColor = '#ffb300'
                                  e.target.style.boxShadow = '0 4px 8px rgba(255, 193, 7, 0.3)'
                                } else {
                                  e.target.style.backgroundColor = '#218838'
                                  e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)'
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.backgroundColor = product.status_product === 0 ? '#ffc107' : '#28a745'
                                e.target.style.boxShadow = product.status_product === 0 
                                  ? '0 2px 4px rgba(255, 193, 7, 0.2)' 
                                  : '0 2px 4px rgba(40, 167, 69, 0.2)'
                              }}
                            >
                              {product.status_product === 0 ? (
                                <>
                                  <FaEyeSlash /> Ẩn
                                </>
                              ) : (
                                <>
                                  <FaEye /> Hiển thị
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              style={{
                                padding: '8px 14px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#c82333'
                                e.target.style.transform = 'translateY(-1px)'
                                e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#dc3545'
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.2)'
                              }}
                            >
                              <FaTrash /> Xóa
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '32px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              padding: '10px 16px',
              fontSize: '1.4rem',
              border: '2px solid #e9ecef',
              borderRadius: '10px',
              backgroundColor: currentPage === 1 ? '#f8f9fa' : '#fff',
              color: currentPage === 1 ? '#adb5bd' : '#495057',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.borderColor = '#1976d2'
                e.target.style.color = '#1976d2'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = '#fff'
                e.target.style.borderColor = '#e9ecef'
                e.target.style.color = '#495057'
              }
            }}
          >
            <FaChevronLeft />
            <span>Trước</span>
          </button>

          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  style={{
                    padding: '10px 5px',
                    fontSize: '1.4rem',
                    color: '#666'
                  }}
                >
                  ...
                </span>
              )
            }
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: '10px 16px',
                  fontSize: '1.4rem',
                  border: '2px solid',
                  borderColor: currentPage === page ? '#1976d2' : '#e9ecef',
                  borderRadius: '10px',
                  backgroundColor: currentPage === page ? '#1976d2' : '#fff',
                  color: currentPage === page ? '#fff' : '#495057',
                  cursor: 'pointer',
                  minWidth: '44px',
                  transition: 'all 0.2s ease',
                  fontWeight: currentPage === page ? '700' : '600',
                  boxShadow: currentPage === page ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page) {
                    e.target.style.backgroundColor = '#f8f9fa'
                    e.target.style.borderColor = '#1976d2'
                    e.target.style.color = '#1976d2'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page) {
                    e.target.style.backgroundColor = '#fff'
                    e.target.style.borderColor = '#e9ecef'
                    e.target.style.color = '#495057'
                  }
                }}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '10px 16px',
              fontSize: '1.4rem',
              border: '2px solid #e9ecef',
              borderRadius: '10px',
              backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#fff',
              color: currentPage === totalPages ? '#adb5bd' : '#495057',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.borderColor = '#1976d2'
                e.target.style.color = '#1976d2'
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = '#fff'
                e.target.style.borderColor = '#e9ecef'
                e.target.style.color = '#495057'
              }
            }}
          >
            <span>Sau</span>
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Info */}
      {!loading && filteredProducts.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '15px',
          fontSize: '1.3rem',
          color: '#666'
        }}>
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} trong tổng số {filteredProducts.length} sản phẩm
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              fontSize: '2.4rem', 
              marginBottom: '24px', 
              color: '#1a1a1a',
              fontWeight: '700'
            }}>
              {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '1.4rem', 
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1.4rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1976d2'
                    e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '1.4rem', 
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1.4rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1976d2'
                    e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '1.4rem', 
                    fontWeight: '600',
                    color: '#495057'
                  }}>
                    Giá *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '1.4rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1976d2'
                      e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '1.4rem', 
                    fontWeight: '600',
                    color: '#495057'
                  }}>
                    Tồn kho *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '1.4rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1976d2'
                      e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '1.4rem', 
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  Danh mục *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1.4rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1976d2'
                    e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_category}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '1.4rem', 
                  fontWeight: '600',
                  color: '#495057'
                }}>
                  URL Hình ảnh
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1.4rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1976d2'
                    e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(108, 117, 125, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5a6268'
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c757d'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.2)'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1565c0'
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1976d2'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts

