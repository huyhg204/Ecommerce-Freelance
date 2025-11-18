import { useState, useEffect, useMemo } from 'react'
import { ClipLoader } from 'react-spinners'
import { FaTrash, FaUndo, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { toast } from 'sonner'
import { axiosInstance } from '../../utils/axiosConfig'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [])

  // Đảm bảo users luôn là mảng
  useEffect(() => {
    if (!Array.isArray(users)) {
      console.warn('users is not an array, resetting to []')
      setUsers([])
    }
  }, [users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/users')
      if (response.data.status === 'success') {
        // API trả về data.users, không phải data trực tiếp
        const usersData = response.data.data?.users || response.data.data
        setUsers(Array.isArray(usersData) ? usersData : [])
      } else {
        setUsers([])
      }
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
      console.error('Lỗi khi tải người dùng:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
    
    try {
      await axiosInstance.delete(`/admin/users/${id}`)
      toast.success('Xóa người dùng thành công')
      fetchUsers()
    } catch (error) {
      toast.error('Xóa người dùng thất bại')
      console.error('Lỗi:', error)
    }
  }

  const handleRestore = async (id) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/restore`)
      toast.success('Khôi phục người dùng thành công')
      fetchUsers()
    } catch (error) {
      toast.error('Khôi phục người dùng thất bại')
      console.error('Lỗi:', error)
    }
  }

  // Đảm bảo users luôn là mảng
  const safeUsers = useMemo(() => {
    if (!users) return []
    if (!Array.isArray(users)) {
      console.warn('users is not an array:', users)
      return []
    }
    return users
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(safeUsers)) {
      console.warn('safeUsers is not an array:', safeUsers)
      return []
    }
    return safeUsers.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [safeUsers, searchTerm])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

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
          Đang tải danh sách người dùng...
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '3rem', marginBottom: '30px', color: '#333' }}>
        Quản lý người dùng
      </h1>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          position: 'relative',
          maxWidth: '400px'
        }}>
          <FaSearch style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
            fontSize: '1.6rem'
          }} />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 15px 12px 45px',
              fontSize: '1.4rem',
              border: '1px solid #e0e0e0',
              borderRadius: '5px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #e0e0e0'
              }}>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '1.4rem', fontWeight: 'bold' }}>ID</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '1.4rem', fontWeight: 'bold' }}>Tên</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '1.4rem', fontWeight: 'bold' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '1.4rem', fontWeight: 'bold' }}>Số điện thoại</th>
                <th style={{ padding: '15px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>Tổng đơn hàng</th>
                <th style={{ padding: '15px', textAlign: 'right', fontSize: '1.4rem', fontWeight: 'bold' }}>Tổng chi tiêu</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '1.4rem', fontWeight: 'bold' }}>Trạng thái</th>
                <th style={{ padding: '15px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', fontSize: '1.4rem', color: '#666' }}>
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid #e0e0e0',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '15px', fontSize: '1.4rem' }}>{user.id}</td>
                    <td style={{ padding: '15px', fontSize: '1.4rem', fontWeight: '500' }}>{user.name}</td>
                    <td style={{ padding: '15px', fontSize: '1.4rem' }}>{user.email}</td>
                    <td style={{ padding: '15px', fontSize: '1.4rem', color: '#666' }}>
                      {user.phone || '-'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '1.4rem', fontWeight: '500' }}>
                      {user.total_orders || 0}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '1.4rem', fontWeight: '500', color: '#1976d2' }}>
                      {user.total_spent ? new Intl.NumberFormat('vi-VN').format(user.total_spent) + ' ₫' : '0 ₫'}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        backgroundColor: user.status_user !== 0 ? '#f8d7da' : '#d4edda',
                        color: user.status_user !== 0 ? '#721c24' : '#155724',
                        display: 'inline-block'
                      }}>
                        {user.status_user !== 0 ? 'Đã xóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {user.status_user !== 0 ? (
                        <button
                          onClick={() => handleRestore(user.id)}
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
                        <button
                          onClick={() => handleDelete(user.id)}
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
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && totalPages > 1 && (
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
      {!loading && filteredUsers.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '15px',
          fontSize: '1.3rem',
          color: '#666'
        }}>
          Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
        </div>
      )}
    </div>
  )
}

export default AdminUsers

