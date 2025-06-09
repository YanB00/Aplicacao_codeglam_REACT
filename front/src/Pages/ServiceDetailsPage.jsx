import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ServiceDetailsPage.module.css'; 
import { FaArrowLeft, FaTrashAlt } from 'react-icons/fa';

export default function ServiceDetailsPage({ userId: propUserId }) { 
    const { id: servicoIdFromParams } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        console.log("ServiceDetailsPage: Effect triggered. servicoIdFromParams:", servicoIdFromParams);
        console.log("ServiceDetailsPage: Received propUserId:", propUserId); 

        const loadServiceDetails = async () => {
            if (!servicoIdFromParams) {
                console.error("ServiceDetailsPage: ID do serviço (servicoIdFromParams) não fornecido na URL.");
                setError('ID do serviço não fornecido.');
                setLoading(false);
                return;
            }

            if (!propUserId) {
                console.warn("ServiceDetailsPage: propUserId is missing. Some features (like ClientHistory) might not work.");
            }

            setLoading(true);
            setError(null);
            setService(null);

            try {
                console.log(`ServiceDetailsPage: Fetching service with ID: ${servicoIdFromParams}`);
                const response = await fetch(`http://localhost:3000/servicos/item/${servicoIdFromParams}`);
                console.log("ServiceDetailsPage: Fetch response status:", response.status, response.statusText);

                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                        console.error("ServiceDetailsPage: API error JSON response:", errorData);
                    } catch (parseError) {
                        const errorText = await response.text();
                        console.error("ServiceDetailsPage: API error text response (not JSON):", errorText);
                        errorData = { mensageStatus: `Erro HTTP: ${response.status} ${response.statusText}. Resposta não era JSON.` };
                    }
                    throw new Error(errorData.mensageStatus || `Falha ao carregar detalhes do serviço. Status: ${response.status}`);
                }

                const result = await response.json();
                console.log("ServiceDetailsPage: API success full result:", result);

                if (result.errorStatus) {
                    console.error("ServiceDetailsPage: API indica erro explícito:", result.mensageStatus);
                    throw new Error(result.mensageStatus || 'Erro retornado pela API.');
                }

                if (Array.isArray(result.data)) {
                    console.error("ServiceDetailsPage: Erro crítico! Esperava um objeto de serviço, mas a API retornou um array.", result.data);
                    if (result.mensageStatus === "SERVIÇOS DO SALÃO ENCONTRADOS") {
                        setError("Falha ao carregar dados: A API pode estar interpretando o ID do serviço como um ID de salão. Verifique a configuração das rotas no backend.");
                    } else if (result.data.length === 0) {
                        setError("Serviço não encontrado (API retornou uma lista vazia).");
                    } else {
                        setError("Formato de dados do serviço inesperado (recebido array). A API pode estar configurada incorretamente.");
                    }
                    setService(null);
                } else if (typeof result.data === 'object' && result.data !== null) {
                    console.log("ServiceDetailsPage: Service data received (object):", result.data);
                    setService(result.data);
                } else if (result.data === null && result.mensageStatus === 'Serviço não encontrado.') {
                    console.warn("ServiceDetailsPage: Serviço não encontrado (conforme API).");
                    setError(result.mensageStatus);
                    setService(null);
                } else {
                    console.error("ServiceDetailsPage: Dados do serviço em formato inesperado ou nulos:", result.data);
                    setError("Dados do serviço retornados pela API em formato inválido ou nulo.");
                    setService(null);
                }

            } catch (err) {
                console.error('ServiceDetailsPage: Exception during loadServiceDetails:', err);
                setError(err.message || 'Ocorreu um erro desconhecido ao buscar os detalhes do serviço.');
            } finally {
                setLoading(false);
                console.log("ServiceDetailsPage: Fetch process finished. Loading set to false.");
            }
        };

        loadServiceDetails();
    }, [servicoIdFromParams, propUserId]); 

    const handleGoBack = () => {
        navigate(propUserId ? `/servicos?userId=${propUserId}` : '/servicos');
    };

    const handleEditService = () => {
        const editPath = `/servicos/editar/${servicoIdFromParams}`;
        navigate(propUserId ? `${editPath}?userId=${propUserId}` : editPath);
    };

    const handleOpenConfirmModal = () => {
        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    const handleDeactivateService = async () => {
        handleCloseConfirmModal();

        if (!service || !service._id) {
            setError('ID do serviço não disponível para desativação.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/servicos/deactivate/${service._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.mensageStatus || `Erro ao desativar serviço. Status: ${response.status}`);
            }

            // Use propUserId for navigation
            navigate(propUserId ? `/servicos?userId=${propUserId}` : '/servicos');

        } catch (err) {
            console.error('Erro ao desativar serviço:', err);
            setError(err.message || 'Ocorreu um erro ao tentar desativar o serviço.');
        }
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') {
            const parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) {
                return 'R$ --,--';
            }
            value = parsedValue;
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return 'Data não disponível';
        try {
            return new Intl.DateTimeFormat('pt-BR').format(new Date(isoDate));
        } catch (e) {
            console.error("Error formatting date:", isoDate, e);
            return 'Data inválida';
        }
    };

    const formatDuration = (duration) => {
        let totalMinutes;

        if (typeof duration === 'string' && duration.includes(':')) {
            const parts = duration.split(':');
            const hours = parseInt(parts[0] || '0');
            const minutes = parseInt(parts[1] || '0');
            totalMinutes = hours * 60 + minutes;
        } else if (typeof duration === 'number') {
            totalMinutes = parseInt(duration);
        } else {
            return duration || 'Não informada';
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        let durationString = '';
        if (hours > 0) {
            durationString += `${hours} hora${hours > 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            if (hours > 0) {
                durationString += ' e ';
            }
            durationString += `${minutes} minuto${minutes > 1 ? 's' : ''}`;
        }

        if (durationString === '') {
            return '0 minutos';
        }

        return durationString;
    };

    return (
        <div className={styles.serviceDetailsPageContent}> 

            <div className={styles.topBar}>
                <button onClick={handleGoBack} className={styles.backButtonTop}>
                    <FaArrowLeft /> Voltar
                </button>
                <h1 className={styles.pageTitle}>Detalhes do Serviço</h1>
            </div>

            {loading && <div className={styles.loading}>Carregando detalhes do serviço...</div>}

            {!loading && error && (
                <div className={styles.errorContainer}>
                    <div className={styles.errorText}>
                        <strong>Erro:</strong> {error}
                    </div>
                    <button onClick={handleGoBack} className={styles.backButton}>
                        Voltar para Serviços
                    </button>
                </div>
            )}

            {!loading && !error && service && (
                <div className={styles.detailsContainer}>
                    <h2 className={styles.serviceTitleCard}>{service.titulo || 'Título não disponível'}</h2>
                    <p className={styles.id}>ID: {service._id || 'N/A'}</p>
                    <div className={styles.infoSection}>
                        <p>Preço: {service.preco !== undefined ? formatCurrency(service.preco) : 'R$ --,--'}</p>
                        <p>Comissão: {service.comissao !== undefined ? `${service.comissao}%` : '--%'}</p>
                        <p>Duração: {formatDuration(service.duracao)}</p>
                        <p>Status: {service.status || 'Não informado'}</p>
                        <p>Cadastrado em: {formatDate(service.dataCadastro || service.createdAt)}</p>
                    </div>
                    <div className={styles.descriptionSection}>
                        <h3 className={styles.descriptionHeader}>Descrição:</h3>
                        <p className={styles.descriptionText}>{service.descricao || 'Não informada'}</p>
                    </div>
                    <div className={styles.actionButtons}>
                        <button onClick={handleEditService} className={`${styles.button} ${styles.editButton}`}>Editar</button>
                        <button onClick={handleOpenConfirmModal} className={`${styles.button} ${styles.deleteButton}`}>
                            <FaTrashAlt /> Apagar
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && !service && (
                <div className={styles.notFoundContainer}>
                    <p>Serviço não encontrado ou dados indisponíveis.</p>
                    <button onClick={handleGoBack} className={styles.backButton}>
                        Voltar para Serviços
                    </button>
                </div>
            )}

            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Confirmar Desativação</h3>
                        <p>Tem certeza que deseja desativar o serviço "{service?.titulo}"?</p>
                        <div className={styles.modalActions}>
                            <button className={`${styles.button} ${styles.modalCancelButton}`} onClick={handleCloseConfirmModal}>
                                Cancelar
                            </button>
                            <button className={`${styles.button} ${styles.modalConfirmButton}`} onClick={handleDeactivateService}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}