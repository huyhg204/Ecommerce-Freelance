import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'
import { axiosInstance } from '../../utils/axiosConfig'
import { formatCurrency } from '../../utils/formatCurrency'

const AdminOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: '',
    delivery_status: ''
  })

  useEffect(() => {
    if (id) {
      fetchOrderDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/admin/orders/${id}`)
      if (response.data.status === 'success') {
        const data = response.data.data
        setOrder(data)
        setStatusForm({
          status: data.order?.status_order?.toString() || '',
          delivery_status: data.order?.status_delivery?.toString() || ''
        })
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng')
      console.error('Lỗi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!statusForm.status) {
      toast.error('Vui lòng chọn trạng thái')
      return
    }

    // API yêu cầu số: 0 (pending), 1 (processing), 2 (completed/confirmed)
    const statusValue = parseInt(statusForm.status)
    if (isNaN(statusValue) || statusValue < 0 || statusValue > 2) {
      toast.error('Trạng thái không hợp lệ')
      return
    }

    try {
      setUpdating(true)
      const payload = { status: statusValue }
      console.log('Updating order status:', payload)
      await axiosInstance.put(`/admin/orders/${id}/status`, payload)
      toast.success('Cập nhật trạng thái thành công')
      fetchOrderDetail()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Cập nhật trạng thái thất bại'
      toast.error(errorMessage)
      console.error('Lỗi khi cập nhật trạng thái:', error.response?.data || error)
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateDeliveryStatus = async () => {
    if (!statusForm.delivery_status) {
      toast.error('Vui lòng chọn trạng thái giao hàng')
      return
    }

    // API yêu cầu số: 0 (received), 1 (shipping), 2 (delivered)
    const deliveryStatusValue = parseInt(statusForm.delivery_status)
    if (isNaN(deliveryStatusValue) || deliveryStatusValue < 0 || deliveryStatusValue > 2) {
      toast.error('Trạng thái giao hàng không hợp lệ')
      return
    }

    try {
      setUpdating(true)
      const payload = { delivery_status: deliveryStatusValue }
      console.log('Updating delivery status:', payload)
      await axiosInstance.put(`/admin/orders/${id}/delivery-status`, payload)
      toast.success('Cập nhật trạng thái giao hàng thành công')
      fetchOrderDetail()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Cập nhật trạng thái giao hàng thất bại'
      toast.error(errorMessage)
      console.error('Lỗi khi cập nhật trạng thái giao hàng:', error.response?.data || error)
    } finally {
      setUpdating(false)
    }
  }


  const getDeliveryStatus = (statusDelivery) => {
    // status_delivery: 0 = Đã nhận hàng, 1 = Đang giao hàng, 2 = Đã giao hàng
    const deliveryStatusMap = {
      0: { label: 'Đã nhận hàng', color: '#ffa500' },
      1: { label: 'Đang giao hàng', color: '#17a2b8' },
      2: { label: 'Đã giao hàng', color: '#28a745' },
    }
    return deliveryStatusMap[statusDelivery] || { label: 'Chưa cập nhật', color: '#6c757d' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontSize: '1.6rem', color: '#666', marginBottom: '20px' }}>
          Không tìm thấy đơn hàng
        </p>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1.4rem'
          }}
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    )
  }

  const orderData = order.order || order
  const orderDetails = order.details || []
  const deliveryStatus = getDeliveryStatus(orderData.status_delivery)

  // Hàm render workflow trạng thái đơn hàng
  const renderWorkflow = () => {
    if (!orderData) return null

    const isCancelled = orderData.status_user_order === 1
    const workflowSteps = []
    
    // Bước 1: Chờ xác nhận (status_order = 0)
    workflowSteps.push({
      step: 1,
      label: 'Chờ xác nhận',
      completed: !isCancelled && orderData.status_order >= 0,
      active: !isCancelled && orderData.status_order === 0,
      color: '#ffa500',
      cancelled: isCancelled
    })

    // Bước 2: Đang xử lý (status_order = 1)
    workflowSteps.push({
      step: 2,
      label: 'Đang xử lý',
      completed: !isCancelled && orderData.status_order >= 1,
      active: !isCancelled && orderData.status_order === 1,
      color: '#17a2b8',
      cancelled: isCancelled
    })

    // Bước 3: Đã giao cho bên vận chuyển (status_order = 2)
    workflowSteps.push({
      step: 3,
      label: 'Đã giao cho bên vận chuyển',
      completed: !isCancelled && orderData.status_order >= 2,
      active: !isCancelled && orderData.status_order === 2,
      color: '#28a745',
      cancelled: isCancelled
    })

    // Chỉ hiển thị các bước delivery khi status_order = 2
    if (orderData.status_order === 2) {
      // Bước 4: Đã nhận hàng (status_delivery = 0)
      workflowSteps.push({
        step: 4,
        label: 'Đã nhận hàng',
        completed: !isCancelled && orderData.status_delivery >= 0,
        active: !isCancelled && orderData.status_delivery === 0,
        color: '#ffa500',
        cancelled: isCancelled
      })

      // Bước 5: Đang giao hàng (status_delivery = 1)
      workflowSteps.push({
        step: 5,
        label: 'Đang giao hàng',
        completed: !isCancelled && orderData.status_delivery >= 1,
        active: !isCancelled && orderData.status_delivery === 1,
        color: '#17a2b8',
        cancelled: isCancelled
      })

      // Bước 6: Đã giao hàng (status_delivery = 2)
      workflowSteps.push({
        step: 6,
        label: 'Đã giao hàng',
        completed: !isCancelled && orderData.status_delivery >= 2,
        active: !isCancelled && orderData.status_delivery === 2,
        color: '#28a745',
        cancelled: isCancelled
      })
    }

    // Bước cuối: Trạng thái user order
    if (orderData.status_user_order === 0) {
      workflowSteps.push({
        step: workflowSteps.length + 1,
        label: 'Đã nhận hàng',
        completed: true,
        active: false,
        color: '#28a745',
        cancelled: false
      })
    } else if (orderData.status_user_order === 1) {
      workflowSteps.push({
        step: workflowSteps.length + 1,
        label: 'Đã hủy đơn',
        completed: true,
        active: true,
        color: '#dc3545',
        cancelled: false
      })
    }

    return (
      <div style={{ 
        marginBottom: '30px',
        padding: '15px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <h3 style={{ fontSize: '1.6rem', marginBottom: '15px', fontWeight: 'bold', color: '#333' }}>
          Tiến trình đơn hàng
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0',
          minWidth: 'max-content',
          paddingBottom: '5px'
        }}>
          {workflowSteps.map((step, index) => {
            const isCancelledStep = step.cancelled
            const nextStep = workflowSteps[index + 1]
            const isNextCancelled = nextStep?.cancelled
            
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '6px', 
                  minWidth: '90px',
                  maxWidth: '90px',
                  padding: '0 5px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCancelledStep ? '#e0e0e0' : (step.completed ? step.color : '#e0e0e0'),
                    color: isCancelledStep ? '#999' : (step.completed ? 'white' : '#999'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    border: step.active ? `2px solid ${step.color}` : 'none',
                    boxShadow: step.active ? `0 0 0 2px rgba(25, 118, 210, 0.15)` : 'none',
                    zIndex: 2,
                    flexShrink: 0,
                    opacity: isCancelledStep ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}>
                    {step.label === 'Đã hủy đơn' ? '✕' : (step.completed && !isCancelledStep ? '✓' : step.step)}
                  </div>
                  <p style={{ 
                    fontSize: '1rem', 
                    fontWeight: step.active ? '600' : '400',
                    color: isCancelledStep ? '#999' : (step.completed ? '#333' : '#999'),
                    margin: 0,
                    textAlign: 'center',
                    lineHeight: '1.2',
                    opacity: isCancelledStep ? 0.6 : 1,
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {step.label}
                  </p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: isNextCancelled ? '#e0e0e0' : (nextStep?.completed ? nextStep.color : '#e0e0e0'),
                    margin: '0 2px',
                    marginTop: '16px',
                    flexShrink: 0,
                    opacity: isNextCancelled ? 0.5 : 1
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
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
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontSize: '1.6rem', color: '#666', marginBottom: '20px' }}>
          Không tìm thấy đơn hàng
        </p>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1.4rem'
          }}
        >
          Quay lại danh sách đơn hàng
        </button>
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
            Chi tiết đơn hàng #{id}
          </h1>
          <p style={{
            fontSize: '1.5rem',
            color: '#6c757d',
            margin: 0
          }}>
            Xem và quản lý thông tin chi tiết đơn hàng
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{
            padding: '14px 28px',
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
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 4px 8px rgba(108, 117, 125, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#6c757d'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 2px 4px rgba(108, 117, 125, 0.2)'
          }}
        >
          Quay lại
        </button>
      </div>

      {/* Order Info */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '32px',
        marginBottom: '24px',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div>
            <p style={{ 
              fontSize: '1.3rem', 
              color: '#6c757d', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Ngày đặt
            </p>
            <p style={{ 
              fontSize: '1.6rem', 
              fontWeight: '600',
              color: '#212529'
            }}>
              {formatDate(orderData.date_order)}
            </p>
          </div>
          {orderData.status_order === 2 && deliveryStatus.label !== 'Chưa cập nhật' && (
          <div>
            <p style={{ 
              fontSize: '1.3rem', 
              color: '#6c757d', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Trạng thái giao hàng
            </p>
            <span style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: '600',
              backgroundColor: deliveryStatus.color === '#ffa500' ? '#fff3cd' : 
                              deliveryStatus.color === '#17a2b8' ? '#d1ecf1' : '#d4edda',
              color: deliveryStatus.color === '#ffa500' ? '#856404' : 
                     deliveryStatus.color === '#17a2b8' ? '#0c5460' : '#155724',
              display: 'inline-block'
            }}>
              {deliveryStatus.label}
            </span>
          </div>
          )}
          <div>
            <p style={{ 
              fontSize: '1.3rem', 
              color: '#6c757d', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Tổng tiền
            </p>
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1976d2'
            }}>
              {formatCurrency(orderData.total_order)}
            </p>
          </div>
        </div>

        {/* Workflow */}
        {renderWorkflow()}

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '20px', 
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            Thông tin khách hàng
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '20px' 
          }}>
            <div>
              <p style={{ 
                fontSize: '1.3rem', 
                color: '#6c757d', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Tên
              </p>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: '#212529'
              }}>
                {orderData.name_customer}
              </p>
            </div>
            <div>
              <p style={{ 
                fontSize: '1.3rem', 
                color: '#6c757d', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Email
              </p>
              <p style={{ 
                fontSize: '1.5rem',
                color: '#495057'
              }}>
                {orderData.user_email || '-'}
              </p>
            </div>
            <div>
              <p style={{ 
                fontSize: '1.3rem', 
                color: '#6c757d', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Số điện thoại
              </p>
              <p style={{ 
                fontSize: '1.5rem',
                color: '#495057'
              }}>
                {orderData.phone_customer}
              </p>
            </div>
            <div>
              <p style={{ 
                fontSize: '1.3rem', 
                color: '#6c757d', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Địa chỉ
              </p>
              <p style={{ 
                fontSize: '1.5rem',
                color: '#495057'
              }}>
                {orderData.address_customer}
              </p>
            </div>
          </div>
        </div>

        {/* Hiển thị lý do hủy đơn nếu đã hủy */}
        {orderData.status_user_order === 1 && (
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffc107'
          }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', fontWeight: 'bold', color: '#856404' }}>
              Đơn hàng đã bị hủy
            </h3>
            <div>
              <p style={{ fontSize: '1.4rem', color: '#666', marginBottom: '10px' }}>
                <strong>Lý do hủy đơn:</strong>
              </p>
              <p style={{ fontSize: '1.4rem', color: '#856404', fontStyle: 'italic' }}>
                {orderData.reason_user_order || 'Không có lý do'}
              </p>
            </div>
          </div>
        )}

        {/* Update Status */}
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #bbdefb',
          opacity: orderData.status_user_order === 1 ? 0.6 : 1
        }}>
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '20px', 
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            Cập nhật trạng thái
          </h3>
          {orderData.status_user_order === 1 ? (
            <p style={{ 
              fontSize: '1.5rem', 
              color: '#dc3545', 
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              Không thể cập nhật trạng thái đơn hàng đã bị hủy
            </p>
          ) : (
            <>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '1.4rem', 
                fontWeight: '600',
                color: '#495057'
              }}>
                Trạng thái đơn hàng
              </label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                disabled={orderData?.status_delivery >= 2}
                style={{
                  padding: '12px 16px',
                  fontSize: '1.4rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '10px',
                  outline: 'none',
                  minWidth: '220px',
                  backgroundColor: '#fff',
                  cursor: orderData?.status_delivery >= 2 ? 'not-allowed' : 'pointer',
                  opacity: orderData?.status_delivery >= 2 ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  if (orderData?.status_delivery < 2) {
                    e.target.style.borderColor = '#1976d2'
                    e.target.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.1)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="0" disabled={orderData?.status_order > 0}>Xác nhận</option>
                    <option value="1" disabled={orderData?.status_order > 1}>Đang xử lý</option>
                    <option value="2" disabled={orderData?.status_order > 2 || (orderData?.status_order === 2 && orderData?.status_delivery >= 2)}>Đã giao cho bên vận chuyển</option>
              </select>
            </div>
            <button
              onClick={handleUpdateStatus}
              disabled={updating || orderData?.status_delivery >= 2}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: (updating || orderData?.status_delivery >= 2) ? 'not-allowed' : 'pointer',
                fontSize: '1.4rem',
                fontWeight: '600',
                opacity: (updating || orderData?.status_delivery >= 2) ? 0.6 : 1,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!updating && orderData?.status_delivery < 2) {
                  e.target.style.backgroundColor = '#1565c0'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!updating && orderData?.status_delivery < 2) {
                  e.target.style.backgroundColor = '#1976d2'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)'
                }
              }}
            >
              {updating ? <ClipLoader color="#fff" size={16} /> : 'Cập nhật'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '1.4rem', 
                fontWeight: '600',
                color: '#495057'
              }}>
                Trạng thái giao hàng
              </label>
              <select
                value={statusForm.delivery_status}
                onChange={(e) => setStatusForm(prev => ({ ...prev, delivery_status: e.target.value }))}
                    disabled={orderData?.status_order !== 2 || orderData?.status_delivery >= 2}
                style={{
                  padding: '12px 16px',
                  fontSize: '1.4rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '10px',
                  outline: 'none',
                      minWidth: '220px',
                      opacity: (orderData?.status_order !== 2 || orderData?.status_delivery >= 2) ? 0.6 : 1,
                      cursor: (orderData?.status_order !== 2 || orderData?.status_delivery >= 2) ? 'not-allowed' : 'pointer',
                      backgroundColor: '#fff',
                      transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  if (orderData?.status_order === 2 && orderData?.status_delivery < 2) {
                    e.target.style.borderColor = '#17a2b8'
                    e.target.style.boxShadow = '0 0 0 3px rgba(23, 162, 184, 0.1)'
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Chọn trạng thái giao hàng</option>
                    <option value="0" disabled={orderData?.status_delivery > 0}>Đã nhận hàng</option>
                    <option value="1" disabled={orderData?.status_delivery > 1}>Đang giao hàng</option>
                    <option value="2" disabled={orderData?.status_delivery >= 2}>Đã giao hàng</option>
              </select>
            </div>
            <button
              onClick={handleUpdateDeliveryStatus}
                  disabled={updating || orderData?.status_order !== 2 || orderData?.status_delivery >= 2}
              style={{
                padding: '12px 24px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                    cursor: (updating || orderData?.status_order !== 2 || orderData?.status_delivery >= 2) ? 'not-allowed' : 'pointer',
                fontSize: '1.4rem',
                fontWeight: '600',
                    opacity: (updating || orderData?.status_order !== 2 || orderData?.status_delivery >= 2) ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!updating && orderData?.status_order === 2 && orderData?.status_delivery < 2) {
                  e.target.style.backgroundColor = '#138496'
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(23, 162, 184, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!updating && orderData?.status_order === 2 && orderData?.status_delivery < 2) {
                  e.target.style.backgroundColor = '#17a2b8'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)'
                }
              }}
            >
              {updating ? <ClipLoader color="#fff" size={16} /> : 'Cập nhật giao hàng'}
            </button>
                {orderData?.status_order !== 2 && (
                  <p style={{ 
                    fontSize: '1.3rem', 
                    color: '#6c757d', 
                    marginTop: '8px', 
                    fontStyle: 'italic',
                    width: '100%'
                  }}>
                    Chỉ có thể cập nhật trạng thái giao hàng khi đơn hàng đã được giao cho bên vận chuyển
                  </p>
                )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* Order Products */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '32px',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ 
          fontSize: '2rem', 
          marginBottom: '24px', 
          fontWeight: '700',
          color: '#1a1a1a'
        }}>
          Sản phẩm
        </h3>
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
                  Sản phẩm
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'right', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Giá
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'center', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Số lượng
                </th>
                <th style={{ 
                  padding: '18px 16px', 
                  textAlign: 'right', 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  color: '#495057',
                  letterSpacing: '0.01em'
                }}>
                  Tổng tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ 
                    padding: '60px 40px', 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    color: '#6c757d',
                    fontWeight: '500'
                  }}>
                    Không có sản phẩm
                  </td>
                </tr>
              ) : (
                orderDetails.map((detail, index) => {
                  const quantity = detail.quantity_detail || 0
                  const totalDetail = detail.total_detail || 0
                  const unitPrice = quantity > 0 ? totalDetail / quantity : 0
                  return (
                    <tr 
                      key={detail.id || index} 
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
                        fontWeight: '500',
                        color: '#212529'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span>{detail.name_product}</span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'right', 
                        fontSize: '1.4rem',
                        fontWeight: '600',
                        color: '#1976d2'
                      }}>
                        {formatCurrency(unitPrice)}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontSize: '1.4rem',
                        fontWeight: '500',
                        color: '#495057'
                      }}>
                        {quantity}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'right', 
                        fontSize: '1.4rem', 
                        fontWeight: '700',
                        color: '#1976d2'
                      }}>
                        {formatCurrency(totalDetail)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail


