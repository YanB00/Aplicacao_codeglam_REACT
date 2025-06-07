import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './ClientHistory.module.css';

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

const ClientHistory = ({ clientId, salaoId }) => { 
  const [serviceFilter, setServiceFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date()); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableServices, setAvailableServices] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [filterError, setFilterError] = useState(null);

  console.log('ClientHistory: clientId received:', clientId);
  console.log('ClientHistory: salaoId received:', salaoId);

  // Efeito para buscar os agendamentos do cliente
  useEffect(() => {

    const fetchClientAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/agendamentos/cliente/${clientId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.errorStatus) {
          throw new Error(result.mensageStatus || 'Failed to fetch appointments');
        }

        const formattedAppointments = result.data.map(agendamento => ({
          id: agendamento._id,
          date: new Date(agendamento.dataAgendamento),
          time: `${agendamento.horaInicio} - ${agendamento.horaFim}`,
          service: agendamento.servicoId ? agendamento.servicoId.titulo : 'N/A',
          serviceId: agendamento.servicoId ? agendamento.servicoId._id : 'N/A',
          client: agendamento.clienteId ? agendamento.clienteId.nomeCompleto : 'N/A',
          clientId: agendamento.clienteId ? agendamento.clienteId._id : 'N/A',
          employee: agendamento.funcionarioId ? agendamento.funcionarioId.nomeCompleto : 'N/A',
          employeeId: agendamento.funcionarioId ? agendamento.funcionarioId._id : 'N/A', 
          value: agendamento.valor ? `R$ ${parseFloat(agendamento.valor).toFixed(2)}` : 'R$ 0,00',
          payment: agendamento.valor ? `R$ ${parseFloat(agendamento.valor).toFixed(2)}` : 'R$ 0,00',
          status: agendamento.concluido ? 'Concluído' : (agendamento.cancelado ? 'Cancelado' : 'Em aberto'),
          notes: agendamento.observacoes || 'Sem observações.'
        }));
        setAppointments(formattedAppointments);
        console.log("--> Todos os Agendamentos formatados do Cliente recebidos do Backend:", formattedAppointments);
      } catch (e) {
        console.error("Error fetching client appointments:", e);
        setError(`Erro ao carregar agendamentos do cliente: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientAppointments();
    } else {
      setLoading(false);
      setError("Client ID not provided.");
    }
  }, [clientId]);


  useEffect(() => {
    const fetchFilterData = async () => {
      setLoadingFilters(true);
      setFilterError(null);
      try {
        // --- SERVIÇOS ---
        console.log('Fetching services from:', `http://localhost:3000/servicos/${salaoId}`);
        const servicesResponse = await fetch(`http://localhost:3000/servicos/${salaoId}`);

        if (!servicesResponse.ok) {
          throw new Error(`HTTP error! status: ${servicesResponse.status} for services`);
        }
        const servicesResult = await servicesResponse.json();

        if (servicesResult.errorStatus) {
          throw new Error(servicesResult.mensageStatus || 'Failed to fetch services');
        }
        setAvailableServices(servicesResult.data);
        console.log('Fetched services:', servicesResult.data);

        // --- FUNCIONÁRIOS ---
        console.log('Fetching employees from:', `http://localhost:3000/funcionarios/salao/${salaoId}`);
        const employeesResponse = await fetch(`http://localhost:3000/funcionarios/salao/${salaoId}`);

        if (!employeesResponse.ok) {
          throw new Error(`HTTP error! status: ${employeesResponse.status} for employees`);
        }
        const employeesResult = await employeesResponse.json();

        if (employeesResult.errorStatus) {
          throw new Error(employeesResult.mensageStatus || 'Failed to fetch employees');
        }
        setAvailableEmployees(employeesResult.data);
        console.log('Fetched employees:', employeesResult.data);

      } catch (e) {
        console.error("Error fetching filter data:", e);
        setFilterError(`Erro ao carregar opções de filtro: ${e.message}`);
      } finally {
        setLoadingFilters(false);
      }
    };

    if (salaoId) {
      fetchFilterData();
    } else {
      console.warn('SalaoId is missing, cannot fetch services or employees.');
      setLoadingFilters(false);
      setFilterError('ID do salão não fornecido para carregar serviços e funcionários.');
    }
  }, [salaoId]);

  const handleDateChange = (selectedDate) => {
    setDateFilter(selectedDate);
    setShowCalendar(false);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesService = serviceFilter === '' || appointment.serviceId === serviceFilter;
    const matchesEmployee = employeeFilter === '' || appointment.employeeId === employeeFilter; 

    const apptDateBrasiliaString = getBrasiliaDateString(appointment.date);
    const filterDateBrasiliaString = getBrasiliaDateString(dateFilter);

    const matchesDate = apptDateBrasiliaString === filterDateBrasiliaString;

    return matchesService && matchesEmployee && matchesDate; 
  });

  if (loading || loadingFilters) {
    return <div className={styles.container}><p>Carregando histórico e filtros...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.errorMessage}>{error}</p></div>;
  }

  if (filterError) {
    return <div className={styles.container}><p className={styles.errorMessage}>{filterError}</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Histórico de atendimento</h2>
        <div className={styles.filters}>
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
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

          <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            <option value="">Funcionário</option>
            {availableEmployees && availableEmployees.length > 0 ? (
              availableEmployees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.nomeCompleto}
                </option>
              ))
            ) : (
              <option disabled>Carregando funcionários...</option>
            )}
          </select>

          <div className={styles.dateSelector}>
            <input
              type="text"
              value={dateFilter.toLocaleDateString('pt-BR')}
              readOnly
              onClick={() => setShowCalendar(!showCalendar)}
            />
            {showCalendar && (
              <div className={styles.calendarPopup}>
                <Calendar onChange={handleDateChange} value={dateFilter} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.appointmentsWrapper}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((a, index) => (
            <div key={a.id || index} className={styles.appointmentCard}>
              <div><strong>Observações:</strong> {a.notes}</div>
              <div><strong>ID do procedimento:</strong> {a.id}</div>
              <div><strong>Serviço:</strong> {a.service}</div>
              <div><strong>Data:</strong> {a.date.toLocaleDateString('pt-BR')} | <strong>Hora:</strong> {a.time}</div>
              <div><strong>Funcionário:</strong> {a.employee}</div>
              <div><strong>Pagamento:</strong> {a.payment || 'N/A'}</div>
              <div>
                <strong>Valor:</strong> {a.value} | <strong>Status:</strong>
                <span className={`${styles.status} ${a.status === 'Concluído' ? styles.statusConcluido : a.status === 'Cancelado' ? styles.statusCancelado : styles.statusAberto}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum agendamento encontrado para este cliente com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
};

export default ClientHistory;