import React, {useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
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


function Dashboard() {
    const { userId } = useParams();
    const [salonName, setSalonName] = useState('');
    const [loadingSalonName, setLoadingSalonName] = useState(true);
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchSalonData = async () => {
            if (!userId) {
                console.warn('Dashboard - userId não disponível para buscar dados do salão.');
                setLoadingSalonName(false);
                setSalonName('Meu Salão');
                return;
            }

            setLoadingSalonName(true);
            try {
                const response = await fetch(`http://localhost:3000/register/${userId}`);
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
    }, [userId]);


    useEffect(() => {
        if (!loadingSalonName && salonName) {
            document.title = salonName;
        } else {
            document.title = 'Carregando Salão...';
        }
    }, [salonName, loadingSalonName]);

    const handleLogout = () => {
        // Here you would clear any user-related data (e.g., tokens from localStorage)
        localStorage.removeItem('userToken'); // Example: remove a token
        sessionStorage.removeItem('userId'); // Example: remove a user ID

        // Redirect to the login page
        navigate('/login'); // Assuming '/login' is your login route
    };

    return (
        <div className={styles.appContainer}>
            <Sidebar userId={userId} userName={salonName} loadingUserName={loadingSalonName} />
            <div className={styles.mainContent}>
                <div className={styles.topBar}>
                    {/* Logout button */}
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Sair
                    </button>
                </div>
                <TopCards salonId={userId} />
                <div className={styles.gridArea}>
                    <ChartArea />
                    <BirthdayList userId={userId} />
                </div>
            </div>
        </div>
    );
}

function ScheduleWrapper() {
    const { salonId } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate here too if you want logout in this wrapper

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <div className={styles.appContainer}>
            <Sidebar userId={salonId} />
            <div className={styles.mainContent}>
                <div className={styles.topBar}>
                     {/* Logout button for ScheduleWrapper */}
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Sair
                    </button>
                </div>
                <SchedulePage salonId={salonId} />
            </div>
        </div>
    );
}


function App() {
    const EXTERNAL_LOGIN_URL = "http://localhost:5173/login";

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/usuario/:userId" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect root to login */}
                <Route path="/login" element={<LoginRedirect />} /> {/* New route for external login */}


                <Route path="/calendario/:salonId" element={<ScheduleWrapper />} />
                <Route path="/cliente/:id" element={<ClientPage />} />
                <Route path="/clientes" element={<ClientListPage />} />
                <Route path="/cliente/editar/:id" element={<EditClientPage />} />
                <Route path="/add-cliente" element={<AddClientPage />} />
                <Route path="/funcionarios" element={<EmployeeListPage />} />
                <Route path="/funcionario" element={<Navigate to="/funcionarios" replace />} />
                <Route path="/funcionario/:id" element={<EmployeePage />} />
                <Route path="/funcionario/editar/:id" element={<EditEmployeePage />} />
                <Route path="/add-funcionario" element={<AddEmployeePage />} />
                <Route path="/configuracoes" element={<SettingsPage />} />
                <Route path="/servicos" element={<ServiceListPage />} />
                <Route path="/add-servico" element={<AddServicePage />} />
                <Route path="/servico/:id" element={<ServiceDetailsPage />} />
                <Route path="/servicos/editar/:id" element={<EditServicePage />} />
                <Route path="/historico" element={<AllAppointmentsHistory />} />

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