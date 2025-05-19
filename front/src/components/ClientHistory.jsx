//historico de cliente da pagina de cliente
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './ClientHistory.module.css';


const ClientHistory = () => {
  const [service, setService] = useState('');
  const [employee, setEmployee] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setShowCalendar(false);
  };

  const appointments = Array.from({ length: 10 }, (_, i) => ({
    id: `0101010${i}`,
    date: '26/01/2025',
    time: '08:30 - 12:00',
    service: 'Cílios',
    type: 'Mega Volume',
    client: 'Amanda Souza',
    employee: `Funcionário ${i % 2 + 1}`,
    payment: 'Crédito 3x',
    value: '250,00',
    discount: '—',
    status: i % 3 === 0 ? 'Concluído' : i % 3 === 1 ? 'Em aberto' : 'Cancelado',
    notes: 'Desconto aniversário aplicado.'
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Histórico de atendimento</h2>
        <div className={styles.filters}>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Serviço</option>
            <option value="cilios">Cílios</option>
            <option value="corte">Corte</option>
          </select>

          <select value={employee} onChange={(e) => setEmployee(e.target.value)}>
            <option value="">Funcionário</option>
            <option value="func1">Funcionário 1</option>
            <option value="func2">Funcionário 2</option>
          </select>

          <div className={styles.dateSelector}>
            <input
              type="text"
              value={date.toLocaleDateString()}
              readOnly
              onClick={() => setShowCalendar(!showCalendar)}
            />
            {showCalendar && (
              <div className={styles.calendarPopup}>
                <Calendar onChange={handleDateChange} value={date} />
              </div>
            )}
          </div>
        </div>

       
      </div>

      <div className={styles.appointmentsWrapper}>
        {appointments.map((a, index) => (
          <div key={index} className={styles.appointmentCard}>
            <div><strong>ID do procedimento:</strong> {a.id}</div>
            <div><strong>Serviço:</strong> {a.service} | <strong>Tipo:</strong> {a.type}</div>
            <div><strong>Data:</strong> {a.date} | <strong>Hora:</strong> {a.time}</div>
            <div><strong>Nome cliente:</strong> {a.client}</div>
            <div><strong>Funcionário:</strong> {a.employee} | <strong>Pagamento:</strong> {a.payment}</div>
            <div>
              <strong>Valor:</strong> {a.value} | <strong>Desconto:</strong> {a.discount} | <strong>Status:</strong>
              <span className={`${styles.status} ${a.status === 'Concluído' ? styles.statusConcluido : a.status === 'Cancelado' ? styles.statusCancelado : styles.statusAberto}`}>
                {a.status}
              </span>
            </div>
            <div><strong>Observações:</strong> {a.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientHistory;
