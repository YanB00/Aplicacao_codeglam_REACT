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

const baseMenuItems = [
    { icon: <FaHome />, label: 'Home', to: '/usuario', isSalonSpecific: true, moduleKey: 'home' }, 
    { icon: <FaCalendarAlt />, label: 'Agenda', to: '/calendario', isSalonSpecific: true, moduleKey: 'agenda' },
    { icon: <FaStar />, label: 'Serviços', to: '/servicos', isSalonSpecific: false, moduleKey: 'servicos' },
    { icon: <FaUsers />, label: 'Clientes', to: '/clientes', isSalonSpecific: false, moduleKey: 'clientes' },
    { icon: <FaUserTie />, label: 'Funcionários', to: '/funcionarios', isSalonSpecific: false, moduleKey: 'funcionarios' },
    { icon: <FaHistory />, label: 'Histórico', to: '/historico', isSalonSpecific: false, moduleKey: 'historico' },
    { icon: <FaCog />, label: 'Configurações', to: '/configuracoes', isSalonSpecific: false, moduleKey: 'configuracoes' }, // Adicionado moduleKey
];

const BASE_URL = 'http://localhost:3000'; 

export default function Sidebar({ userId, userName, loadingUserName, sidebarRefreshKey }) { 
    const [expanded, setExpanded] = useState(true);
    const [salonName, setSalonName] = useState(''); 
    const [modulesActiveStatus, setModulesActiveStatus] = useState({}); 
    const [isLoadingSidebarData, setIsLoadingSidebarData] = useState(true); 

    const fetchSidebarData = async () => {
        console.log("Tentando buscar dados para userId (Sidebar):", userId); 
        if (!userId) {
            setIsLoadingSidebarData(false);
            setSalonName('Carregando...'); 
            return;
        }

        setIsLoadingSidebarData(true);
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`${BASE_URL}/register/${userId}`, { 
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            });
            if (!response.ok) {
                console.error(`Sidebar: HTTP error! status: ${response.status}`);
                setSalonName('Erro ao Carregar');
                throw new Error('Falha ao buscar dados do salão.');
            }
            const data = await response.json();
            
            if (data && data.data) {
                setSalonName(data.data.empresa || 'Salão Desconhecido');
                setModulesActiveStatus(data.data.modulosAtivos || {});
                console.log("Sidebar: Status de módulos carregado:", data.data.modulosAtivos);
            } else {
                setSalonName('Salão Desconhecido'); 
            }
        } catch (error) {
            console.error("Sidebar: Erro ao buscar dados do salão:", error); 
            setSalonName('Erro ao Carregar'); 
        } finally {
            setIsLoadingSidebarData(false);
        }
    };

    useEffect(() => {
        fetchSidebarData(); 
    }, [userId, sidebarRefreshKey]); 

    const getInitials = (name) => {
        const words = name.trim().split(" ");
        const first = words[0]?.charAt(0) || "";
        const last = words[words.length - 1]?.charAt(0) || "";
        return (first + last).toUpperCase();
    };

    const filteredMenuItems = baseMenuItems.filter(item => {
   
        return item.moduleKey === 'home' || item.moduleKey === 'configuracoes' || 
            (modulesActiveStatus[item.moduleKey] !== false && Object.keys(modulesActiveStatus).length > 0);
    });


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
                    {isLoadingSidebarData ? (
                        <ul className={styles.menu}>
                            <li className={styles.menuItem}><span className={styles.icon}><FaCog /></span> {expanded && <span className={styles.label}>Carregando...</span>}</li>
                        </ul>
                    ) : (
                        <ul className={styles.menu}>
                            {filteredMenuItems.map((item, index) => (
                                <SidebarItem
                                    key={item.moduleKey || index} 
                                    icon={item.icon}
                                    label={item.label}
                                    to={item.to}
                                    userId={userId}
                                    isSalonSpecific={item.isSalonSpecific}
                                />
                            ))}
                        </ul>
                    )}
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