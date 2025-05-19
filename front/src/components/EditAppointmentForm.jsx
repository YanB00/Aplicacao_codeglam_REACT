//editar agendamento na pagina do calendario

import React, { useState, useEffect } from 'react';
import styles from './EditAppointmentForm.module.css';
import { AiOutlineClose } from 'react-icons/ai';

const EditAppointmentForm = ({ event, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...event });

  useEffect(() => {
    setFormData({ ...event });
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.editFormContainer}>
      <div className={styles.topBar}>
        <h3>Editar Agendamento</h3>
        <AiOutlineClose className={styles.closeIcon} onClick={onClose} />
      </div>
      <div className={styles.formContent}>
        <div className={styles.inputGroup}>
          <label htmlFor="timeStart">Hora Início:</label>
          <input type="time" id="timeStart" name="timeStart" value={formData.timeStart} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="timeEnd">Hora Fim:</label>
          <input type="time" id="timeEnd" name="timeEnd" value={formData.timeEnd} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="service">Serviço:</label>
          <input type="text" id="service" name="service" value={formData.service} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="client">Cliente:</label>
          <input type="text" id="client" name="client" value={formData.client} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="employee">Funcionário:</label>
          <input type="text" id="employee" name="employee" value={formData.employee} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="valor">Valor:</label>
          <input type="text" id="valor" name="valor" value={formData.valor} onChange={handleChange} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="observacoes">Observações:</label>
          <textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} />
        </div>
        <div className={styles.actions}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentForm;