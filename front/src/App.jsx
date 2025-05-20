import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useSearchParams } from 'react-router-dom';
import styles from './App.module.css';

// Importe seus componentes de Sidebar
import Sidebar from './components/Sidebar';
import TopCards from './components/TopCards';
import ChartArea from './components/ChartArea';
import BirthdayList from './components/BirthdayList';

// Importe páginas
import ClientPage from './pages/ClientPage';
import ClientListPage from './pages/ClientListPage';
import EditClientPage from './pages/EditClientPage';
import AddClientPage from './pages/AddClientPage';
import SchedulePage from './pages/SchedulePage';
import EmployeePage from './Pages/EmployeePage';
import EmployeeListPage from './Pages/EmployeeListPage';
import EditEmployeePage from './pages/EditEmployeePage';
import AddEmployeePage from './pages/AddEmployeePage';
import ServiceListPage from './pages/ServiceListPage';
import AddServicePage from './pages/AddServicePage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import SettingsPage from './Pages/SettingsPage';

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
            </Routes>
        </BrowserRouter>
    );
}

export default App;