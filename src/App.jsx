import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styles from './App.module.css';

import Sidebar from './components/Sidebar';
import TopCards from './components/TopCards';
import ChartArea from './components/ChartArea';
import BirthdayList from './components/BirthdayList';
import ClientPage from './Pages/ClientPage'; // crie esse componente como falamos

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
      </Routes>
    </BrowserRouter>
  );
}
