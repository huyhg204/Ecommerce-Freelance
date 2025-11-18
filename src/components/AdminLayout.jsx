import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  FaHome, FaBox, FaTags, FaUsers, FaShoppingBag, 
  FaSignOutAlt, FaBars, FaTimes 
} from 'react-icons/fa'
import { authService } from '../utils/authService'
import { axiosInstance } from '../utils/axiosConfig'
import { toast } from 'sonner'

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = () => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }
    
    const currentUser = authService.getUser()
    if (currentUser?.role_user !== 1) {
      toast.error('Bạn không có quyền truy cập trang Admin')
      navigate('/')
      return
    }
  }

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/user')
      if (response.data.status === 'success') {
        const userData = response.data.data
        setUser(userData)
        if (userData.role_user !== 1) {
          toast.error('Bạn không có quyền truy cập trang Admin')
          navigate('/')
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout')
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error)
    } finally {
      authService.removeToken()
      navigate('/login')
      toast.success('Đã đăng xuất')
    }
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: FaHome },
    { path: '/admin/products', label: 'Sản phẩm', icon: FaBox },
    { path: '/admin/categories', label: 'Danh mục', icon: FaTags },
    { path: '/admin/users', label: 'Người dùng', icon: FaUsers },
    { path: '/admin/orders', label: 'Đơn hàng', icon: FaShoppingBag },
    // { path: '/admin/revenue', label: 'Doanh thu', icon: FaChartLine },
  ]

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '250px' : '70px',
        backgroundColor: '#1976d2',
        color: '#fff',
        transition: 'width 0.3s',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {sidebarOpen && (
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              Admin Panel
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '2rem',
              padding: '5px'
            }}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav style={{ padding: '20px 0' }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  color: active ? '#fff' : 'rgba(255,255,255,0.8)',
                  backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '1.5rem',
                  transition: 'all 0.2s',
                  borderLeft: active ? '4px solid #fff' : '4px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.target.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon style={{ fontSize: '2rem', marginRight: sidebarOpen ? '15px' : '0', minWidth: '24px' }} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '20px'
        }}>
          {sidebarOpen && user && (
            <div style={{ marginBottom: '15px', fontSize: '1.3rem' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: '12px 20px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.5rem',
              borderRadius: '5px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            <FaSignOutAlt style={{ fontSize: '2rem', marginRight: sidebarOpen ? '15px' : '0' }} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen ? '250px' : '70px',
        flex: 1,
        transition: 'margin-left 0.3s',
        padding: '30px'
      }}>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout

