import React from 'react';
import styles from './ScheduleGrid.module.css';
import ScheduleCard from './ScheduleCard';

const ScheduleGrid = () => {
  // Dados temporários
  const scheduleData = [
    { time: '08:30 - 11:00', employee: 'Employee 1', service: 'Nail Care', color: '#f8c6dc', column: 1, row: 1 },
    { time: '08:30 - 10:00', employee: 'Employee 2', service: 'Lash Maintenance', color: '#e5d0f8', column: 2, row: 1 },
    { time: '10:00 - 11:00', employee: 'Employee 3', service: 'Hair', color: '#cdd9ff', column: 3, row: 2 },
    { time: '10:30 - 12:00', employee: 'Employee 2', service: 'Lashes', color: '#c8f7f4', column: 2, row: 2 },
    { time: '12:00 - 14:00', employee: 'Employee 1', service: 'Gel Polish', color: '#f8c6dc', column: 1, row: 3 },
    { time: '15:00 - 16:30', employee: 'Employee 3', service: 'Blow Dry', color: '#cdd9ff', column: 3, row: 4 },
    { time: '15:30 - 17:00', employee: 'Employee 2', service: 'Eyebrows', color: '#c8f7f4', column: 2, row: 5 },
  ];

  return (
    <div className={styles.grid}>
      {scheduleData.map((item, index) => (
        <div
          key={index}
          className={styles.cell}
          style={{
            gridColumn: item.column,
            gridRow: `span ${Math.ceil((parseInt(item.time.slice(6, 8)) * 60 + parseInt(item.time.slice(9))) - (parseInt(item.time.slice(0, 2)) * 60 + parseInt(item.time.slice(3, 5))) / 30)}`,
          }}
        >
          <ScheduleCard
            time={item.time}
            employee={item.employee}
            service={item.service}
            color={item.color}
          />
        </div>
      ))}
    </div>
  );
};

export default ScheduleGrid;
