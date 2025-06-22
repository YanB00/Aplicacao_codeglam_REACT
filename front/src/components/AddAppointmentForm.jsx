import React, { useState, useEffect, useCallback } from 'react';
import styles from './AddAppointmentForm.module.css';
import { AiOutlineClose } from 'react-icons/ai';

const BASE_URL = 'http://localhost:3000'; 

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

    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);

    const [salonOperatingHours, setSalonOperatingHours] = useState(null);
    const [isSalonClosedOnSelectedDate, setIsSalonClosedOnSelectedDate] = useState(false);
    const [dayNameForDisplay, setDayNameForDisplay] = useState('');


    const showMessage = useCallback((msg, type) => {
        setMessage(msg);
        setMessageType(type);
    }, []);

    const clearMessage = useCallback(() => {
        setMessage(null);
        setMessageType(null);
    }, []);


    const getDayKeyFromDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const dayNameFull = date.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();

        let dayKey = dayNameFull.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (dayKey.endsWith('-feira')) {
            dayKey = dayKey.replace('-feira', '');
        }
        return dayKey;
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            clearMessage();

            if (!salaoId) {
                console.warn("salaoId is missing in AddAppointmentForm. Cannot fetch data.");
                setServices([]);
                setClients([]);
                setEmployees([]);
                setIsLoading(false);
                return;
            }

            try {
                // 1. Fetch Salon Operating Hours
                const salonHoursRes = await fetch(`${BASE_URL}/register/${salaoId}`);
                if (!salonHoursRes.ok) {
                    const errorText = await salonHoursRes.text();
                    throw new Error(`Falha ao buscar horários do salão: ${salonHoursRes.statusText} - ${errorText}`);
                }
                const salonData = await salonHoursRes.json();
                if (salonData.errorStatus) {
                    throw new Error(salonData.mensageStatus || 'Erro ao buscar horários de funcionamento do salão');
                }
                setSalonOperatingHours(salonData.data.horariosFuncionamento);


                // 2. Fetch Services by salaoId
                const servicesRes = await fetch(`${BASE_URL}/servicos/salao/${salaoId}`);
                if (!servicesRes.ok) {
                    const errorText = await servicesRes.text();
                    throw new Error(`Falha ao buscar serviços: ${servicesRes.statusText} - ${errorText}`);
                }
                const servicesData = await servicesRes.json();
                const activeServices = (servicesData.data || []).filter(service => service.status === 'Ativo');
                setServices(activeServices);


                // 3. Fetch Clients by salaoId
                const clientsRes = await fetch(`${BASE_URL}/clientes/salao/${salaoId}`);
                if (!clientsRes.ok) {
                    const errorText = await clientsRes.text();
                    throw new Error(`Falha ao buscar clientes: ${clientsRes.statusText} - ${errorText}`);
                }
                const clientsData = await clientsRes.json();
                setClients(clientsData.data || []);

                // 4. Fetch Employees by salaoId
                const employeesRes = await fetch(`${BASE_URL}/funcionarios/salao/${salaoId}`);
                if (!employeesRes.ok) {
                    const errorText = await employeesRes.text();
                    throw new Error(`Falha ao buscar funcionários: ${employeesRes.statusText} - ${errorText}`);
                }
                const employeesData = await employeesRes.json();
                setEmployees(employeesData.data || []);

            } catch (err) {
                console.error("Erro ao buscar dados para os dropdowns e horários:", err);
                showMessage(`Erro ao carregar dados: ${err.message}. Verifique o console e a disponibilidade da API.`, 'error');
                setServices([]);
                setClients([]);
                setEmployees([]);
                setSalonOperatingHours(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (salaoId) {
            fetchData();
        } else {
            setIsLoading(false);
            setServices([]);
            setClients([]);
            setEmployees([]);
            setSalonOperatingHours(null);
        }

    }, [salaoId, showMessage, clearMessage]);

    useEffect(() => {
        if (salonOperatingHours && selectedDate) {
            const dayKey = getDayKeyFromDate(selectedDate);
            const fullDayName = new Date(selectedDate + 'T00:00:00').toLocaleString('pt-BR', { weekday: 'long' });
            setDayNameForDisplay(fullDayName);

            const currentDaySchedule = salonOperatingHours[dayKey];

            if (currentDaySchedule && currentDaySchedule.ativo) {
                setIsSalonClosedOnSelectedDate(false);
            } else {
                setIsSalonClosedOnSelectedDate(true);
            }
        } else {
            setIsSalonClosedOnSelectedDate(false);
            setDayNameForDisplay('');
        }
    }, [salonOperatingHours, selectedDate]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => {
            const newFormData = { ...prevFormData, [name]: value };

            if (name === 'service') {
                const selectedService = services.find(service => service._id === value);
                if (selectedService) {
                    newFormData.valor = selectedService.preco.toFixed(2);
                } else {
                    newFormData.valor = '';
                }
            }

            return newFormData;
        });
        clearMessage();
    };

    const handleSave = async () => {
        clearMessage();

        if (isSalonClosedOnSelectedDate) {
            showMessage(`O salão está fechado em ${dayNameForDisplay}. Não é possível agendar neste dia.`, 'error');
            return;
        }

        if (!selectedDate) {
            showMessage("Data do agendamento não selecionada.", 'error');
            return;
        }
        if (!salaoId) {
            showMessage("ID do Salão não fornecido. Não é possível salvar.", 'error');
            return;
        }
        if (!formData.timeStart || !formData.timeEnd || !formData.service || !formData.client || !formData.employee || formData.valor === '' || formData.valor === null) {
            showMessage("Por favor, preencha todos os campos obrigatórios: Hora Início, Hora Fim, Serviço, Cliente, Funcionário e Valor.", 'error');
            return;
        }

        const [startHour, startMinute] = formData.timeStart.split(':').map(Number);
        const [endHour, endMinute] = formData.timeEnd.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        if (endTotalMinutes <= startTotalMinutes) {
            showMessage("A 'Hora Fim' deve ser posterior à 'Hora Início'.", 'error');
            return;
        }

        const dayKey = getDayKeyFromDate(selectedDate);
        const currentDaySchedule = salonOperatingHours[dayKey];

        if (currentDaySchedule && currentDaySchedule.ativo) { 
            const salonOpenHour = parseInt(currentDaySchedule.abre.split(':')[0]);
            const salonOpenMinute = parseInt(currentDaySchedule.abre.split(':')[1]);
            const salonCloseHour = parseInt(currentDaySchedule.fecha.split(':')[0]);
            const salonCloseMinute = parseInt(currentDaySchedule.fecha.split(':')[1]);

            const salonOpenInMinutes = salonOpenHour * 60 + salonOpenMinute;
            const salonCloseInMinutes = salonCloseHour * 60 + salonCloseMinute;

            if (startTotalMinutes < salonOpenInMinutes || endTotalMinutes > salonCloseInMinutes) {
                showMessage(`O horário agendado (${formData.timeStart} - ${formData.timeEnd}) está fora do horário de funcionamento do salão para ${dayNameForDisplay} (${currentDaySchedule.abre} - ${currentDaySchedule.fecha}).`, 'error');
                return;
            }
        } else {
            showMessage(`O salão está fechado em ${dayNameForDisplay}. Não é possível agendar neste dia.`, 'error');
            return;
        }

        const appointmentData = {
            salaoId: salaoId,
            dataAgendamento: selectedDate,
            horaInicio: formData.timeStart,
            horaFim: formData.timeEnd,
            servicoId: formData.service,
            clienteId: formData.client,
            funcionarioId: formData.employee,
            valor: parseFloat(formData.valor) || 0,
            observacoes: formData.observacoes,
        };

        console.log("Data being sent to backend:", JSON.stringify(appointmentData, null, 2));

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
                let specificErrorMessage = `Erro HTTP ${response.status} ao salvar agendamento.`;

                try {
                    const parsedError = JSON.parse(errorText);
                    specificErrorMessage = parsedError.mensageStatus || specificErrorMessage;
                    console.error("Backend error details (parsed):", parsedError);
                } catch (e) {
                    console.error("Failed to parse backend error as JSON. Raw error text:", errorText);
                    specificErrorMessage = errorText || specificErrorMessage;
                }

                showMessage(specificErrorMessage, 'error');
                return;
            }

            const contentType = response.headers.get("content-type");
            let resultData;

            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await response.json();
                if (result.errorStatus) {
                    showMessage(result.mensageStatus || 'Erro retornado pelo backend ao salvar agendamento', 'error');
                    return;
                }
                showMessage(result.mensageStatus || 'Agendamento salvo com sucesso!', 'success');
                resultData = result.data;
            } else {
                const successText = await response.text();
                showMessage(successText || 'Operação concluída, mas resposta não foi JSON.', 'success');
            }

            if (onAppointmentSuccessfullySaved && resultData) {
                onAppointmentSuccessfullySaved(resultData);
            } else if (onAppointmentSuccessfullySaved) {
                onAppointmentSuccessfullySaved();
            }

        } catch (err) {
            console.error('Erro ao salvar agendamento (catch general):', err);
            showMessage(err.message || "Ocorreu um erro desconhecido ao salvar o agendamento.", 'error');
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
                {message && (
                    <div className={`${styles.customAlert} ${messageType === 'error' ? styles.error : styles.success}`}>
                        <span>{message}</span>
                        <button onClick={clearMessage} className={styles.closeAlertButton}>OK</button>
                    </div>
                )}

                {isSalonClosedOnSelectedDate ? (
                    <div className={styles.closedDayMessage}>
                        <p>O salão está fechado em {dayNameForDisplay}.</p>
                        <p>Não é possível criar agendamentos para este dia.</p>
                    </div>
                ) : (
                    <>
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
                            <input type="number" id="valor" name="valor" value={formData.valor} onChange={handleChange} placeholder="Ex: 50.00" step="0.01" required readOnly />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="observacoes">Observações:</label>
                            <textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} />
                        </div>
                        <div className={styles.actions}>
                            <button onClick={handleSave}>Salvar</button>
                            <button onClick={onClose}>Cancelar</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddAppointmentForm;