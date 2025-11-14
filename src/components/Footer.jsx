import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
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
    );
};

export default Footer;