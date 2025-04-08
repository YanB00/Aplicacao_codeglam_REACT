import styles from './App.module.css';
import Sidebar from './components/Sidebar';
import TopCards from './components/TopCards';
import ChartArea from './components/ChartArea';
import BirthdayList from './components/BirthdayList';

export default function App() {
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
