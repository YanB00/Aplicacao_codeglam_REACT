import React, { useState, useEffect, useCallback } from 'react';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleGrid from '../components/ScheduleGrid';
import AddAppointmentForm from '../components/AddAppointmentForm';
import styles from './SchedulePage.module.css';

const SchedulePage = ({ salonId }) => {
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [rawAppointmentsFromApi, setRawAppointmentsFromApi] = useState([]);
  const [filteredAppointmentsToShowInGrid, setFilteredAppointmentsToShowInGrid] = useState([]);

  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [fetchAppointmentsError, setFetchAppointmentsError] = useState(null);

  const [selectedDateForNewAppointment, setSelectedDateForNewAppointment] = useState(null);

  const [activeFilters, setActiveFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    serviceId: '',
    employeeId: '',
  });

  const BASE_URL = 'http://localhost:3000';

  // --- MODIFICAÇÃO AQUI: Renomeando 'idDoSalao' para 'currentId' ---
  const fetchAllAppointmentsForSalao = useCallback(async (currentId) => {
    if (!currentId) { // Use currentId aqui
      setRawAppointmentsFromApi([]);
      console.warn("SchedulePage: ID do Salão não fornecido para buscar agendamentos.");
      return;
    }
    console.log(`SchedulePage: Buscando TODOS os agendamentos para salaoId: ${currentId}`); // Use currentId aqui
    setIsLoadingAppointments(true);
    setFetchAppointmentsError(null);
    try {
      const response = await fetch(`${BASE_URL}/agendamentos/salao/${currentId}`); // Use currentId aqui
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Falha ao buscar agendamentos: ${response.statusText} - ${errorData}`);
      }
      const data = await response.json();
      if (data.errorStatus) {
        throw new Error(data.mensageStatus || 'Erro ao buscar agendamentos do salão');
      }
      console.log("SchedulePage: Agendamentos brutos recebidos:", data.data);
      setRawAppointmentsFromApi(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar todos os agendamentos do salão:", error);
      setFetchAppointmentsError(error.message);
      setRawAppointmentsFromApi([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [BASE_URL]);
  // --- FIM DA MODIFICAÇÃO ---


  useEffect(() => {
    if (salonId) {
      fetchAllAppointmentsForSalao(salonId);
    } else {
      console.warn("SchedulePage: salonId não recebido via props. Não é possível buscar agendamentos.");
      setRawAppointmentsFromApi([]);
    }
  }, [salonId, fetchAllAppointmentsForSalao]);

  useEffect(() => {
    console.log("SchedulePage: Aplicando filtros...", activeFilters, "sobre", rawAppointmentsFromApi.length, "agendamentos brutos.");
    let filtered = [...rawAppointmentsFromApi];

    if (activeFilters.date) {
      filtered = filtered.filter(app => {
        if (!app.dataAgendamento) return false;
        const appDate = new Date(app.dataAgendamento).toISOString().split('T')[0];
        return appDate === activeFilters.date;
      });
    }

    if (activeFilters.serviceId) {
      filtered = filtered.filter(app => app.servicoId?._id === activeFilters.serviceId);
    }

    if (activeFilters.employeeId) {
      filtered = filtered.filter(app => app.funcionarioId?._id === activeFilters.employeeId);
    }
    console.log("SchedulePage: Agendamentos após todos os filtros:", filtered);
    setFilteredAppointmentsToShowInGrid(filtered);
  }, [rawAppointmentsFromApi, activeFilters]);

  const handleFilterChange = useCallback((filterName, value) => {
    console.log(`SchedulePage: Filtro '${filterName}' alterado para '${value}'`);
    setActiveFilters(prevFilters => {
      if (prevFilters[filterName] === value) {
        return prevFilters;
      }
      console.log(`SchedulePage: Atualizando activeFilters.${filterName} para`, value);
      return {
        ...prevFilters,
        [filterName]: value,
      };
    });
  }, []);

  const handleAddClick = () => {
    setSelectedDateForNewAppointment(activeFilters.date);
    console.log("SchedulePage: Botão Adicionar clicado. Data para novo agendamento:", activeFilters.date);

    if (salonId) {
      setIsAddFormVisible(true);
    } else {
      alert("ID do Salão não identificado. Por favor, recarregue a página ou entre em contato com o suporte.");
    }
  };

  const handleCloseForm = () => {
    setIsAddFormVisible(false);
    setSelectedDateForNewAppointment(null);
  };

  const handleAppointmentCreated = () => {
    console.log("SchedulePage: Agendamento criado. Buscando lista atualizada de todos os agendamentos do salão.");
    if (salonId) {
      fetchAllAppointmentsForSalao(salonId);
    }
    setIsAddFormVisible(false);
  };

  return (
    <div className={styles.page}>
      <ScheduleHeader
        onAddClick={handleAddClick}
        salaoId={salonId}
        currentDate={activeFilters.date}
        currentServiceId={activeFilters.serviceId}
        currentEmployeeId={activeFilters.employeeId}
        onFilterChange={handleFilterChange}
      />
      {isLoadingAppointments && <p>Carregando agendamentos...</p>}
      {fetchAppointmentsError && <p style={{ color: 'red' }}>Erro ao carregar agendamentos: {fetchAppointmentsError}</p>}
      {!isLoadingAppointments && !fetchAppointmentsError && (
        <ScheduleGrid appointments={filteredAppointmentsToShowInGrid} salaoId={salonId} />
      )}

      {isAddFormVisible && salonId && selectedDateForNewAppointment && (
        <AddAppointmentForm
          onClose={handleCloseForm}
          salaoId={salonId}
          selectedDate={selectedDateForNewAppointment}
          onAppointmentSuccessfullySaved={handleAppointmentCreated}
        />
      )}
    </div>
  );
};

export default SchedulePage;