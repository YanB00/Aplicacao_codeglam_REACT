import React from 'react';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleGrid from '../components/ScheduleGrid';
import styles from './SchedulePage.module.css';

const SchedulePage = () => {
  return (
    <div className={styles.page}>
      <ScheduleHeader />
      <ScheduleGrid />
    </div>
  );
};

export default SchedulePage;
