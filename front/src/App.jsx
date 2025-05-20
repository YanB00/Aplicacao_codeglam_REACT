import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useSearchParams } from 'react-router-dom';
import styles from './App.module.css';
import Sidebar from './components/Sidebar';
import TopCards from './components/TopCards';
import ChartArea from './components/ChartArea';
import BirthdayList from './components/BirthdayList';

import ClientPage from './pages/ClientPage';
import ClientListPage from './pages/ClientListPage';
import EditClientPage from './pages/EditClientPage';
import AddClientPage from './pages/AddClientPage';
import SchedulePage from './pages/SchedulePage';
import EmployeePage from './pages/EmployeePage';
import EmployeeListPage from './Pages/EmployeeListPage';
import EditEmployeePage from './pages/EditEmployeePage';
import AddEmployeePage from './pages/AddEmployeePage';
import ServiceListPage from './pages/ServiceListPage';
import AddServicePage from './pages/AddServicePage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import SettingsPage from './Pages/SettingsPage';

function AppLayout({ children }) {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  return (
    <div className={styles.appContainer}>
      <Sidebar userId={userId} />
      <div className={styles.mainContent}>
        {children}
      </div>
    </div>
  );
}

function DashboardContent() {
  return (
    <>
      <div className={styles.topBar}></div>
      <TopCards />
      <div className={styles.gridArea}>
        <ChartArea />
        <BirthdayList />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <DashboardContent />
            </AppLayout>
          }
        />
        <Route
          path="/schedule"
          element={
            <AppLayout>
              <SchedulePage />
            </AppLayout>
          }
        />
        <Route
          path="/calendario"
          element={
            <AppLayout>
              <SchedulePage />
            </AppLayout>
          }
        />
        <Route
          path="/clientes"
          element={
            <AppLayout>
              <ClientListPage />
            </AppLayout>
          }
        />
        <Route path="/cliente/:id" element={<AppLayout><ClientPage /></AppLayout>} />
        <Route path="/cliente/editar/:id" element={<AppLayout><EditClientPage /></AppLayout>} />
        <Route path="/add-cliente" element={<AppLayout><AddClientPage /></AppLayout>} />
        <Route
          path="/funcionarios"
          element={
            <AppLayout>
              <EmployeeListPage />
            </AppLayout>
          }
        />
        <Route path="/funcionario" element={<Navigate to="/funcionarios" replace />} />
        <Route path="/funcionario/:id" element={<AppLayout><EmployeePage /></AppLayout>} />
        <Route path="/funcionario/editar/:id" element={<AppLayout><EditEmployeePage /></AppLayout>} />
        <Route path="/add-funcionario" element={<AppLayout><AddEmployeePage /></AppLayout>} />
        <Route
          path="/configuracoes"
          element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          }
        />
        <Route
          path="/servicos"
          element={
            <AppLayout>
              <ServiceListPage />
            </AppLayout>
          }
        />
        <Route path="/add-servico" element={<AppLayout><AddServicePage /></AppLayout>} />
        <Route path="/servico/:id" element={<AppLayout><ServiceDetailsPage /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;