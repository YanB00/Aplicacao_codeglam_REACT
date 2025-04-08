import React from 'react';
import styles from './Sidebar.module.css';
import {
  FaCalendarAlt,
  FaStar,
  FaUsers,
  FaUserTie,
  FaDollarSign,
  FaCommentDots,
  FaTags,
  FaComments,
  FaCog,
} from 'react-icons/fa';

const menuItems = [
  { icon: <FaCalendarAlt />, label: 'Agenda' },
  { icon: <FaStar />, label: 'Serviços' },
  { icon: <FaUsers />, label: 'Clientes' },
  { icon: <FaUserTie />, label: 'Funcionários' },
  { icon: <FaDollarSign />, label: 'Relatório' },
  { icon: <FaCommentDots />, label: 'Feedback' },
  { icon: <FaTags />, label: 'Produtos' },
  { icon: <FaComments />, label: 'Chat' },
  { icon: <FaCog />, label: 'Configurações' },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      
      {/* Logo do salão */}
      <div className={styles.logo}>
        <img
          src="/code.png" 
          alt="Logo salão"
          className={styles.logoImage}
        />
        <span className={styles.logoText}>Nome - salão</span>
      </div>

      
      <div className={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <div key={index} className={styles.menuItem}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>

    </aside>
  );
}
