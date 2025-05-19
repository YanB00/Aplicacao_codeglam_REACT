import React, { useState } from 'react';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleGrid from '../components/ScheduleGrid';
import AddAppointmentForm from '../components/AddAppointmentForm'; 
import styles from './SchedulePage.module.css';

const SchedulePage = () => {
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [appointments, setAppointments] = useState([]); // Para armazenar os agendamentos (exemplo)

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
    // Aqui você chamaria sua lógica para salvar o agendamento (API, etc.)
  };

  return (
    <div className={styles.page}>
      <ScheduleHeader onAddClick={handleAddClick} /> {/* Passa a função para o ScheduleHeader */}
      <ScheduleGrid appointments={appointments} /> {/* Exemplo de como passar os agendamentos para a grid */}
      {isAddFormVisible && (
        <AddAppointmentForm onClose={handleCloseForm} onSave={handleSaveAppointment} />
      )}
    </div>
  );
};

export default SchedulePage;