//detalhes do agendamento quando clica nos cards do grid 

import React from 'react';
import styles from './AppointmentDetails.module.css';
import { AiOutlineClose } from 'react-icons/ai';

const AppointmentDetails = ({ event, onClose, onEdit }) => {
  if (!event) {
    return null;
  }

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.topBar} style={{ backgroundColor: event.color }}>
        <AiOutlineClose className={styles.closeIcon} onClick={onClose} />
      </div>
      <h3>{event.timeStart} - {event.timeEnd}</h3>
      <p><strong>Cliente:</strong> {event.client || 'Não especificado'}</p>
      <p><strong>Funcionário:</strong> {event.employee}</p>
      <p><strong>Serviço:</strong> {event.service}</p>
      {event.tipo && <p><strong>Tipo:</strong> {event.tipo}</p>}
      {event.valor && <p><strong>Valor:</strong> {event.valor}</p>}
    <div className={styles.concluido}>
  <div>
    <label>Concluído:</label>
    <input type="checkbox" />
  </div>
  <div>
    <label>Cancelado:</label>
    <input type="checkbox" />
  </div>
</div>

      <div className={styles.actions}>
        <button style={{ backgroundColor: event.color, color: 'black' }} onClick={() => onEdit(event)}>Editar</button>
      </div>
    </div>
  );
};

export default AppointmentDetails;