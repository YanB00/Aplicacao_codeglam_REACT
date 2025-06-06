import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope, FaArrowLeft, FaUserCircle, FaTrashAlt } from 'react-icons/fa';
import ClientHistory from '../components/ClientHistory';
import styles from './EmployeePage.module.css';

export default function ClientPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [client, setClient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [salaoId, setSalaoId] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const fetchedUserId = params.get('userId');
        setCurrentUserId(fetchedUserId);
        console.log('ID do Usuário da URL na ClientPage:', fetchedUserId);

        const fetchClient = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setImageError(false);

                const response = await fetch(`http://localhost:3000/clientes/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Cliente não encontrado ou inativo.');
                    }
                    throw new Error(`Erro ao buscar cliente: ${response.statusText}`);
                }
                const result = await response.json();

                if (result.errorStatus) {
                    throw new Error(result.mensageStatus || 'Erro desconhecido ao buscar cliente.');
                }

                const formattedClient = {
                    ...result.data,
                    dataNascimento: result.data.dataNascimento ? new Date(result.data.dataNascimento).toLocaleDateString('pt-BR') : 'N/A',
                    cpf: result.data.cpf ? formatCpf(result.data.cpf) : 'N/A',
                    foto: result.data.foto ? `http://localhost:3000/${result.data.foto.replace(/\\\\/g, '/')}` : 'https://via.placeholder.com/150',
                    favoritos: Array.isArray(result.data.favoritos) ? result.data.favoritos.join(', ') : (result.data.favoritos || 'N/A'),
                    problemasSaude: result.data.problemasSaude || 'Nenhum',
                    informacoesAdicionais: result.data.informacoesAdicionais || 'Nenhum',
                    clienteDesde: result.data.dataCadastro ? new Date(result.data.dataCadastro).toLocaleDateString('pt-BR') : 'N/A',
                };

                setClient(formattedClient);

            } catch (err) {
                console.error('Erro ao buscar cliente:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSalaoId = async () => {
            if (!fetchedUserId) {
                console.warn('userId não fornecido, não é possível buscar salaoId.');
                return;
            }
            try {
                const response = await fetch(`http://localhost:3000/funcionarios/user-salao/${fetchedUserId}`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar salaoId: ${response.statusText}`);
                }
                const result = await response.json();
                setSalaoId(result.salaoId);
                console.log('SalaoId fetched:', result.salaoId);
            } catch (error) {
                console.error('Erro ao buscar salaoId:', error);
                setError(error.message);
            }
        };

        if (id) {
            fetchClient();
        }
        if (fetchedUserId) {
            fetchSalaoId();
        }
    }, [id, location.search]);

    const handleGoBack = () => {
        if (currentUserId) {
            navigate(`/clientes?userId=${currentUserId}`);
        } else {
            navigate('/clientes');
        }
    };

    const handleEditClick = () => {
        if (client && client.idCliente) {
            if (currentUserId) {
                navigate(`/cliente/editar/${client.idCliente}?userId=${currentUserId}`);
            } else {
                navigate(`/cliente/editar/${client.idCliente}`);
            }
        }
    };

    const handleOpenConfirmModal = () => {
        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    const handleConfirmDeactivation = async () => {
        handleCloseConfirmModal();

        if (!client || !client.idCliente) return;

        try {
            const response = await fetch(`http://localhost:3000/clientes/deactivate/${client.idCliente}`, {
                method: 'PUT',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensageStatus || `Erro HTTP! status: ${response.status}`);
            }

            if (currentUserId) {
                navigate(`/clientes?userId=${currentUserId}`);
            } else {
                navigate('/clientes');
            }
        } catch (e) {
            console.error('Erro ao desativar cliente:', e);
            setError(e.message);
        }
    };

    const formatCpf = (cpf) => {
        if (!cpf) return '';
        const cleanedCpf = cpf.replace(/\\D/g, '');
        if (cleanedCpf.length === 11) {
            return cleanedCpf.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
        }
        return cpf;
    };

    const handleImageError = () => {
        setImageError(true);
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.content}>
                    <div className={styles.topBar}></div>
                    <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h2>Carregando cliente...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.content}>
                    <div className={styles.topBar}></div>
                    <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h2>Erro: {error}</h2>
                        <button className={styles.backButton} onClick={handleGoBack} style={{ marginTop: '20px' }}>
                            <FaArrowLeft /> Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className={styles.page}>
                <div className={styles.content}>
                    <div className={styles.topBar}></div>
                    <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h2>Cliente não encontrado</h2>
                        <button className={styles.backButton} onClick={handleGoBack} style={{ marginTop: '20px' }}>
                            <FaArrowLeft /> Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <div className={styles.topBar}>
                    <button className={styles.backButton} onClick={handleGoBack} style={{ margin: '10px' }}>
                        <FaArrowLeft /> Voltar
                    </button>
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatarWrapper}>
                            {imageError ? (
                                <FaUserCircle size={150} color="#ccc" />
                            ) : (
                                <img
                                    src={client.foto}
                                    alt={client.nomeCompleto}
                                    onError={handleImageError}
                                />
                            )}
                            <h2>{client.nomeCompleto}</h2>
                            <div className={styles.underline} />
                            <p className={styles.since}> cliente desde {client.clienteDesde}</p>
                        </div>

                        <div className={styles.infoItem}><FaKey /> <span>ID: #{client.idCliente}</span></div>
                        <div className={styles.infoItem}><FaBirthdayCake /> <span>Nascimento: {client.dataNascimento}</span></div>
                        <div className={styles.infoItem}><FaIdCard /> <span>CPF: {client.cpf}</span></div>
                        <div className={styles.infoItem}><FaPhone /> <span>Telefone: {client.telefone}</span></div>
                        <div className={styles.infoItem}><FaEnvelope /> <span>Email: {client.email}</span></div>
                    </div>

                    <div className={styles.detailsCard}>
                        <h3>Informações do Cliente</h3>
                        <p><strong>Favoritos:</strong> {client.favoritos}</p>
                        <p><strong>Problemas de saúde:</strong> {client.problemasSaude}</p>
                        <p><strong>Informações adicionais:</strong> {client.informacoesAdicionais}</p>

                        <div className={styles.buttonContainer}>
                            <button className={styles.button} onClick={handleEditClick}>
                                Atualizar
                            </button>
                            <button className={`${styles.button} ${styles.deleteButton}`} onClick={handleOpenConfirmModal}>
                                <FaTrashAlt /> Apagar
                            </button>
                        </div>
                    </div>
                </div>

                    <div className={styles.historySection}>
                    {salaoId ? (
                        <ClientHistory clientId={client.idCliente} salaoId={salaoId} />
                    ) : (
                        <p>Carregando histórico (aguardando ID do salão)...</p>
                    )}
                </div>
            </div>

            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Confirmar Desativação</h3>
                        <p>Tem certeza que deseja desativar este cliente?</p>
                        <div className={styles.modalActions}>
                            <button className={`${styles.button} ${styles.modalCancelButton}`} onClick={handleCloseConfirmModal}>
                                Cancelar
                            </button>
                            <button className={`${styles.button} ${styles.modalConfirmButton}`} onClick={handleConfirmDeactivation}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}