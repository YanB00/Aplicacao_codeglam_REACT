import React, { useState, useEffect } from 'react';
import styles from './EditAppointmentForm.module.css'; 
import { AiOutlineClose } from 'react-icons/ai';

const BASE_URL = 'http://localhost:3000';

const EditAppointmentForm = ({ event, onClose, onSave, salaoId }) => { 
    const [formData, setFormData] = useState({ ...event });
    const [services, setServices] = useState([]); 
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
    const [fetchError, setFetchError] = useState(null); 

    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            setIsLoadingDropdowns(true);
            setFetchError(null); // Limpa erros anteriores
            try {
                if (!salaoId) {
                    setFetchError("ID do Salão não fornecido. Não é possível carregar os dados para edição.");
                    setIsLoadingDropdowns(false);
                    return;
                }

                // Fetch Services (ativos)
                const servicesRes = await fetch(`${BASE_URL}/servicos/salao/${salaoId}`);
                if (!servicesRes.ok) throw new Error(`Falha ao buscar serviços: ${servicesRes.status}`);
                const servicesData = await servicesRes.json();
                setServices((servicesData.data || []).filter(s => s.status === 'Ativo'));

                // Fetch Clients
                const clientsRes = await fetch(`${BASE_URL}/clientes/salao/${salaoId}`);
                if (!clientsRes.ok) throw new Error(`Falha ao buscar clientes: ${clientsRes.status}`);
                const clientsData = await clientsRes.json();
                setClients(clientsData.data || []);

                // Fetch Employees
                const employeesRes = await fetch(`${BASE_URL}/funcionarios/salao/${salaoId}`);
                if (!employeesRes.ok) throw new Error(`Falha ao buscar funcionários: ${employeesRes.status}`);
                const employeesData = await employeesRes.json();
                setEmployees(employeesData.data || []);

            } catch (err) {
                console.error("Erro ao carregar dados para dropdowns de edição:", err);
                setFetchError(`Erro ao carregar opções para edição: ${err.message}`);
            } finally {
                setIsLoadingDropdowns(false);
            }
        };

        fetchDataForDropdowns();
    }, [salaoId]); 

    useEffect(() => {
        const initialServiceId = event.servicoId?._id || event.servicoId;
        const initialClientId = event.clienteId?._id || event.clienteId;
        const initialEmployeeId = event.funcionarioId?._id || event.funcionarioId;


        setFormData({
            ...event,
            service: initialServiceId,
            client: initialClientId,
            employee: initialEmployeeId,
            valor: parseFloat(event.valor) || 0 
        });
    }, [event]); 

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSave = () => {
        const dataToSave = {
            ...formData,
            servicoId: formData.service, 
            clienteId: formData.client, 
            funcionarioId: formData.employee, 
            valor: parseFloat(formData.valor) || 0, 
            service: undefined,
            client: undefined,
            employee: undefined
        };
        onSave(dataToSave); 
        onClose();
    };

    if (isLoadingDropdowns) {
        return (
            <div className={styles.editFormContainer}>
                <div className={styles.topBar}>
                    <h3>Editar Agendamento</h3>
                    <AiOutlineClose className={styles.closeIcon} onClick={onClose} />
                </div>
                <div className={styles.formContent}>
                    <p>Carregando dados para edição...</p>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className={styles.editFormContainer}>
                <div className={styles.topBar}>
                    <h3>Erro na Edição</h3>
                    <AiOutlineClose className={styles.closeIcon} onClick={onClose} />
                </div>
                <div className={styles.formContent} style={{ color: 'red' }}>
                    <p>{fetchError}</p>
                    <button onClick={onClose}>Fechar</button>
                </div>
            </div>
        );
    }


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
                    <select id="service" name="service" value={formData.service} onChange={handleChange}>
                        <option value="">Selecione um serviço</option>
                        {services.map((s) => (
                            <option key={s._id} value={s._id}>
                                {s.titulo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="client">Cliente:</label>
                    <select id="client" name="client" value={formData.client} onChange={handleChange}>
                        <option value="">Selecione um cliente</option>
                        {clients.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.nomeCompleto}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="employee">Funcionário:</label>
                    <select id="employee" name="employee" value={formData.employee} onChange={handleChange}>
                        <option value="">Selecione um funcionário</option>
                        {employees.map((e) => (
                            <option key={e._id} value={e._id}>
                                {e.nomeCompleto}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="valor">Valor:</label>
                    <input type="number" id="valor" name="valor" value={formData.valor} onChange={handleChange} />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="observacoes">Observações:</label>
                    <textarea id="observacoes" name="observacoes" value={formData.observacoes || ''} onChange={handleChange} />
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