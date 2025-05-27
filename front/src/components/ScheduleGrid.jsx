import React, { useState, useEffect } from 'react';
import styles from './ScheduleGrid.module.css';
import AppointmentDetails from '../components/AppoinmentDetails'; 
import EditAppointmentForm from '../components/EditAppointmentForm';

const ScheduleGrid = ({ appointments = [], salaoId }) => {
  const startTime = 8;
  const endTime = 19;
  const timeSlots = Array.from({ length: (endTime - startTime) * 2 }, (_, i) => {
    const hour = startTime + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  const [employeeList, setEmployeeList] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!salaoId) {
        setEmployeeList([]);
        return;
      }
      setIsLoadingEmployees(true);
      try {

        const response = await fetch(`http://localhost:3000/funcionarios`); 
        if (!response.ok) throw new Error('Falha ao buscar funcionários');
        const data = await response.json();
        if (data.errorStatus) throw new Error(data.mensageStatus || 'Erro ao buscar funcionários');

        setEmployeeList(data.data || []);
      } catch (error) {
        console.error("Erro ao buscar lista de funcionários para o grid:", error);
        setEmployeeList([]); 
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();

  }, [salaoId]); 

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

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

    console.log('Agendamento atualizado (simulado):', updatedEvent);
    setIsEditFormVisible(false);
    setEventToEdit(null);
  };
  
  const getEventColor = (item) => {
    const colors = ['#f8c6dc', '#e5d0f8', '#cdd9ff', '#c8f7f4', '#a7f3d0', '#f5d7b0', '#ffcbcb', '#d4e157'];
    const idPart = item.servicoId?._id || item.funcionarioId?._id || item._id || 'default';
    let hash = 0;
    for (let i = 0; i < idPart.length; i++) {
      hash = idPart.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  if (isLoadingEmployees && employeeList.length === 0) { 
    return <div className={styles.container}><p>Carregando funcionários...</p></div>;
  }


  return (
    <div className={styles.container}>
      <div className={styles.timeColumn}>
        {timeSlots.filter((_, index) => index % 2 === 0).map(time => (
          <div key={time} className={styles.timeSlot}>{time.slice(0, 2)}:00</div>
        ))}
      </div>
      <div className={styles.employeeColumns} style={{ gridTemplateColumns: `repeat(${employeeList.length || 1}, minmax(150px, 1fr))` }}>
        {employeeList.length > 0 ? employeeList.map(employee => (
          <div key={employee._id || employee.nomeCompleto} className={styles.employeeHeader}>
            {employee.nomeCompleto}
          </div>
        )) : <div className={styles.employeeHeader}>Nenhum funcionário encontrado</div>}
      </div>
      <div className={styles.eventArea} style={{ '--employee-count': employeeList.length || 1 }}>
        {appointments.map((item) => {
          const timeStartStr = String(item.horaInicio || '00:00');
          const timeEndStr = String(item.horaFim || '00:00');

          const startHour = parseInt(timeStartStr.split(':')[0]);
          const startMinute = parseInt(timeStartStr.split(':')[1]);
          const endHour = parseInt(timeEndStr.split(':')[0]);
          const endMinute = parseInt(timeEndStr.split(':')[1]);

          const startHalfHour = (startHour - startTime) * 2 + startMinute / 30;
          const durationHalfHours = (endHour * 2 + endMinute / 30) - (startHour * 2 + startMinute / 30);

          const employeeName = item.funcionarioId?.nomeCompleto;
          const employeeIndex = employeeList.findIndex(emp => emp.nomeCompleto === employeeName);

          if (employeeIndex === -1 && employeeList.length > 0) {

            console.warn(`Funcionário "${employeeName}" do agendamento ID ${item._id} não encontrado na lista de funcionários do grid.`);
          }
          
          const displayItem = {
            id: item._id, 
            timeStart: item.horaInicio,
            timeEnd: item.horaFim,
            employee: item.funcionarioId?.nomeCompleto || 'N/A', 
            service: item.servicoId?.titulo || item.servicoId?.nome || 'Serviço N/A', 
            color: item.color || getEventColor(item), 
            client: item.clienteId?.nomeCompleto || 'Cliente N/A', 
            valor: item.valor,
            observacoes: item.observacoes,
          };

          return (
            <div
              key={displayItem.id}
              className={styles.eventCell}
              style={{
                '--event-start-half-hour': startHalfHour,
                '--event-duration-half-hours': durationHalfHours,
                '--employee-index': employeeIndex >= 0 ? employeeIndex : 0, 
                backgroundColor: displayItem.color,
                color: 'black', 
                display: durationHalfHours <= 0 ? 'none' : 'block', 
              }}
              onClick={() => handleEventClick(displayItem)}
            >
              <div className={styles.employee}>{displayItem.employee}</div>
              <div className={styles.service}>{displayItem.service}</div>
              <div className={styles.time}>{`${displayItem.timeStart} - ${displayItem.timeEnd}`}</div>
            </div>
          );
        })}
      </div>

      {isDetailsVisible && selectedEvent && (
        <AppointmentDetails
          event={selectedEvent}
          onClose={handleCloseDetails}
          onEdit={handleEditClick}
        />
      )}

      {isEditFormVisible && eventToEdit && (
        <EditAppointmentForm
          event={eventToEdit}
          onClose={handleCloseEditForm}
          onSave={handleSaveEdit}
          salaoId={salaoId}
        />
      )}
    </div>
  );
};

export default ScheduleGrid;
