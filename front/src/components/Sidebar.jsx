import React, { useState, useEffect, useContext, createContext } from 'react';
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

export default function Sidebar({ userId }) {
    // console.log("Sidebar userId:", userId);
    const [expanded, setExpanded] = useState(true);
    const [companyName, setCompanyName] = useState('');

    const fetchUserData = async () => {
          console.log("Tentando buscar dados para userId:", userId);
        try {
            const response = await fetch(`http://localhost:3000/register/${userId}`, {
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    },
});
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }
            const text = await response.text(); 
            console.log("Resposta bruta da API:", text); 
            const data = JSON.parse(text);
            console.log("Dados parseados:", data); 
            if (data && data.data && data.data.empresa) {
                setCompanyName(data.data.empresa);
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            setCompanyName('Nome Padrão');
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData(); 
        } else {
            setCompanyName('Nome Genérico');
        }
    }, [userId]);

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
                    <div className={styles.profileIcon}>{getInitials(companyName)}</div>
                    {expanded && <span className={styles.profileName}>{companyName}</span>}
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className={styles.menu}>
                        {menuItems.map((item, index) => (
                            <SidebarItem key={index} icon={item.icon} label={item.label} to={item.to} userId={userId} />
                        ))}
                    </ul>
                </SidebarContext.Provider>
            </nav>
        </aside>
    );
}

function SidebarItem({ icon, label, to, userId }) {
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
                <Link to={`${to}?userId=${userId}`} className={styles.link}>
                    {content}
                </Link>
            ) : (
                content
            )}
        </li>
    );
}