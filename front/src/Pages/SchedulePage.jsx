import React, { useState } from 'react';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleGrid from '../components/ScheduleGrid';
import AddAppointmentForm from '../components/AddAppointmentForm'; 
import styles from './SchedulePage.module.css';


const SchedulePage = () => {
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [appointments, setAppointments] = useState([]); 

  const handleAddClick = () => {
    setIsAddFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsAddFormVisible(false);
  };

  const handleSaveAppointment = (newAppointment) => {
    console.log('Novo agendamento:', newAppointment);
    setAppointments([...appointments, newAppointment]);
    setIsAddFormVisible(false);
  };

  return (
    <div className={styles.page}>
      <ScheduleHeader onAddClick={handleAddClick} /> 
      <ScheduleGrid appointments={appointments} /> 
      {isAddFormVisible && (
        <AddAppointmentForm onClose={handleCloseForm} onSave={handleSaveAppointment} />
      )}
    </div>
  );
};

export default SchedulePage;