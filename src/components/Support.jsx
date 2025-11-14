import React from 'react'
import { FaTruck, FaHeadset, FaUndo } from 'react-icons/fa'

const services = [
  {
    id: 1,
    icon: FaTruck,
    title: 'Giao hàng miễn phí và nhanh chóng',
    description: 'Miễn phí giao hàng cho tất cả đơn hàng trên 140.000 VNĐ.',
  },
  {
    id: 2,
    icon: FaHeadset,
    title: '24/7 Hỗ trợ khách hàng',
    description: 'Hỗ trợ khách hàng 24/7.',
  },
  {
    id: 3,
    icon: FaUndo,
    title: 'Hoàn tiền 30 ngày',
    description: 'Hoàn tiền 30 ngày.',
  },
]

const Support = () => {
  return (
    <section className="section">
      <div className="container services_container">
        {services.map(({ id, icon: Icon, title, description }) => (
          <div key={id} className="service">
            <span className="service_icon">
              <Icon />
            </span>
            <h3 className="service_title">{title}</h3>
            <p className="service_p">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Support