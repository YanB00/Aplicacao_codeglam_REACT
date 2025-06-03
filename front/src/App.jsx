import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useSearchParams } from 'react-router-dom';
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
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');

    return (
        <div className={styles.appContainer}>
            <Sidebar userId={userId} />
            <div className={styles.mainContent}>
                <div className={styles.topBar}></div>
                <TopCards />
                <div className={styles.gridArea}>
                    <ChartArea />
                    <BirthdayList />
                </div>
            </div>
        </div>
    );
}

function ScheduleWrapper() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    return (
        <div className={styles.appContainer}>
            <Sidebar userId={userId} />
            <div className={styles.mainContent}>
                <SchedulePage />
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/schedule" element={<ScheduleWrapper />} />
                <Route path="/calendario" element={<ScheduleWrapper />} />
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