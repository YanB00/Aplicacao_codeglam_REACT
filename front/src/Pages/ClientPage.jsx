import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope, FaArrowLeft, FaUserCircle, FaTrashAlt } from 'react-icons/fa';
import ClientHistory from '../components/ClientHistory';
import styles from './EmployeePage.module.css';

export default function ClientPage({ userId: propUserId }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [client, setClient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [salaoId, setSalaoId] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

useEffect(() => {
        if (propUserId && propUserId !== currentUserId) {
            setCurrentUserId(propUserId);
        }
        console.log('ClientPage received propUserId:', propUserId);
        if (!propUserId) {
            console.warn("ClientPage: userId prop is missing. Ensure it's passed from MainLayout.");
        }
    }, [propUserId]);

    useEffect(() => {
        const fetchClientAndSalaoId = async () => {
            setIsLoading(true);
            setError(null);
            setImageError(false);

            // Fetch client data
            if (id) {
                try {
                    const response = await fetch(`http://localhost:3000/clientes/${id}`);
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({})); // Catch JSON parse error
                        if (response.status === 404) {
                            throw new Error('Cliente não encontrado ou inativo.');
                        }
                        throw new Error(`Erro ao buscar cliente: ${response.status}, ${errorData.mensageStatus || response.statusText}`);
                    }
                    const result = await response.json();

                    if (result.errorStatus) {
                        throw new Error(result.mensageStatus || 'Erro desconhecido ao buscar cliente.');
                    }

                    const data = result.data;
                    setClient({
                        ...data,
                        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toLocaleDateString('pt-BR') : 'N/A',
                        cpf: data.cpf ? formatCpf(data.cpf) : 'N/A',
                        // Ensure foto path is correctly formed for display
                        foto: data.foto ? `http://localhost:3000/${data.foto.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150',
                        favoritos: Array.isArray(data.favoritos) ? data.favoritos.join(', ') : (data.favoritos || 'N/A'),
                        problemasSaude: data.problemasSaude || 'Nenhum',
                        informacoesAdicionais: data.informacoesAdicionais || 'Nenhum',
                        clienteDesde: data.dataCadastro ? new Date(data.dataCadastro).toLocaleDateString('pt-BR') : 'N/A',
                    });

                } catch (err) {
                    console.error('Erro ao buscar cliente:', err);
                    setError(err.message);
                    setIsLoading(false); // Set loading to false on error
                    return; // Exit if client data fetch fails
                }
            }

            // Fetch salaoId (only if userId is available and client data fetched successfully)
            if (propUserId) { // Use the propUserId here
                try {
                    // Assuming your backend /funcionarios/user-salao/:userId is correct
                    const responseSalao = await fetch(`http://localhost:3000/funcionarios/user-salao/${propUserId}`);
                    if (!responseSalao.ok) {
                        throw new Error(`Erro ao buscar salaoId: ${responseSalao.statusText}`);
                    }
                    const resultSalao = await responseSalao.json();
                    setSalaoId(resultSalao.salaoId);
                    console.log('SalaoId fetched:', resultSalao.salaoId);
                } catch (errorSalao) {
                    console.error('Erro ao buscar salaoId:', errorSalao);
                    setError(errorSalao.message);
                }
            } else {
                console.warn('propUserId não fornecido, não é possível buscar salaoId para ClientHistory.');
            }

            setIsLoading(false); // Set loading to false after all fetches attempt to complete
        };

        if (id) { // Only fetch if client ID is available
            fetchClientAndSalaoId();
        }
    }, [id, propUserId]);

    const handleGoBack = () => {
        if (propUserId) {
            navigate(`/clientes?userId=${propUserId}`);
        } else {
            navigate('/clientes');
        }
    };

    const handleEditClick = () => {
        if (client && client.idCliente) {
            if (propUserId) {
                navigate(`/cliente/editar/${client.idCliente}?userId=${propUserId}`);
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
                    {propUserId ? (
                        <ClientHistory clientId={client.idCliente} salaoId={propUserId} />
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