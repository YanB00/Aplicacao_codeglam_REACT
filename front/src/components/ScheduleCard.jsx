//card dentro do calendario

import React from 'react';
import styles from './ScheduleCard.module.css';

const ScheduleCard = ({ time, employee, service, color }) => {
  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      <div className={styles.time}>{time}</div>
      <div className={styles.employee}>{employee}</div>
      <div className={styles.service}>{service}</div>
    </div>
  );
};

export default ScheduleCard;
