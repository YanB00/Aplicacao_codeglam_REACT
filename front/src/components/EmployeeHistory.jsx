//historico de funcionario da pagina de funcionario

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './EmployeeHistory.module.css';

const EmployeeHistory = () => {
  const [service, setService] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setShowCalendar(false);
  };

  const appointments = Array.from({ length: 10 }, (_, i) => ({
    id: `EMP100${i}`,
    date: '26/01/2025',
    time: '08:30 - 12:00',
    service: 'Unhas',
    type: 'Gel',
    client: `Cliente ${i + 1}`,
    employee: 'Juliana',
    payment: 'Pix',
    value: '120,00',
    discount: i % 2 === 0 ? '10%' : '—',
    status: i % 3 === 0 ? 'Concluído' : i % 3 === 1 ? 'Em aberto' : 'Cancelado',
    notes: 'Atendimento sem intercorrências.'
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Histórico de atendimentos da funcionária</h2>
        <div className={styles.filters}>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Serviço</option>
            <option value="unhas">Unhas</option>
            <option value="cilios">Cílios</option>
            <option value="corte">Corte</option>
          </select>

          <select value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="">Cliente</option>
            <option value="cliente1">Cliente 1</option>
            <option value="cliente2">Cliente 2</option>
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
            <div><strong>ID do atendimento:</strong> {a.id}</div>
            <div><strong>Serviço:</strong> {a.service} | <strong>Tipo:</strong> {a.type}</div>
            <div><strong>Data:</strong> {a.date} | <strong>Hora:</strong> {a.time}</div>
            <div><strong>Cliente:</strong> {a.client}</div>
            <div><strong>Funcionária:</strong> {a.employee} | <strong>Pagamento:</strong> {a.payment}</div>
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

export default EmployeeHistory;
