import React, { useState, useEffect } from 'react';
import styles from './ScheduleHeader.module.css';

const ScheduleHeader = ({
  onAddClick,
  salaoId, 
  currentDate,
  currentServiceId,
  currentEmployeeId,
  onFilterChange,
}) => {
  const [servicesList, setServicesList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

  const BASE_URL = 'http://localhost:3000';

  const formatDateToInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
    }
    const d = new Date(date);
  
    if (isNaN(d.getTime())) {
        console.warn("formatDateToInput recebeu data inválida:", date);
        return new Date().toISOString().split('T')[0]; 
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdowns(true);
      
      if (salaoId) {
        try {
          const servicesRes = await fetch(`${BASE_URL}/servicos/salao/${salaoId}`);
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            const activeServices = (servicesData.data || []).filter(service => service.status === 'Ativo');
            setServicesList(activeServices);
          } else {
            console.error("Falha ao buscar serviços para o header:", servicesRes.status, servicesRes.statusText);
            setServicesList([]);
          }
        } catch (error) {
          console.error("Erro ao buscar serviços para o header (catch):", error);
          setServicesList([]);
        }
      } else {
        console.warn("ScheduleHeader: salaoId não fornecido, não é possível buscar serviços.");
        setServicesList([]);
      }

      if (salaoId) { 
        try {
          const employeesRes = await fetch(`${BASE_URL}/funcionarios/salao/${salaoId}`);
          if (employeesRes.ok) {
            const employeesData = await employeesRes.json();
            setEmployeesList(employeesData.data || []);
          } else {
            console.error("Falha ao buscar funcionários para o header:", employeesRes.status, employeesRes.statusText);
            setEmployeesList([]);
          }
        } catch (error) {
          console.error("Erro ao buscar funcionários para o header (catch):", error);
          setEmployeesList([]);
        }
      } else {
        console.warn("ScheduleHeader: salaoId não fornecido, não é possível buscar funcionários.");
        setEmployeesList([]);
      }

      setIsLoadingDropdowns(false);
    };

    fetchDropdownData();
  }, [salaoId, BASE_URL]); 

  const handleDateChange = (e) => {
    onFilterChange('date', e.target.value);
  };

  const handleServiceChange = (e) => {
    onFilterChange('serviceId', e.target.value);
  };

  const handleEmployeeChange = (e) => {
    onFilterChange('employeeId', e.target.value);
  };

  const handleTodayClick = () => {
    onFilterChange('date', formatDateToInput(new Date()));
  };

  const navigateDate = (days) => {
    if (!currentDate) return;
    const dateObj = new Date(currentDate + "T00:00:00");
    dateObj.setDate(dateObj.getDate() + days);
    onFilterChange('date', formatDateToInput(dateObj));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={currentServiceId}
            onChange={handleServiceChange}
            disabled={isLoadingDropdowns}
          >
            <option value="">Todos Serviços</option>
            {servicesList.map(service => (
              <option key={service._id} value={service._id}>{service.titulo}</option>
            ))}
          </select>

          <select
            className={styles.select}
            value={currentEmployeeId}
            onChange={handleEmployeeChange}
            disabled={isLoadingDropdowns}
          >
            <option value="">Todos Funcionários</option>
            {employeesList.map(employee => (
              <option key={employee._id} value={employee._id}>{employee.nomeCompleto}</option>
            ))}
          </select>

          <button className={styles.navButton} onClick={() => navigateDate(-1)} title="Dia Anterior">‹</button>
          <input
            type="date"
            className={styles.datePicker}
            value={formatDateToInput(currentDate)}
            onChange={handleDateChange}
          />
          <button className={styles.navButton} onClick={() => navigateDate(1)} title="Próximo Dia">›</button>
          <button className={styles.todayButton} onClick={handleTodayClick}>Hoje</button>
        </div>

        <button
          onClick={() => onAddClick(currentDate)}
          className={styles.addButton}
        >
          Adicionar
        </button>
      </header>
    </div>
  );
};

export default ScheduleHeader;