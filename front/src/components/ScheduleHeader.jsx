import React, { useState } from 'react';
import styles from './ScheduleHeader.module.css';

const ScheduleHeader = ({ onAddClick }) => {
  // Estado para controlar o valor do input date
  const [selectedDate, setSelectedDate] = useState('');

  // Função para formatar a data no formato yyyy-mm-dd (para input date)
  const formatDateToInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handler do botão "Hoje"
  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(formatDateToInput(today));
  };

  // Handler de mudança do input date
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.filters}>
          <select className={styles.select}>
            <option value="">Serviço</option>
            <option value="nails">Manicure</option>
            <option value="lashes">Design de Sobrancelhas</option>
            <option value="hair">Corte de Cabelo</option>
            <option value="pedicure">Pedicure</option>
            <option value="coloracao">Coloração</option>
            <option value="limpeza_pele">Limpeza de Pele</option>
            <option value="massagem">Massagem Relaxante</option>
          </select>

          <select className={styles.select}>
            <option value="">Funcionário</option>
            <option value="funcionario1">Funcionário 1</option>
            <option value="funcionario2">Funcionário 2</option>
            <option value="funcionario3">Funcionário 3</option>
            <option value="funcionario4">Funcionário 4</option>
          </select>

          <button className={styles.todayButton} onClick={handleTodayClick}>Hoje</button>

          <input 
            type="date" 
            className={styles.datePicker} 
            value={selectedDate} 
            onChange={handleDateChange} 
          />
        </div>

        <button onClick={onAddClick} className={styles.addButton}>Adicionar</button>
      </header>
    </div>
  );
};

export default ScheduleHeader;
