import React, { useState, useEffect } from 'react';
import styles from './AddAppointmentForm.module.css';
import { AiOutlineClose } from 'react-icons/ai';

const AddAppointmentForm = ({ onClose, selectedDate, salaoId, onAppointmentSuccessfullySaved }) => {
  const [formData, setFormData] = useState({
    timeStart: '',
    timeEnd: '',
    service: '',
    client: '',
    employee: '',
    valor: '',
    observacoes: '',
  });

  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const BASE_URL = 'http://localhost:3000';

      try {
        if (salaoId) {
          const servicesRes = await fetch(`${BASE_URL}/servicos/${salaoId}`);
          if (!servicesRes.ok) {
            const errorData = await servicesRes.text();
            throw new Error(`Falha ao buscar serviços: ${servicesRes.statusText} - ${errorData}`);
          }
          const servicesData = await servicesRes.json();
          setServices(servicesData.data || []);
        } else {
          setError("ID do Salão não fornecido. Não é possível carregar serviços.");
          setServices([]);
        }

        const clientsRes = await fetch(`${BASE_URL}/clientes/listClientes`);
        if (!clientsRes.ok) {
          const errorData = await clientsRes.text();
          throw new Error(`Falha ao buscar clientes: ${clientsRes.statusText} - ${errorData}`);
        }
        const clientsData = await clientsRes.json();
        setClients(clientsData.data || []);

        const employeesRes = await fetch(`${BASE_URL}/funcionarios`);
        if (!employeesRes.ok) {
          const errorData = await employeesRes.text();
          throw new Error(`Falha ao buscar funcionários: ${employeesRes.statusText} - ${errorData}`);
        }
        const employeesData = await employeesRes.json();
        setEmployees(employeesData.data || []);

      } catch (err) {
        console.error("Erro ao buscar dados para os dropdowns:", err);
        setError(err.message);
        setServices([]);
        setClients([]);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [salaoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    // Validações básicas antes de enviar
    if (!selectedDate) {
      alert("Data do agendamento não selecionada.");
      return;
    }
    if (!salaoId) {
      alert("ID do Salão não fornecido. Não é possível salvar.");
      return;
    }
    if (!formData.timeStart || !formData.timeEnd || !formData.service || !formData.client || !formData.employee || !formData.valor) {
      alert("Por favor, preencha todos os campos obrigatórios: Hora Início, Hora Fim, Serviço, Cliente, Funcionário e Valor.");
      return;
    }

    const appointmentData = {
      salaoId: salaoId,
      horaInicio: formData.timeStart,
      horaFim: formData.timeEnd,
      servicoId: formData.service,
      clienteId: formData.client,
      funcionarioId: formData.employee,
      valor: parseFloat(formData.valor) || 0,
      observacoes: formData.observacoes,
      dataAgendamento: selectedDate, 
    };

    const BASE_URL = 'http://localhost:3000';
    try {
      const response = await fetch(`${BASE_URL}/agendamentos`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(appointmentData), 
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
          errorMessage = JSON.parse(errorText).mensageStatus || errorText;
        } catch (e) {
        }
        throw new Error(errorMessage || `Erro HTTP ${response.status} ao salvar agendamento`);
      }

      const contentType = response.headers.get("content-type");
      let resultData;

      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.errorStatus) {
          throw new Error(result.mensageStatus || 'Erro retornado pelo backend ao salvar agendamento');
        }
        alert(result.mensageStatus || 'Agendamento salvo com sucesso!');
        resultData = result.data; 
      } else {
        const successText = await response.text();
        alert(successText || 'Operação concluída, mas resposta não foi JSON.');
      }

      if (onAppointmentSuccessfullySaved && resultData) {
        onAppointmentSuccessfullySaved(resultData);
      } else if (onAppointmentSuccessfullySaved) {
        onAppointmentSuccessfullySaved();
      }

      onClose(); 
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      alert(`Erro ao salvar: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.addFormContainer}>
        <div className={styles.topBar}>
          <h3>Novo Agendamento</h3>
          <AiOutlineClose className={styles.closeIcon} onClick={onClose} />
        </div>
        <div className={styles.formContent}>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.addFormContainer}>
      <div className={styles.topBar}>
        <h3>Novo Agendamento</h3>
        <AiOutlineClose className={styles.closeIcon} onClick={onClose} />
      </div>
      <div className={styles.formContent}>
        {error && (
          <p style={{ color: 'red', whiteSpace: 'pre-wrap' }}>Erro ao carregar dados: {error}. Verifique o console e a disponibilidade da API.</p>
        )}
        <div className={styles.inputGroup}>
          <label htmlFor="timeStart">Hora Início:</label>
          <input type="time" id="timeStart" name="timeStart" value={formData.timeStart} onChange={handleChange} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="timeEnd">Hora Fim:</label>
          <input type="time" id="timeEnd" name="timeEnd" value={formData.timeEnd} onChange={handleChange} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="service">Serviço:</label>
          <select id="service" name="service" value={formData.service} onChange={handleChange} required>
            <option value="">Selecione um serviço</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.titulo}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="client">Cliente:</label>
          <select id="client" name="client" value={formData.client} onChange={handleChange} required>
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.nomeCompleto}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="employee">Funcionário:</label>
          <select id="employee" name="employee" value={formData.employee} onChange={handleChange} required>
            <option value="">Selecione um funcionário</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.nomeCompleto}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="valor">Valor:</label>
          <input type="number" id="valor" name="valor" value={formData.valor} onChange={handleChange} placeholder="Ex: 50.00" step="0.01" required />
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

export default AddAppointmentForm;
