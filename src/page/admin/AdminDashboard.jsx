import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { FaBox, FaShoppingBag, FaUsers, FaDollarSign } from 'react-icons/fa'
import { axiosInstance } from '../../utils/axiosConfig'
import { formatCurrency } from '../../utils/formatCurrency'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [timePeriod, setTimePeriod] = useState('day')

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query params
      const params = {}
      if (filterDate) {
        params.date = filterDate
        params.time_period = timePeriod
      }
      
      // Fetch revenue với filter
      const revenueResponse = await axiosInstance.get('/admin/revenue', { params })
      let revenueData = null
      if (revenueResponse.data.status === 'success') {
        revenueData = revenueResponse.data.data
        // Convert quantity_sold từ string sang number cho top_products
        if (revenueData.top_products && Array.isArray(revenueData.top_products)) {
          revenueData.top_products = revenueData.top_products.map(product => ({
            ...product,
            quantity_sold: parseInt(product.quantity_sold) || 0,
            total_revenue: Number(product.total_revenue) || 0
          }))
        }
        setRevenue(revenueData)
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [filterDate, timePeriod])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleFilterChange = () => {
    fetchDashboardData()
  }

  const handleResetFilter = () => {
    setFilterDate('')
    setTimePeriod('day')
  }

  // Get current date for default value
  const getCurrentDate = () => {
    const now = new Date()
    return now.toISOString().split('T')[0] // YYYY-MM-DD
  }

  const statCards = [
    {
      title: 'Tổng sản phẩm',
      value: revenue?.summary?.total_products || 0,
      icon: FaBox,
      color: '#1976d2',
      link: '/admin/products'
    },
    {
      title: 'Tổng đơn hàng',
      value: revenue?.summary?.total_orders || 0,
      icon: FaShoppingBag,
      color: '#28a745',
      link: '/admin/orders'
    },
    {
      title: 'Tổng người dùng',
      value: revenue?.summary?.total_users || 0,
      icon: FaUsers,
      color: '#ffc107',
      link: '/admin/users'
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(revenue?.summary?.total_revenue || 0),
      icon: FaDollarSign,
      color: '#dc3545',
      link: '/admin/revenue'
    }
  ]

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '10px', 
          color: '#1a1a1a',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        }}>
          Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.6rem', 
          color: '#666',
          margin: 0,
          marginBottom: '24px'
        }}>
          Tổng quan về hoạt động của cửa hàng
        </p>

        {/* Filter Section */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px 24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          marginBottom: '24px'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#333', 
              marginBottom: '8px' 
            }}>
              Chu kỳ thời gian:
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '1.4rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
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
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '1.4rem', 
              fontWeight: '600', 
              color: '#333', 
              marginBottom: '8px' 
            }}>
              {timePeriod === 'year' ? 'Năm:' : timePeriod === 'month' ? 'Tháng:' : 'Ngày:'}
            </label>
            <input
              type={timePeriod === 'year' ? 'date' : timePeriod === 'month' ? 'month' : 'date'}
              value={timePeriod === 'year' ? (filterDate ? `${filterDate}-01-01` : getCurrentDate()) : 
                     timePeriod === 'month' ? (filterDate || new Date().toISOString().substring(0, 7)) : 
                     (filterDate || getCurrentDate())}
              onChange={(e) => {
                if (timePeriod === 'year') {
                  // Lấy năm từ date picker
                  const selectedDate = e.target.value
                  if (selectedDate) {
                    const year = selectedDate.split('-')[0]
                    setFilterDate(year)
                  } else {
                    setFilterDate('')
                  }
                } else {
                  setFilterDate(e.target.value)
                }
              }}
              onClick={(e) => {
                // Mở date picker khi click vào input
                if (e.target.showPicker) {
                  try {
                    e.target.showPicker()
                  } catch (error) {
                    // Nếu showPicker không được hỗ trợ hoặc không có user gesture, bỏ qua
                    console.warn('showPicker không khả dụng:', error)
                  }
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1976d2'
                e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef'
                e.target.style.boxShadow = 'none'
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '1.4rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: '#fff',
                outline: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleFilterChange}
              style={{
                padding: '10px 24px',
                fontSize: '1.4rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1565c0'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1976d2'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Áp dụng
            </button>
            {filterDate && (
              <button
                onClick={handleResetFilter}
                style={{
                  padding: '10px 24px',
                  fontSize: '1.4rem',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e8e8e8'
                  e.target.style.borderColor = '#1976d2'
                  e.target.style.color = '#1976d2'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5'
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.color = '#333'
                }}
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading && !revenue ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: '15px',
          marginBottom: '40px'
        }}>
          <ClipLoader color="#1976d2" size={50} />
          <p style={{ fontSize: '1.4rem', color: '#666' }}>
            Đang tải dữ liệu dashboard...
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
            position: 'relative'
          }}>
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                borderRadius: '16px'
              }}>
                <ClipLoader color="#1976d2" size={40} />
              </div>
            )}
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link
                  key={index}
                  to={card.link}
                  style={{
                    backgroundColor: '#fff',
                    padding: '28px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    textDecoration: 'none',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}25 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease'
                  }}>
                    <Icon style={{ fontSize: '2.8rem', color: card.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '1.4rem', 
                      color: '#666', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      {card.title}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '2.4rem', 
                      fontWeight: '700', 
                      color: '#1a1a1a',
                      lineHeight: '1.2'
                    }}>
                      {card.value}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Filter Info */}
          {revenue && revenue.filter && (
            <div style={{
              backgroundColor: '#fff',
              padding: '20px 24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <p style={{ fontSize: '1.4rem', color: '#666', margin: '0 0 4px 0', fontWeight: '500' }}>
                    Thông tin lọc:
                  </p>
                  <p style={{ fontSize: '1.6rem', color: '#333', margin: 0, fontWeight: '600' }}>
                    {revenue.filter.period === 'day' ? 'Theo ngày' : 
                     revenue.filter.period === 'month' ? 'Theo tháng' : 
                     revenue.filter.period === 'year' ? 'Theo năm' : 
                     revenue.filter.period || '-'} - {revenue.filter.date || '-'}
                  </p>
                </div>
                {revenue.filter.note && (
                  <p style={{ 
                    fontSize: '1.3rem', 
                    color: '#666', 
                    margin: 0,
                    fontStyle: 'italic',
                    maxWidth: '500px'
                  }}>
                    {revenue.filter.note}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Top Products */}
          {revenue && revenue.top_products && revenue.top_products.length > 0 && (
            <div style={{
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              <h2 style={{ 
                fontSize: '2.2rem', 
                marginBottom: '24px', 
                color: '#1a1a1a',
                fontWeight: '700'
              }}>
                Sản phẩm bán chạy
              </h2>
              {loading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                  borderRadius: '16px'
                }}>
                  <ClipLoader color="#1976d2" size={40} />
                </div>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f8f9fa',
                      borderBottom: '2px solid #e9ecef'
                    }}>
                      <th style={{ 
                        padding: '16px', 
                        textAlign: 'left', 
                        fontSize: '1.3rem', 
                        fontWeight: '600',
                        color: '#495057',
                        letterSpacing: '0.01em'
                      }}>
                        Hình ảnh
                      </th>
                      <th style={{ 
                        padding: '16px', 
                        textAlign: 'left', 
                        fontSize: '1.3rem', 
                        fontWeight: '600',
                        color: '#495057',
                        letterSpacing: '0.01em'
                      }}>
                        Tên sản phẩm
                      </th>
                      <th style={{ 
                        padding: '16px', 
                        textAlign: 'right', 
                        fontSize: '1.3rem', 
                        fontWeight: '600',
                        color: '#495057',
                        letterSpacing: '0.01em'
                      }}>
                        Giá
                      </th>
                      <th style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontSize: '1.3rem', 
                        fontWeight: '600',
                        color: '#495057',
                        letterSpacing: '0.01em'
                      }}>
                        Số lượng bán
                      </th>
                      <th style={{ 
                        padding: '16px', 
                        textAlign: 'right', 
                        fontSize: '1.3rem', 
                        fontWeight: '600',
                        color: '#495057',
                        letterSpacing: '0.01em'
                      }}>
                        Doanh thu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue.top_products.map((product, index) => (
                      <tr 
                        key={product.product_id || index} 
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
                        <td style={{ padding: '16px' }}>
                          {product.image_product ? (
                            <img
                              src={product.image_product}
                              alt={product.name_product}
                              style={{
                                width: '64px',
                                height: '64px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '64px',
                              height: '64px',
                              backgroundColor: '#e9ecef',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.1rem',
                              color: '#adb5bd',
                              fontWeight: '500'
                            }}>
                              No Image
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
                          textAlign: 'right', 
                          fontSize: '1.4rem',
                          fontWeight: '600',
                          color: '#1976d2'
                        }}>
                          {formatCurrency(product.price_product || 0)}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          fontSize: '1.4rem', 
                          fontWeight: '700', 
                          color: '#28a745'
                        }}>
                          {product.quantity_sold || 0}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'right', 
                          fontSize: '1.4rem', 
                          fontWeight: '700', 
                          color: '#dc3545'
                        }}>
                          {formatCurrency(product.total_revenue || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDashboard

