import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styles from './App.module.css';
import { Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import TopCards from './components/TopCards';
import ChartArea from './components/ChartArea';
import BirthdayList from './components/BirthdayList';
import ClientPage from './pages/ClientPage';
import EditClientPage from './pages/EditClientPage';
import SchedulePage from './pages/SchedulePage';
import EmployeePage from './pages/EmployeePage';
import EditEmployeePage from './pages/EditEmployeePage'; // ✅ Importa a nova página
import EmployeeListPage from './Pages/EmployeeListPage';

function Dashboard() {
  return (
    <div className={styles.appContainer}>
      <Sidebar />
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cliente/:name" element={<ClientPage />} />
        <Route path="/cliente/editar" element={<EditClientPage />} />
        
        <Route path="/schedule" element={
          <div className={styles.appContainer}>
            <Sidebar />
            <div className={styles.mainContent}>
              <SchedulePage />
            </div>
          </div>
        } />

        <Route path="/funcionario/:id" element={<EmployeePage />} />
        <Route path="/funcionarios" element={<EmployeeListPage />} />
        <Route path="/funcionario" element={<Navigate to="/funcionarios" replace />} />

        <Route path="/funcionario/Editar/:id" element={<EditEmployeePage />} />
      </Routes>
    </BrowserRouter>
  );
}
