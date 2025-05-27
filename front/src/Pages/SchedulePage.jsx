import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleGrid from '../components/ScheduleGrid';
import AddAppointmentForm from '../components/AddAppointmentForm';
import styles from './SchedulePage.module.css';

const SchedulePage = () => {
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [rawAppointmentsFromApi, setRawAppointmentsFromApi] = useState([]);
  const [filteredAppointmentsToShowInGrid, setFilteredAppointmentsToShowInGrid] = useState([]);
  
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [fetchAppointmentsError, setFetchAppointmentsError] = useState(null);

  const [currentSalaoId, setCurrentSalaoId] = useState(null);
  const [selectedDateForNewAppointment, setSelectedDateForNewAppointment] = useState(null);

  const [activeFilters, setActiveFilters] = useState({
    date: new Date().toISOString().split('T')[0], 
    serviceId: '', 
    employeeId: '', 
  });

  const location = useLocation();
  const BASE_URL = 'http://localhost:3000';

  const fetchAllAppointmentsForSalao = useCallback(async (salaoId) => {
    if (!salaoId) {
      setRawAppointmentsFromApi([]);
      return;
    }
    console.log(`SchedulePage: Buscando TODOS os agendamentos para salaoId: ${salaoId}`);
    setIsLoadingAppointments(true);
    setFetchAppointmentsError(null);
    try {
      const response = await fetch(`${BASE_URL}/agendamentos/salao/${salaoId}`);
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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userIdFromUrl = queryParams.get('userId');
    if (userIdFromUrl) {
      if (currentSalaoId !== userIdFromUrl) {
        setCurrentSalaoId(userIdFromUrl);
      }
    } else if (currentSalaoId !== null) {
      setCurrentSalaoId(null);
      setRawAppointmentsFromApi([]); 
    }
  }, [location.search, currentSalaoId]);

  useEffect(() => {
    if (currentSalaoId) {
      fetchAllAppointmentsForSalao(currentSalaoId);
    }
  }, [currentSalaoId, fetchAllAppointmentsForSalao]);

  useEffect(() => {
    console.log("SchedulePage: Aplicando filtros...", activeFilters, "sobre", rawAppointmentsFromApi.length, "agendamentos brutos.");
    let filtered = [...rawAppointmentsFromApi];

    // Filtro por Data
    if (activeFilters.date) {
      filtered = filtered.filter(app => {
        if (!app.dataAgendamento) return false;
        const appDate = new Date(app.dataAgendamento).toISOString().split('T')[0];
        return appDate === activeFilters.date;
      });
    }

    // Filtro por Serviço
    if (activeFilters.serviceId) {
      filtered = filtered.filter(app => app.servicoId?._id === activeFilters.serviceId);
    }

    //Filtro por Funcionário
    if (activeFilters.employeeId) {
      filtered = filtered.filter(app => app.funcionarioId?._id === activeFilters.employeeId);
    }
    console.log("SchedulePage: Agendamentos após todos os filtros:", filtered);
    setFilteredAppointmentsToShowInGrid(filtered);
  }, [rawAppointmentsFromApi, activeFilters]);


  // Callback para o ScheduleHeader atualizar um valor de filtro específico
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

    if (currentSalaoId) {
      setIsAddFormVisible(true);
    } else {
      alert("ID do Salão não identificado na URL. Não é possível adicionar agendamento.");
    }
  };

  const handleCloseForm = () => {
    setIsAddFormVisible(false);
    setSelectedDateForNewAppointment(null);
  };

  const handleAppointmentCreated = () => {
    console.log("SchedulePage: Agendamento criado. Buscando lista atualizada de todos os agendamentos do salão.");
    if (currentSalaoId) {
      fetchAllAppointmentsForSalao(currentSalaoId);
    }
    setIsAddFormVisible(false);
  };

  return (
    <div className={styles.page}>
      <ScheduleHeader
        onAddClick={handleAddClick}
        salaoId={currentSalaoId}
        currentDate={activeFilters.date}
        currentServiceId={activeFilters.serviceId}
        currentEmployeeId={activeFilters.employeeId}
        onFilterChange={handleFilterChange}
      />
      {isLoadingAppointments && <p>Carregando agendamentos...</p>}
      {fetchAppointmentsError && <p style={{ color: 'red' }}>Erro ao carregar agendamentos: {fetchAppointmentsError}</p>}
      {!isLoadingAppointments && !fetchAppointmentsError && (
        <ScheduleGrid appointments={filteredAppointmentsToShowInGrid} salaoId={currentSalaoId} />
      )}
      
      {isAddFormVisible && currentSalaoId && selectedDateForNewAppointment && (
        <AddAppointmentForm
          onClose={handleCloseForm}
          salaoId={currentSalaoId}
          selectedDate={selectedDateForNewAppointment}
          onAppointmentSuccessfullySaved={handleAppointmentCreated}
        />
      )}
    </div>
  );
};

export default SchedulePage;
