import React, { useState, useContext, createContext } from 'react';
import { Link } from 'react-router-dom';
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
  FaHome
} from 'react-icons/fa';

const SidebarContext = createContext();

const menuItems = [
  { icon: <FaHome />, label: 'Home', to: '/' },
  { icon: <FaCalendarAlt />, label: 'Agenda', to: '/calendario' },
  { icon: <FaStar />, label: 'Serviços', to: '/servicos' },
  { icon: <FaUsers />, label: 'Clientes', to: '/clientes' },
  { icon: <FaUserTie />, label: 'Funcionários', to: '/funcionarios'},
  { icon: <FaCog />, label: 'Configurações', to: '/configuracoes' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const salonName = "Salao 1";

  const getInitials = (name) => {
    const words = name.trim().split(" ");
    const first = words[0]?.charAt(0) || "";
    const last = words[words.length - 1]?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  return (
    <aside className={styles.sidebarWrapper}>
      <nav
        className={`${styles.sidebar} ${expanded ? styles.expanded : styles.collapsed}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className={styles.profile}>
          <div className={styles.profileIcon}>{getInitials(salonName)}</div>
          {expanded && <span className={styles.profileName}>{salonName}</span>}
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className={styles.menu}>
            {menuItems.map((item, index) => (
              <SidebarItem key={index} icon={item.icon} label={item.label} to={item.to} />
            ))}
          </ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, to }) {
  const { expanded } = useContext(SidebarContext);
  const content = (
    <>
      <span className={styles.icon}>{icon}</span>
      {expanded && <span className={styles.label}>{label}</span>}
    </>
  );

  return (
    <li className={styles.menuItem}>
      {to ? (
        <Link to={to} className={styles.link}>
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
