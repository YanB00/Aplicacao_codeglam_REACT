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

  const [salonOperatingHours, setSalonOperatingHours] = useState(null);
  const [isLoadingOperatingHours, setIsLoadingOperatingHours] = useState(true);
  const [fetchOperatingHoursError, setFetchOperatingHoursError] = useState(null);


  const [selectedDateForNewAppointment, setSelectedDateForNewAppointment] = useState(null);

  const [activeFilters, setActiveFilters] = useState({
    date: new Date().toISOString().split('T')[0], 
    serviceId: '',
    employeeId: '',
  });

  const BASE_URL = 'http://localhost:3000'; 

  const fetchSalonOperatingHours = useCallback(async (currentSalonId) => {
    if (!currentSalonId) {
      setSalonOperatingHours(null);
      console.warn("SchedulePage: ID do Salão não fornecido para buscar horários de funcionamento.");
      return;
    }
    setIsLoadingOperatingHours(true);
    setFetchOperatingHoursError(null);
    try {
      const response = await fetch(`${BASE_URL}/register/${currentSalonId}`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Falha ao buscar horários do salão: ${response.statusText} - ${errorData}`);
      }
      const data = await response.json();
      if (data.errorStatus) {
        throw new Error(data.mensageStatus || 'Erro ao buscar horários de funcionamento do salão');
      }
      console.log("SchedulePage: Horários de funcionamento do salão recebidos:", data.data.horariosFuncionamento);
      setSalonOperatingHours(data.data.horariosFuncionamento);
    } catch (error) {
      console.error("Erro ao buscar horários de funcionamento do salão:", error);
      setFetchOperatingHoursError(error.message);
      setSalonOperatingHours(null);
    } finally {
      setIsLoadingOperatingHours(false);
    }
  }, [BASE_URL]);


  const fetchAllAppointmentsForSalao = useCallback(async (currentId) => {
    if (!currentId) {
      setRawAppointmentsFromApi([]);
      console.warn("SchedulePage: ID do Salão não fornecido para buscar agendamentos.");
      return;
    }
    console.log(`SchedulePage: Buscando TODOS os agendamentos para salaoId: ${currentId}`);
    setIsLoadingAppointments(true);
    setFetchAppointmentsError(null);
    try {
      const response = await fetch(`${BASE_URL}/agendamentos/salao/${currentId}`);
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
    if (salonId) {
      fetchAllAppointmentsForSalao(salonId);
      fetchSalonOperatingHours(salonId); 
    } else {
      console.warn("SchedulePage: salonId não recebido via props. Não é possível buscar agendamentos ou horários.");
      setRawAppointmentsFromApi([]);
      setSalonOperatingHours(null);
    }
  }, [salonId, fetchAllAppointmentsForSalao, fetchSalonOperatingHours]); 

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

  const today = new Date();
  const currentDayOfWeek = today.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase(); // e.g., "domingo", "segunda-feira"

  if (isLoadingAppointments || isLoadingOperatingHours) {
    return <p>Carregando agenda e horários do salão...</p>;
  }

  if (fetchAppointmentsError || fetchOperatingHoursError) {
    return <p style={{ color: 'red' }}>Erro ao carregar dados: {fetchAppointmentsError || fetchOperatingHoursError}</p>;
  }

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
      <ScheduleGrid
        appointments={filteredAppointmentsToShowInGrid}
        salaoId={salonId}
        salonOperatingHours={salonOperatingHours}
        selectedDate={activeFilters.date} 
      />

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