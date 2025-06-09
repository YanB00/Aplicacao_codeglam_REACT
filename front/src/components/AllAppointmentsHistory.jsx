import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './AllAppointmentsHistory.module.css';
import { FaTimesCircle } from 'react-icons/fa';

const getBrasiliaDateString = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

export default function AllAppointmentsHistory({ userId }) { 
  const [allAppointments, setAllAppointments] = useState([]);
  const [serviceFilter, setServiceFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableServices, setAvailableServices] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [filterError, setFilterError] = useState(null);

  const BASE_URL = 'http://localhost:3000'; 

  useEffect(() => {
    const fetchAllAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE_URL}/agendamentos/salao/${userId}`); 

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.errorStatus) {
          throw new Error(result.mensageStatus || 'Failed to fetch all appointments');
        }

        const formattedAppointments = result.data.map(agendamento => ({
          id: agendamento._id,
          date: new Date(agendamento.dataAgendamento),
          time: `${agendamento.horaInicio} - ${agendamento.horaFim}`,
          // Ensure these nested IDs are correctly populated by your backend's populate
          service: agendamento.servicoId ? agendamento.servicoId.titulo : 'N/A',
          serviceId: agendamento.servicoId ? agendamento.servicoId._id : 'N/A',
          client: agendamento.clienteId ? agendamento.clienteId.nomeCompleto : 'N/A',
          clientId: agendamento.clienteId ? agendamento.clienteId._id : 'N/A',
          employee: agendamento.funcionarioId ? agendamento.funcionarioId.nomeCompleto : 'N/A',
          employeeId: agendamento.funcionarioId ? agendamento.funcionarioId._id : 'N/A',
          value: agendamento.valor ? `R$ ${parseFloat(agendamento.valor).toFixed(2).replace('.', ',')}` : 'R$ 0,00',
          discount: agendamento.desconto ? `${parseFloat(agendamento.desconto).toFixed(2)}%` : '—',
          status: agendamento.concluido ? 'Concluído' : (agendamento.cancelado ? 'Cancelado' : 'Em aberto'),
          notes: agendamento.observacoes || 'Sem observações.'
        }));
        setAllAppointments(formattedAppointments);
      } catch (e) {
        console.error('Falha ao buscar atendimentos:', e);
        setError(`Erro ao carregar atendimentos: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAllAppointments();
    } else {
      setLoading(false);
      setError("User ID (ID do salão) não fornecido.");
    }
  }, [userId]);

  useEffect(() => {
    const fetchFilterData = async () => {
      setLoadingFilters(true);
      setFilterError(null);
      try {
        // FIX 1: Correct URL for fetching services - ADD /salao
        const servicesResponse = await fetch(`${BASE_URL}/servicos/salao/${userId}`); // <--- CORRECTED HERE
        if (!servicesResponse.ok) {
          throw new Error(`HTTP error! status: ${servicesResponse.status} for services`);
        }
        const servicesResult = await servicesResponse.json();
        if (servicesResult.errorStatus) {
          throw new Error(servicesResult.mensageStatus || 'Failed to fetch services');
        }
        setAvailableServices(servicesResult.data);

        // FIX 2: Correct URL for fetching employees (this one was already correct)
        const employeesResponse = await fetch(`${BASE_URL}/funcionarios/salao/${userId}`);
        if (!employeesResponse.ok) {
          throw new Error(`HTTP error! status: ${employeesResponse.status} for employees`);
        }
        const employeesResult = await employeesResponse.json();
        if (employeesResult.errorStatus) {
          throw new Error(employeesResult.mensageStatus || 'Failed to fetch employees');
        }
        setAvailableEmployees(employeesResult.data);

      } catch (e) {
        console.error("Error fetching filter data:", e);
        setFilterError(`Erro ao carregar opções de filtro: ${e.message}`);
      } finally {
        setLoadingFilters(false);
      }
    };

    if (userId) {
      fetchFilterData();
    } else {
      console.warn('userId is missing, cannot fetch services or employees.');
      setLoadingFilters(false);
      setFilterError('ID do salão não fornecido para carregar serviços e funcionários.');
    }
  }, [userId]);

  const filtered = allAppointments.filter(a => {
    const sMatch = !serviceFilter || a.serviceId === serviceFilter;
    const eMatch = !searchText ||
      a.client.toLowerCase().includes(searchText.toLowerCase()) ||
      a.employee.toLowerCase().includes(searchText.toLowerCase());

    const apptDateBrasiliaString = getBrasiliaDateString(a.date);
    const filterDateBrasiliaString = dateFilter ? getBrasiliaDateString(dateFilter) : null;

    const dMatch = dateFilter === null || (apptDateBrasiliaString === filterDateBrasiliaString);

    const statusMatch = !statusFilter || a.status === statusFilter;

    return sMatch && eMatch && dMatch && statusMatch;
  });

  const handleDateChange = (selectedDate) => {
    setDateFilter(selectedDate);
    setShowCalendar(false);
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    setShowCalendar(false);
  };

  if (loading || loadingFilters) {
    return (
      <>
        <div className={styles.pageHeader}>
          <h2>Histórico geral de atendimentos</h2>
        </div>
        <div className={styles.panel}>
          <p>Carregando histórico e filtros...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className={styles.pageHeader}>
          <h2>Histórico geral de atendimentos</h2>
        </div>
        <div className={styles.panel}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </>
    );
  }

  if (filterError) {
    return (
      <>
        <div className={styles.pageHeader}>
          <h2>Histórico geral de atendimentos</h2>
        </div>
        <div className={styles.panel}>
          <p className={styles.errorMessage}>{filterError}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h2>Histórico geral de atendimentos</h2>
      </div>

      <div className={styles.panel}>
        <div className={styles.filters}>
          <select
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
          >
            <option value="">Serviço</option>
            {availableServices && availableServices.length > 0 ? (
              availableServices.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.titulo}
                </option>
              ))
            ) : (
              <option disabled>Carregando serviços...</option>
            )}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Concluído">Concluído</option>
            <option value="Em aberto">Em aberto</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar cliente ou funcionário"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />

          <div className={styles.dateSelector}>
            <input
              readOnly
              placeholder="Data"
              value={dateFilter ? dateFilter.toLocaleDateString('pt-BR') : ''}
              onClick={() => setShowCalendar(!showCalendar)}
            />
            {dateFilter && (
              <FaTimesCircle
                className={styles.clearDateIcon}
                onClick={clearDateFilter}
                title="Limpar filtro de data"
              />
            )}
            {showCalendar && (
              <div className={styles.calendarPopup}>
                <Calendar
                  locale="pt-BR"
                  onChange={handleDateChange}
                  value={dateFilter || new Date()}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.listBox}>
          {filtered.length ? (
            filtered.map(a => (
              <div key={a.id} className={styles.card}>
                <div><strong>ID do atendimento:</strong> {a.id}</div>
                <div><strong>Serviço:</strong> {a.service}</div>
                <div><strong>Data:</strong> {a.date.toLocaleDateString('pt-BR')} | <strong>Hora:</strong> {a.time}</div>
                <div><strong>Cliente:</strong> {a.client}</div>
                <div><strong>Funcionário:</strong> {a.employee} </div>
                <div>
                  <strong>Valor:</strong> {a.value} | <strong>Status:</strong>
                  <span className={`${styles.status} ${
                    a.status === 'Concluído'
                      ? styles.statusConcluido
                      : a.status === 'Cancelado'
                        ? styles.statusCancelado
                        : styles.statusAberto
                  }`}>{a.status}</span>
                </div>
                <div><strong>Observações:</strong> {a.notes}</div>
              </div>
            ))
          ) : (
            <p>Nenhum atendimento encontrado com os filtros selecionados.</p>
          )}
        </div>
      </div>
    </>
  );
}