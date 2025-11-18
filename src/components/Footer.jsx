import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa'
import { toast } from 'sonner'
import { axiosInstance } from '../utils/axiosConfig'

const Footer = () => {
    const [showChat, setShowChat] = useState(false)
    const [chatMessage, setChatMessage] = useState('')
    const [chatHistory, setChatHistory] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!chatMessage.trim()) return

        const userMessage = chatMessage.trim()
        setChatMessage('')
        setChatHistory(prev => [...prev, { type: 'user', message: userMessage }])
        setIsLoading(true)

        try {
            const response = await axiosInstance.post('/chat', {
                message: userMessage
            })

            if (response.data.status === 'success') {
                const botMessage = response.data.data?.response || response.data.data?.message || 'Xin chào! Tôi có thể giúp gì cho bạn?'
                setChatHistory(prev => [...prev, { type: 'bot', message: botMessage }])
            } else {
                setChatHistory(prev => [...prev, { type: 'bot', message: 'Xin lỗi, tôi không thể trả lời ngay bây giờ.' }])
            }
        } catch (error) {
            toast.error('Không thể gửi tin nhắn', {
                description: 'Vui lòng thử lại sau.'
            })
            setChatHistory(prev => [...prev, { type: 'bot', message: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.' }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
        <footer className="footer">
            <div className="container footer_container">
                <div className="footer_item">
                    <Link to="/" className="footer_logo">Exclusive</Link>
                    <div className="footer_p">
                        Nền tảng mua sắm trực tuyến mang đến trải nghiệm hiện đại,
                        giá tốt và dịch vụ hậu mãi tận tâm.
                    </div>
                </div>
                <div className="footer_item">
                    <h3 className="footer_item_titl">Hỗ trợ</h3>
                    <ul className="footer_list">
                        <li className="li footer_list_item">Quận 1, TP.HCM</li>
                        <li className="li footer_list_item">support@exclusive.vn</li>
                        <li className="li footer_list_item">1900 636 789</li>
                        <li className="li footer_list_item">(+84) 28 1234 5678</li>
                    </ul>
                </div>
                <div className="footer_item">
                    <h3 className="footer_item_titl">Tài khoản</h3>
                    <ul className="footer_list">
                        <li className="li footer_list_item">Thông tin cá nhân</li>
                        <li className="li footer_list_item">Đăng nhập / Đăng ký</li>
                        <li className="li footer_list_item">Giỏ hàng</li>
                        <li className="li footer_list_item">Cửa hàng</li>
                    </ul>
                </div>
                <div className="footer_item">
                    <h3 className="footer_item_titl">Chính sách</h3>
                    <ul className="footer_list">
                        <li className="li footer_list_item">Bảo mật thông tin</li>
                        <li className="li footer_list_item">Điều khoản sử dụng</li>
                        <li className="li footer_list_item">Câu hỏi thường gặp</li>
                        <li className="li footer_list_item">Liên hệ</li>
                    </ul>
                </div>
            </div>
            <div className="footer_bottom">
                <div className="container footer_bottom_container">
                    <p className="footer_copy">
                        © Exclusive 2023. Giữ toàn bộ bản quyền.
                    </p>
                </div>
            </div>
        </footer>

        {/* Chat Widget */}
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
        }}>
            {showChat ? (
                <div style={{
                    width: '350px',
                    height: '500px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Chat Header */}
                    <div style={{
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0 }}>
                                Hỗ trợ trực tuyến
                            </h4>
                            <p style={{ fontSize: '1.2rem', margin: '5px 0 0 0', opacity: 0.9 }}>
                                Chúng tôi luôn sẵn sàng hỗ trợ bạn
                            </p>
                        </div>
                        <button
                            onClick={() => setShowChat(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '2rem',
                                padding: '5px'
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div style={{
                        flex: 1,
                        padding: '15px',
                        overflowY: 'auto',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {chatHistory.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: '#666',
                                fontSize: '1.4rem',
                                padding: '20px'
                            }}>
                                <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
                            </div>
                        ) : (
                            chatHistory.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        alignSelf: item.type === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%'
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: item.type === 'user' ? '#1976d2' : '#fff',
                                        color: item.type === 'user' ? '#fff' : '#000',
                                        padding: '10px 15px',
                                        borderRadius: '12px',
                                        fontSize: '1.4rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {item.message}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: '#fff',
                                padding: '10px 15px',
                                borderRadius: '12px',
                                fontSize: '1.4rem'
                            }}>
                                Đang nhập...
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} style={{
                        padding: '15px',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '10px',
                                fontSize: '1.4rem',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !chatMessage.trim()}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isLoading || !chatMessage.trim() ? 'not-allowed' : 'pointer',
                                opacity: isLoading || !chatMessage.trim() ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setShowChat(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.4rem',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    aria-label="Mở chat"
                >
                    <FaComments />
                </button>
            )}
        </div>
        </>
    );
};

export default Footer;