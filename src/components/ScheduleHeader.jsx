import React from 'react';
import styles from './ScheduleHeader.module.css';

const ScheduleHeader = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.filters}>
          <select className={styles.select}>
            <option value="">Service</option>
            <option value="nails">Nail Care</option>
            <option value="lashes">Lash Maintenance</option>
            <option value="hair">Haircut</option>
          </select>

          <select className={styles.select}>
            <option value="">Employee</option>
            <option value="employee1">Employee 1</option>
            <option value="employee2">Employee 2</option>
          </select>

          <button className={styles.todayButton}>Today</button>

          <input type="date" className={styles.datePicker} />
        </div>

        <button className={styles.addButton}>Add</button>
      </header>
    </div>
  );
};

export default ScheduleHeader;
