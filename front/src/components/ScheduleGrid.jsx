// src/components/ScheduleGrid.jsx

//grid do calendario
import React, { useState } from 'react';
import styles from './ScheduleGrid.module.css';
import AppointmentDetails from '../components/AppoinmentDetails';
import EditAppointmentForm from '../components/EditAppointmentForm';


const ScheduleGrid = () => {
  const startTime = 8;
  const endTime = 19;
  const timeSlots = Array.from({ length: (endTime - startTime) * 2 }, (_, i) => {
    const hour = startTime + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });
  const employees = ['Funcionário 1', 'Funcionário 2', 'Funcionário 3', 'Funcionário 4'];

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const scheduleData = [
    { id: 1, timeStart: '08:30', timeEnd: '11:00', employee: 'Funcionário 1', service: 'Manicure', color: '#f8c6dc', client: 'Ana Souza', tipo: 'Alongamento em fibra', valor: '250,00' },
    { id: 2, timeStart: '08:30', timeEnd: '10:00', employee: 'Funcionário 2', service: 'Design de Sobrancelhas', color: '#e5d0f8', client: 'Beatriz Oliveira', tipo: 'Henna', valor: '55,00' },
    { id: 3, timeStart: '10:00', timeEnd: '11:00', employee: 'Funcionário 3', service: 'Corte de Cabelo', color: '#cdd9ff', client: 'Carlos Pereira', tipo: 'Curto', valor: '90,00' },
    { id: 4, timeStart: '10:30', timeEnd: '12:00', employee: 'Funcionário 2', service: 'Depilação', color: '#c8f7f4', client: 'Daniela Rocha', tipo: 'Cera', valor: '70,00' },
    { id: 5, timeStart: '12:00', timeEnd: '14:00', employee: 'Funcionário 1', service: 'Pedicure', color: '#f8c6dc', client: 'Fernanda Lima', tipo: 'Spa', valor: '95,00' },
    { id: 6, timeStart: '15:00', timeEnd: '16:30', employee: 'Funcionário 3', service: 'Coloração', color: '#cdd9ff', client: 'Gabriel Santos', tipo: 'Retoque de raiz', valor: '120,00' },
    { id: 7, timeStart: '15:30', timeEnd: '17:00', employee: 'Funcionário 4', service: 'Limpeza de Pele', color: '#a7f3d0', client: 'Helena Costa', tipo: 'Profunda', valor: '110,00' },
    { id: 8, timeStart: '09:00', timeEnd: '10:30', employee: 'Funcionário 1', service: 'Massagem Relaxante', color: '#f5d7b0', client: 'Igor Martins', tipo: 'Terapêutica', valor: '100,00' },
  ];

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsVisible(false);
    setSelectedEvent(null);
  };

  const handleEditClick = (event) => {
    setEventToEdit(event);
    setIsEditFormVisible(true);
    setIsDetailsVisible(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormVisible(false);
    setEventToEdit(null);
  };

  const handleSaveEdit = (updatedEvent) => {
    const updatedScheduleData = scheduleData.map(item =>
      item.id === updatedEvent.id ? updatedEvent : item
    );
    // Aqui você chamaria sua função para atualizar os dados (ex: API call)
    console.log('Agendamento atualizado:', updatedEvent);
    setIsEditFormVisible(false);
    setEventToEdit(null);

    const [isAddFormVisible, setIsAddFormVisible] = useState(false);

  };

  return (
    <div className={styles.container}>
      <div className={styles.timeColumn}>
        {timeSlots.filter((_, index) => index % 2 === 0).map(time => (
          <div key={time} className={styles.timeSlot}>{time.slice(0, 2)}:00</div>
        ))}
      </div>
      <div className={styles.employeeColumns} style={{ gridTemplateColumns: `repeat(${employees.length}, minmax(150px, 1fr))` }}>
        {employees.map(employee => (
          <div key={employee} className={styles.employeeHeader}>{employee}</div>
        ))}
      </div>
      <div className={styles.eventArea} style={{ '--employee-count': employees.length }}>
        {scheduleData.map((item, index) => {
          const startHour = parseInt(item.timeStart.split(':')[0]);
          const startMinute = parseInt(item.timeStart.split(':')[1]);
          const endHour = parseInt(item.timeEnd.split(':')[0]);
          const endMinute = parseInt(item.timeEnd.split(':')[1]);

          const startHalfHour = (startHour - startTime) * 2 + startMinute / 30;
          const durationHalfHours = (endHour * 2 + endMinute / 30) - (startHour * 2 + startMinute / 30);
          const employeeIndex = employees.indexOf(item.employee);

          return (
            <div
              key={item.id}
              className={styles.eventCell}
              style={{
                '--event-start-half-hour': startHalfHour,
                '--event-duration-half-hours': durationHalfHours,
                '--employee-index': employeeIndex,
                backgroundColor: item.color,
                color: 'black',
              }}
              onClick={() => handleEventClick(item)}
            >
              <div className={styles.employee}>{item.employee}</div>
              <div className={styles.service}>{item.service}</div>
              <div className={styles.time}>{`${item.timeStart} - ${item.timeEnd}`}</div>
            </div>
          );
        })}
      </div>

      {isDetailsVisible && selectedEvent && (
        <AppointmentDetails
          event={selectedEvent}
          onClose={handleCloseDetails}
          onEdit={handleEditClick} // Passa a função de edição
        />
      )}

      {isEditFormVisible && eventToEdit && (
        <EditAppointmentForm
          event={eventToEdit}
          onClose={handleCloseEditForm}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ScheduleGrid;