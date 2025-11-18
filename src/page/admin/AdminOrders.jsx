import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { FaEye, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { toast } from 'sonner'
import { axiosInstance } from '../../utils/axiosConfig'
import { formatCurrency } from '../../utils/formatCurrency'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [])

  // Đảm bảo orders luôn là mảng
  useEffect(() => {
    if (!Array.isArray(orders)) {
      console.warn('orders is not an array, resetting to []')
      setOrders([])
    }
  }, [orders])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/orders')
      if (response.data.status === 'success') {
        // API trả về data.orders, không phải data trực tiếp
        const ordersData = response.data.data?.orders || response.data.data
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } else {
        setOrders([])
      }
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng')
      console.error('Lỗi khi tải đơn hàng:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatus = (statusOrder) => {
    // status_order: 0 = Chờ xác nhận, 1 = Đang xử lý, 2 = Đã giao cho bên vận chuyển
    const statusMap = {
      0: { label: 'Chờ xác nhận', color: '#ffa500' },
      1: { label: 'Đang xử lý', color: '#17a2b8' },
      2: { label: 'Đã giao cho bên vận chuyển', color: '#28a745' },
    }
    return statusMap[statusOrder] || { label: 'Không xác định', color: '#6c757d' }
  }

  // Hàm xác định trạng thái cuối cùng trong workflow
  const getFinalStatus = (order) => {
    // Nếu đã hủy đơn, trả về trạng thái hủy
    if (order.status_user_order === 1) {
      return { label: 'Đã hủy đơn', color: '#dc3545' }
    }

    // Nếu đã giao cho bên vận chuyển, kiểm tra trạng thái giao hàng
    if (order.status_order === 2) {
      // Nếu đã có trạng thái giao hàng
      if (order.status_delivery !== null && order.status_delivery !== undefined) {
        if (order.status_delivery === 2) {
          return { label: 'Đã giao hàng', color: '#28a745' }
        }
        if (order.status_delivery === 1) {
          return { label: 'Đang giao hàng', color: '#17a2b8' }
        }
        if (order.status_delivery === 0) {
          return { label: 'Đã nhận hàng', color: '#ffa500' }
        }
      }
      // Nếu chưa có trạng thái giao hàng
      return { label: 'Đã giao cho bên vận chuyển', color: '#28a745' }
    }

    // Trả về trạng thái đơn hàng hiện tại
    return getOrderStatus(order.status_order)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Đảm bảo orders luôn là mảng
  const safeOrders = useMemo(() => {
    if (!orders) return []
    if (!Array.isArray(orders)) {
      console.warn('orders is not an array:', orders)
      return []
    }
    return orders
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(safeOrders)) {
      console.warn('safeOrders is not an array:', safeOrders)
      return []
    }
    return safeOrders.filter(order =>
      order.id?.toString().includes(searchTerm) ||
      order.name_customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [safeOrders, searchTerm])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

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
          Đang tải danh sách đơn hàng...
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        marginBottom: '32px'
      }}>
        <h1 style={{ 
          fontSize: '3.2rem', 
          margin: 0, 
          marginBottom: '8px',
          color: '#1a1a1a',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        }}>
          Quản lý đơn hàng
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: '#6c757d',
          margin: 0
        }}>
          Theo dõi và quản lý tất cả đơn hàng của khách hàng
        </p>
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
            placeholder="Tìm kiếm đơn hàng..."
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

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Khách hàng
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Ngày đặt
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'left', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Tổng tiền
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
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ 
                    padding: '60px 40px', 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    color: '#6c757d',
                    fontWeight: '500'
                  }}>
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const finalStatus = getFinalStatus(order)
                  return (
                    <tr
                      key={order.id}
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
                        #{order.id}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div>
                          <p style={{ 
                            margin: 0, 
                            fontWeight: '600',
                            fontSize: '1.4rem',
                            color: '#212529'
                          }}>
                            {order.name_customer || order.user_name}
                          </p>
                          <p style={{ 
                            margin: '6px 0 0 0', 
                            fontSize: '1.3rem', 
                            color: '#6c757d'
                          }}>
                            {order.user_email || order.phone_customer}
                          </p>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        fontSize: '1.4rem',
                        color: '#495057'
                      }}>
                        {formatDate(order.date_order)}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        fontSize: '1.4rem', 
                        fontWeight: '700',
                        color: '#1976d2'
                      }}>
                        {formatCurrency(order.total_order)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          backgroundColor: finalStatus.color === '#dc3545' ? '#f8d7da' :
                                          finalStatus.color === '#ffa500' ? '#fff3cd' : 
                                          finalStatus.color === '#17a2b8' ? '#d1ecf1' : '#d4edda',
                          color: finalStatus.color === '#dc3545' ? '#721c24' :
                                 finalStatus.color === '#ffa500' ? '#856404' : 
                                 finalStatus.color === '#17a2b8' ? '#0c5460' : '#155724',
                          display: 'inline-block'
                        }}>
                          {finalStatus.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1.3rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none',
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
                          <FaEye /> Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredOrders.length > 0 && totalPages > 1 && (
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
                    color: '#6c757d'
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
      {!loading && filteredOrders.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '15px',
          fontSize: '1.3rem',
          color: '#666'
        }}>
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
        </div>
      )}
    </div>
  )
}

export default AdminOrders

