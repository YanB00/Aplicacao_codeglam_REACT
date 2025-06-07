import React, { useState, useEffect, useCallback } from 'react';
import styles from './ScheduleGrid.module.css'; 
import AppointmentDetails from './AppoinmentDetails'; 
import EditAppointmentForm from './EditAppointmentForm'; 

const API_BASE_URL = 'http://localhost:3000'; 

const ScheduleGrid = ({ appointments: initialAppointments = [], salaoId, selectedDate }) => {
  console.log('ScheduleGrid received initialAppointments:', initialAppointments);

  const startTime = 8;
  const endTime = 19;
  const timeSlots = Array.from({ length: (endTime - startTime) * 2 }, (_, i) => {
    const hour = startTime + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  const [employeeList, setEmployeeList] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [currentAppointments, setCurrentAppointments] = useState(initialAppointments);

  useEffect(() => {
    console.log('ScheduleGrid: initialAppointments prop changed, updating currentAppointments.');
    setCurrentAppointments(initialAppointments);
  }, [initialAppointments]);


  const fetchEmployees = useCallback(async () => {
    if (!salaoId) {
      setEmployeeList([]);
      return;
    }
    setIsLoadingEmployees(true);
    try {
      const response = await fetch(`${API_BASE_URL}/funcionarios?salaoId=${salaoId}`);
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
  }, [salaoId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const handleEventClick = (eventData) => {
    console.log("Event clicked, preparing to set selectedEvent. ID in eventData:", eventData.id, "Full eventData:", eventData);
    setSelectedEvent(eventData);
    setIsDetailsVisible(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsVisible(false);
    setSelectedEvent(null);
  };

  const handleEditClick = (eventData) => {
    console.log("Edit clicked, ID in eventData:", eventData.id);
    setEventToEdit(eventData);
    setIsEditFormVisible(true);
    setIsDetailsVisible(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormVisible(false);
    setEventToEdit(null);
  };

 const handleAppointmentUpdated = (updatedAppointmentFromBackend) => {
    console.log("handleAppointmentUpdated called with:", updatedAppointmentFromBackend);
    setCurrentAppointments(prevAppointments =>
      prevAppointments.map(appt =>
        appt._id === updatedAppointmentFromBackend._id ? { ...appt, ...updatedAppointmentFromBackend } : appt
      )
    );
    if (selectedEvent && selectedEvent.id === updatedAppointmentFromBackend._id) {
        console.log("Refreshing selectedEvent in details view.");
        const refreshedEvent = {
            id: updatedAppointmentFromBackend._id,
            timeStart: updatedAppointmentFromBackend.horaInicio,
            timeEnd: updatedAppointmentFromBackend.horaFim,
            employee: updatedAppointmentFromBackend.funcionarioId?.nomeCompleto || 'N/A',
            service: updatedAppointmentFromBackend.servicoId?.titulo || 'Serviço N/A',
            client: updatedAppointmentFromBackend.clienteId?.nomeCompleto || 'Cliente N/A',
            valor: updatedAppointmentFromBackend.valor,
            observacoes: updatedAppointmentFromBackend.observacoes,
            concluido: updatedAppointmentFromBackend.concluido,
            cancelado: updatedAppointmentFromBackend.cancelado,
            color: getEventColor(updatedAppointmentFromBackend), 
        };
        setSelectedEvent(refreshedEvent);
    }
  };

  const handleSaveEdit = (updatedEventDataFromForm) => {
    console.log("handleSaveEdit called with:", updatedEventDataFromForm);
    setCurrentAppointments(prevAppointments =>
        prevAppointments.map(appt => {
            if (appt._id === updatedEventDataFromForm.id) { 
                const newAppt = {
                    ...appt,
                    horaInicio: updatedEventDataFromForm.timeStart || appt.horaInicio,
                    horaFim: updatedEventDataFromForm.timeEnd || appt.horaFim,
                    valor: updatedEventDataFromForm.valor !== undefined ? parseFloat(updatedEventDataFromForm.valor) : appt.valor,
                    observacoes: updatedEventDataFromForm.observacoes !== undefined ? updatedEventDataFromForm.observacoes : appt.observacoes,
                    servicoId: {
                        ...(appt.servicoId || {}),
                        titulo: updatedEventDataFromForm.service || appt.servicoId?.titulo,
                    },
                    clienteId: {
                        ...(appt.clienteId || {}),
                        nomeCompleto: updatedEventDataFromForm.client || appt.clienteId?.nomeCompleto,
                    },
                    funcionarioId: {
                        ...(appt.funcionarioId || {}),
                        nomeCompleto: updatedEventDataFromForm.employee || appt.funcionarioId?.nomeCompleto,
                    },
                };
                return newAppt;
            }
            return appt;
        })
    );
    setIsEditFormVisible(false);
    setEventToEdit(null);
  };

  const getEventColor = (item) => {
    const servicoId = item.servicoId?._id || item.servicoId?.titulo || item.servicoId;
    const funcionarioId = item.funcionarioId?._id || item.funcionarioId?.nomeCompleto || item.funcionarioId;
    const itemId = item._id || item.id;

    const colors = ['#f8c6dc', '#e5d0f8', '#cdd9ff', '#c8f7f4', '#a7f3d0', '#f5d7b0', '#ffcbcb', '#d4e157'];
    const idPart = String(servicoId || funcionarioId || itemId || 'default');
    let hash = 0;
    for (let i = 0; i < idPart.length; i++) {
      hash = idPart.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoadingEmployees && employeeList.length === 0 && salaoId) {
    return <div className={styles.loadingContainer}><p>Carregando funcionários...</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.timeColumn}>
        {timeSlots.filter((_, index) => index % 2 === 0).map(time => (
          <div key={time} className={styles.timeSlotLabel}>{time.slice(0, 2)}:00</div>
        ))}
      </div>
      <div className={styles.gridContent} style={{ '--employee-count': Math.max(1, employeeList.length) }}>
        <div className={styles.eventArea} >
          {currentAppointments.map((item, index) => {
            console.log(`Mapping item index ${index}:`, item._id, "| Length:", item._id?.length, "| Full item:", item);

            if (item._id && item._id.length < 24) {
                console.warn(`CRITICAL: Appointment item (index ${index}) has a TRUNCATED _id: ${item._id}`, item);
            }

            const timeStartStr = String(item.horaInicio || '00:00');
            const timeEndStr = String(item.horaFim || '00:00');

            const startHour = parseInt(timeStartStr.split(':')[0]);
            const startMinute = parseInt(timeStartStr.split(':')[1]);
            const endHour = parseInt(timeEndStr.split(':')[0]);
            const endMinute = parseInt(timeEndStr.split(':')[1]);

            const startTotalMinutes = (isNaN(startHour) ? 0 : startHour * 60) + (isNaN(startMinute) ? 0 : startMinute);
            const endTotalMinutes = (isNaN(endHour) ? 0 : endHour * 60) + (isNaN(endMinute) ? 0 : endMinute);
            const gridStartTotalMinutes = startTime * 60;

            const startHalfHour = Math.max(0, (startTotalMinutes - gridStartTotalMinutes) / 30);
            const durationHalfHours = Math.max(0, (endTotalMinutes - startTotalMinutes) / 30);

            const employeeId = item.funcionarioId?._id || item.funcionarioId;
            const employeeIndex = employeeList.findIndex(emp => emp._id === employeeId);

            const defaultEventColor = getEventColor(item);

            const displayItem = {
              id: item._id,
              timeStart: item.horaInicio,
              timeEnd: item.horaFim,
              employee: item.funcionarioId?.nomeCompleto || 'N/A',
              service: item.servicoId?.titulo || item.servicoId?.nome || 'Serviço N/A',
              color: defaultEventColor, 
              client: item.clienteId?.nomeCompleto || 'Cliente N/A',
              valor: item.valor,
              observacoes: item.observacoes,
              concluido: item.concluido,
              cancelado: item.cancelado,
              _id: item._id,
              funcionarioId: item.funcionarioId?._id || item.funcionarioId,
              servicoId: item.servicoId?._id || item.servicoId,
              clienteId: item.clienteId?._id || item.clienteId,
              salaoId: item.salaoId?._id || item.salaoId,
              dataAgendamento: item.dataAgendamento,
            };

            let eventClassName = styles.eventCell;
            if (item.concluido) {
                eventClassName += ` ${styles.concluidoEvent}`;
            } else if (item.cancelado) {
                eventClassName += ` ${styles.canceladoEvent}`;
            }

            return (
              <div
                key={item._id || `event-${index}`}
                className={eventClassName}
                style={{
                  '--event-start-half-hour': startHalfHour,
                  '--event-duration-half-hours': durationHalfHours,
                  '--employee-index': employeeIndex >= 0 ? employeeIndex : 0,

                  backgroundColor: (!item.concluido && !item.cancelado) ? defaultEventColor : undefined,
                  display: durationHalfHours <= 0 ? 'none' : 'block',
                  opacity: item.cancelado ? 0.7 : 1,
                }}
                onClick={() => handleEventClick(displayItem)}
                title={`${displayItem.service} com ${displayItem.employee}\nCliente: ${displayItem.client}\nStatus: ${item.concluido ? 'Concluído' : (item.cancelado ? 'Cancelado' : 'Agendado')}`}
              >
                <div className={styles.eventEmployee}>{displayItem.employee}</div>
                <div className={styles.eventService}>{displayItem.service}</div>
                <div className={styles.eventTime}>{`${displayItem.timeStart} - ${displayItem.timeEnd}`}</div>
              </div>
            );
          })}
        </div>
      </div>

      {isDetailsVisible && selectedEvent && (
        <AppointmentDetails
          event={selectedEvent}
          onClose={handleCloseDetails}
          onEdit={handleEditClick}
          onAppointmentUpdate={handleAppointmentUpdated}
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
