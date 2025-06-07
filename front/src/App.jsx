import React, {useEffect, useState} from 'react'; 
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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

// Remova a função LoginPage que estava aqui

function Dashboard() {
    const { userId } = useParams();
    console.log('Dashboard - Fetched userId:', userId);

    return (
        <div className={styles.appContainer}>
            <Sidebar userId={userId} />
            <div className={styles.mainContent}>
                <div className={styles.topBar}></div>
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
    return (
        <div className={styles.appContainer}>
            <Sidebar userId={salonId} />
            <div className={styles.mainContent}>
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

                <Route path="/"  element={<Dashboard />} />

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

export default App;