import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import styles from './App.module.css';

// Importe componentes Sidebar 
import Sidebar from './components/Sidebar';
import TopCards from './components/TopCards';
import ChartArea from './components/ChartArea';
import BirthdayList from './components/BirthdayList';

// Importe páginas
import ClientPage from './Pages/ClientPage';
import ClientListPage from './Pages/ClientListPage';
import EditClientPage from './Pages/EditClientPage';
import AddClientPage from './Pages/AddClientPage';

import SchedulePage from './Pages/SchedulePage';
import EmployeePage from './Pages/EmployeePage';
import EmployeeListPage from './Pages/EmployeeListPage';
import EditEmployeePage from './Pages/EditEmployeePage';
import AddEmployeePage from './Pages/AddEmployeePage';
import ServiceListPage from './Pages/ServiceListPage';
import AddServicePage from './Pages/AddServicePage';
import ServiceDetailsPage from './Pages/ServiceDetailsPage';
import EditServicePage from './Pages/EditServicePage';
import SettingsPage from './Pages/SettingsPage';
import AllAppointmentsHistory from './Pages/AllAppointmentsHistoryPage';

function MainLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { userId: userIdFromParams, salonId: salonIdFromParams } = useParams(); 
    const [currentUserId, setCurrentUserId] = useState(null);
    const [salonName, setSalonName] = useState('');
    const [loadingSalonName, setLoadingSalonName] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 


    console.log('--- MainLayout Render ---');
    console.log('location.pathname:', location.pathname);
    console.log('location.search:', location.search);
    console.log('userIdFromParams (from useParams):', userIdFromParams);
    console.log('salonIdFromParams (from useParams):', salonIdFromParams);
    console.log('currentUserId (state):', currentUserId);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userIdFromQuery = params.get('userId');
        const salonIdFromQuery = params.get('salonId');

        const idFromUrl = userIdFromParams || salonIdFromParams || userIdFromQuery || salonIdFromQuery;

        if (idFromUrl && idFromUrl !== currentUserId) {
            setCurrentUserId(idFromUrl);
        } else if (!idFromUrl && currentUserId !== null) {
            setCurrentUserId(null);
        }

        const fetchSalonData = async () => {
            if (!idFromUrl) {
                console.warn('MainLayout - userId não disponível para buscar dados do salão.');
                setLoadingSalonName(false);
                setSalonName('Meu Salão');
                return;
            }
            setLoadingSalonName(true);
            try {
                const response = await fetch(`http://localhost:3000/register/${idFromUrl}`);
                const data = await response.json();

                if (response.ok && !data.errorStatus) {
                    setSalonName(data.data.empresa);
                    console.log(`[FRONTEND] Nome do salão capturado do backend: ${data.data.empresa}`);
                } else {
                    console.error('[FRONTEND] Erro ao buscar nome do salão:', data.mensageStatus || 'Erro desconhecido');
                    setSalonName('Meu Salão');
                }
            } catch (error) {
                console.error('[FRONTEND] Erro de rede ou servidor ao buscar nome do salão:', error);
                setSalonName('Meu Salão');
            } finally {
                setLoadingSalonName(false);
            }
        };

        fetchSalonData();
    }, [location.search, userIdFromParams, salonIdFromParams, currentUserId, refreshTrigger]); 

    useEffect(() => {
        if (!loadingSalonName && salonName) {
            document.title = salonName;
        } else {
            document.title = 'Carregando Salão...';
        }
    }, [salonName, loadingSalonName]);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userId');
        navigate('/login');
    };

    const handleRefreshSalonData = () => {
        console.log("MainLayout: Forçando recarga dos dados do salão...");
        setRefreshTrigger(prev => prev + 1);
    };
    return (
        <div className={styles.appContainer}>
            <Sidebar 
            userId={currentUserId} 
            userName={salonName} 
            loadingUserName={loadingSalonName} 
            sidebarRefreshKey={refreshTrigger}/>
            <div className={styles.mainContent}>
                {currentUserId ? (
                    React.Children.map(children, child =>
                        React.cloneElement(child, { 
                            userId: currentUserId, 
                            salonId: currentUserId, 
                            onSalonDataUpdate: handleRefreshSalonData, 
                            onLogout: handleLogout })
                    )
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <p>Carregando dados do usuário...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DashboardContent({ userId, onLogout }) { 
    return (
        <>
            <div className={styles.dashboardTopBar}> 
                <h1 className={styles.dashboardTitle}>DASHBOARD</h1> 
                <button onClick={onLogout} className={styles.logoutButton}>SAIR
                </button>
            </div>
            <TopCards salonId={userId} />
            <div className={styles.gridArea}>
                <ChartArea />
                <BirthdayList userId={userId} />
            </div>
        </>
    );
}

function SchedulePageContent({ salonId }) {
    return <SchedulePage salonId={salonId} />;
}


function App() {
    const EXTERNAL_LOGIN_URL = "http://localhost:5173/login";

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginRedirect />} />

                <Route path="/usuario/:userId" element={<MainLayout><DashboardContent /></MainLayout>} />
                <Route path="/calendario/:salonId" element={<MainLayout><SchedulePageContent /></MainLayout>} />
                
                <Route path="/cliente/:id" element={<MainLayout><ClientPage /></MainLayout>} />
                <Route path="/clientes" element={<MainLayout><ClientListPage /></MainLayout>} />
                <Route path="/cliente/editar/:id" element={<MainLayout><EditClientPage /></MainLayout>} />
                <Route path="/add-cliente" element={<MainLayout><AddClientPage /></MainLayout>} />
                <Route path="/funcionarios" element={<MainLayout><EmployeeListPage /></MainLayout>} />
                <Route path="/funcionario" element={<Navigate to="/funcionarios" replace />} />
                <Route path="/funcionario/:id" element={<MainLayout><EmployeePage /></MainLayout>} />
                <Route path="/funcionario/editar/:id" element={<MainLayout><EditEmployeePage /></MainLayout>} />
                <Route path="/add-funcionario" element={<MainLayout><AddEmployeePage /></MainLayout>} />
                <Route path="/configuracoes" element={<MainLayout><SettingsPage /></MainLayout>} />
                <Route path="/servicos" element={<MainLayout><ServiceListPage /></MainLayout>} />
                <Route path="/add-servico" element={<MainLayout><AddServicePage /></MainLayout>} />
                <Route path="/servico/:id" element={<MainLayout><ServiceDetailsPage /></MainLayout>} />
                <Route path="/servicos/editar/:id" element={<MainLayout><EditServicePage /></MainLayout>} />
                <Route path="/historico" element={<MainLayout><AllAppointmentsHistory /></MainLayout>} />
            </Routes>
        </BrowserRouter>
    );
}

function LoginRedirect() {
    useEffect(() => {
        window.location.href = "http://localhost:5173/login";
    }, []);
    return null;
}

export default App;