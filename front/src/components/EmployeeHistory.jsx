import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './EmployeeHistory.module.css';

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

const EmployeeHistory = ({ employeeId, salaoId }) => {
  const [serviceFilter, setServiceFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableServices, setAvailableServices] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true );
  const [filterError, setFilterError] = useState(null);

  console.log('EmployeeHistory: employeeId received:', employeeId);
  console.log('EmployeeHistory: salaoId received:', salaoId); 
  
  useEffect(() => {
    const fetchEmployeeAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/agendamentos/funcionario/${employeeId}`); 
        
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
          value: agendamento.valor ? `R$ ${parseFloat(agendamento.valor).toFixed(2)}` : 'R$ 0,00',
          payment: agendamento.valor ? `R$ ${parseFloat(agendamento.valor).toFixed(2)}` : 'R$ 0,00', 
          status: agendamento.concluido ? 'Concluído' : (agendamento.cancelado ? 'Cancelado' : 'Em aberto'),
          notes: agendamento.observacoes || 'Sem observações.'
        }));
        setAppointments(formattedAppointments);
        console.log("--> Todos os Agendamentos formatados recebidos do Backend:", formattedAppointments); 
        console.log("--> employeeId (da prop):", employeeId);
      } catch (e) {
        console.error("Error fetching appointments:", e);
        setError(`Erro ao carregar agendamentos: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployeeAppointments();
    } else {
        setLoading(false);
        setError("Employee ID not provided.");
    }
  }, [employeeId]);

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
        console.log('Fetched services:', servicesResult.data); 
        
        if (servicesResult.errorStatus) {
            throw new Error(servicesResult.mensageStatus || 'Failed to fetch services');
        }
        setAvailableServices(servicesResult.data);

        // --- CLIENTES ---
        console.log('Fetching clients from:', 'http://localhost:3000/clientes/listClientes'); 
        const clientsResponse = await fetch('http://localhost:3000/clientes/listClientes');
        
        if (!clientsResponse.ok) {
          throw new Error(`HTTP error! status: ${clientsResponse.status} for clients`);
        }
        const clientsResult = await clientsResponse.json();
        console.log('Fetched clients:', clientsResult.data); 
        
        if (clientsResult.errorStatus) {
            throw new Error(clientsResult.mensageStatus || 'Failed to fetch clients');
        }
        setAvailableClients(clientsResult.data);

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
        console.warn('SalaoId is missing, cannot fetch services.');
        setLoadingFilters(false);
        setFilterError('ID do salão não fornecido para carregar serviços.'); 
    }
  }, [salaoId]);

  const handleDateChange = (selectedDate) => {
    setDateFilter(selectedDate);
    setShowCalendar(false);
  };

  const handleTodayClick = () => {
    setDateFilter(new Date()); 
    setShowCalendar(false);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesService = serviceFilter === '' || appointment.serviceId === serviceFilter;
    const matchesClient = clientFilter === '' || appointment.clientId === clientFilter;

    const apptDateBrasiliaString = getBrasiliaDateString(appointment.date);
    
  const filterDateBrasiliaString = getBrasiliaDateString(dateFilter);

    const matchesDate = apptDateBrasiliaString === filterDateBrasiliaString;
      
    return matchesService && matchesClient && matchesDate;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Histórico de atendimentos da funcionária</h2>
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

          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="">Cliente</option>
            {availableClients && availableClients.length > 0 ? (
              availableClients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.nomeCompleto}
                </option>
              ))
            ) : (
              <option disabled>Carregando clientes...</option>
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
              <div><strong>ID do atendimento:</strong> {a.id}</div>
              <div><strong>Serviço:</strong> {a.service}</div>
              <div><strong>Data:</strong> {a.date.toLocaleDateString('pt-BR')} | <strong>Hora:</strong> {a.time}</div>
              <div><strong>Cliente:</strong> {a.client}</div>
              <div><strong>Pagamento:</strong> {a.payment || 'N/A'}</div>
              <div><strong>Valor:</strong> {a.value} | <strong>Status:</strong>
                <span className={`${styles.status} ${a.status === 'Concluído' ? styles.statusConcluido : a.status === 'Cancelado' ? styles.statusCancelado : styles.statusAberto}`}>
                  {a.status}
                </span>
              </div> 
            </div>
          ))
        ) : (
          <p>Nenhum agendamento encontrado para este funcionário com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeHistory;