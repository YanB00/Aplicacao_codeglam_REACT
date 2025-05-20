import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope, FaArrowLeft, FaUserCircle } from 'react-icons/fa';
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
    const [imageError, setImageError] = useState(false);

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
                        throw new Error('Cliente não encontrado.');
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
                    foto: result.data.foto ? `http://localhost:3000/${result.data.foto.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150',
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

        if (id) {
            fetchClient();
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
                // CORRIGIDO: interpolação de string para URL
                navigate(`/cliente/editar/${client.idCliente}?userId=${currentUserId}`);
            } else {
                navigate(`/cliente/editar/${client.idCliente}`);
            }
        }
    };

    const formatCpf = (cpf) => {
        if (!cpf) return '';
        const cleanedCpf = cpf.replace(/\D/g, '');
        if (cleanedCpf.length === 11) {
            return cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
                {/* mainContent agora contém duas colunas para perfil e detalhes */}
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

                        {/* Mantenha as informações básicas aqui */}
                        <div className={styles.infoItem}><FaKey /> <span>ID: #{client.idCliente}</span></div>
                        <div className={styles.infoItem}><FaBirthdayCake /> <span>Nascimento: {client.dataNascimento}</span></div>
                        <div className={styles.infoItem}><FaIdCard /> <span>CPF: {client.cpf}</span></div>
                        <div className={styles.infoItem}><FaPhone /> <span>Telefone: {client.telefone}</span></div>
                        <div className={styles.infoItem}><FaEnvelope /> <span>Email: {client.email}</span></div>
                    </div>

                    <div className={styles.detailsCard}>
                        <h3>Informações do Cliente</h3> {/* Título ajustado */}
                        <p><strong>Favoritos:</strong> {client.favoritos}</p>
                        <p><strong>Problemas de saúde:</strong> {client.problemasSaude}</p>
                        <p><strong>Informações adicionais:</strong> {client.informacoesAdicionais}</p>

                        <button className={styles.button} onClick={handleEditClick}>
                            Atualizar
                        </button>
                    </div>
                </div>

                <div className={styles.historySection}>
                    <ClientHistory clientId={client.idCliente} />
                </div>
            </div>
        </div>
    );
}