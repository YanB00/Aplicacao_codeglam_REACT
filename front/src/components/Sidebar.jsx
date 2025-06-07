import React, { useState, useEffect, useContext, createContext } from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
    FaCalendarAlt,
    FaStar,
    FaUsers,
    FaUserTie,
    FaHistory,
    FaCog,
    FaHome
} from 'react-icons/fa';

const SidebarContext = createContext();

const menuItems = [
    { icon: <FaHome />, label: 'Home', to: '/usuario', isSalonSpecific: true },
    { icon: <FaCalendarAlt />, label: 'Agenda', to: '/calendario', isSalonSpecific: true },
    { icon: <FaStar />, label: 'Serviços', to: '/servicos', isSalonSpecific: false },
    { icon: <FaUsers />, label: 'Clientes', to: '/clientes', isSalonSpecific: false },
    { icon: <FaUserTie />, label: 'Funcionários', to: '/funcionarios', isSalonSpecific: false },
    { icon: <FaHistory />, label: 'Histórico', to: '/historico', isSalonSpecific: false },
    { icon: <FaCog />, label: 'Configurações', to: '/configuracoes', isSalonSpecific: false },
];

export default function Sidebar({ userId }) {
    const [expanded, setExpanded] = useState(true);
    const [companyName, setCompanyName] = useState('');

    const fetchUserData = async () => {
        console.log("Tentando buscar dados para userId (Sidebar):", userId); 
        try {
            const response = await fetch(`http://localhost:3000/register/${userId}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            });
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                if (response.status === 400 || response.status === 404) {
                    setCompanyName('ID Inválido/Não Encontrado');
                }
                return;
            }
            const text = await response.text();
            const data = JSON.parse(text);
            if (data && data.data && data.data.empresa) {
                setCompanyName(data.data.empresa);
            } else {
                setCompanyName('Salão Desconhecido'); 
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário na Sidebar:", error); 
            setCompanyName('Erro ao Carregar'); 
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData();
        } else {
            setCompanyName('Carregando...'); 
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
                            <SidebarItem
                                key={index}
                                icon={item.icon}
                                label={item.label}
                                to={item.to}
                                userId={userId}
                                isSalonSpecific={item.isSalonSpecific}
                            />
                        ))}
                    </ul>
                </SidebarContext.Provider>
            </nav>
        </aside>
    );
}

function SidebarItem({ icon, label, to, userId, isSalonSpecific }) { 
    const { expanded } = useContext(SidebarContext);

    let linkPath = to; 
    if (isSalonSpecific && userId) {
        linkPath = `${to}/${userId}`; 
    }
    else if (userId) {
        linkPath = `${to}?userId=${userId}`; 
    }

    const content = (
        <>
            <span className={styles.icon}>{icon}</span>
            {expanded && <span className={styles.label}>{label}</span>}
        </>
    );

    return (
        <li className={styles.menuItem}>
            <Link to={linkPath} className={styles.link}>
                {content}
            </Link>
        </li>
    );
}

