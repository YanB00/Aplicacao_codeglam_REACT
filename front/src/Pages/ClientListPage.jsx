import React, { useState, useEffect, useCallback } from 'react';
import ClientCard from '../components/ClientCard';
import styles from './EmployeeListPage.module.css'; 
import { FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; 

export default function ClientListPage({ userId }) { 
    const navigate = useNavigate();
    const location = useLocation(); 
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const clientsPerPage = 10;

    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        setClients([]); 
        try {
        
            const response = await fetch(`http://localhost:3000/clientes/salao/${userId}`); 

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensageStatus || 'Failed to fetch clients');
            }
            const result = await response.json();
            if (result.data) {
                const sortedClients = result.data.sort((a, b) =>
                    a.nomeCompleto.localeCompare(b.nomeCompleto)
                );
                setClients(sortedClients);
            } else {
                setClients([]);
            }
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError(err.message || 'Erro ao carregar clientes.');
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, [userId]); 

    useEffect(() => {
    if (userId && userId !== 'null') { 
            fetchClients();
        } else {
            setLoading(false);
            setClients([]);
            setError('ID de usuário não fornecido. Não é possível carregar clientes.');
        }
    }, [userId, fetchClients]);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleAddClientClick = () => {
        if (userId) { 
            navigate(`/add-cliente?userId=${userId}`);
        } else {
            navigate('/add-cliente'); 
        }
    };

    const filteredClients = clients.filter(
        (client) =>
            client.nomeCompleto.toLowerCase().includes(searchTerm) ||
            (client._id && client._id.toLowerCase().includes(searchTerm)) 
    );

    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
 
        <div className={styles.clientListPageContent}> 
            <div className={styles.topBar}> 
                <h2 className={styles.topBarTitle}>Clientes</h2>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {loading && <p>Carregando clientes...</p>}
            {!loading && error && <p>Erro: {error}</p>} 
            {!loading && !error && filteredClients.length === 0 && (
                <p>Nenhum cliente encontrado.</p>
            )}

            {!loading && !error && filteredClients.length > 0 && (
                <>
                    <div className={styles.grid}>
                        {currentClients.map((client) => (
                            <ClientCard
                                key={client._id}
                                client={{
                                    id: client._id,
                                    name: client.nomeCompleto,
                                    img: client.foto ? `http://localhost:3000/${client.foto.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150',
                                    birthDate: client.dataNascimento ? new Date(client.dataNascimento).toLocaleDateString('pt-BR') : 'N/A',
                                    since: client.dataCadastro ? new Date(client.dataCadastro).toLocaleDateString('pt-BR') : 'N/A',
                                    favorites: client.favoritos || [],
                                }}
                                userId={userId} 
                            />
                        ))}
                    </div>
                    <div className={styles.pagination}>
                        <button onClick={prevPage} disabled={currentPage === 1} className={styles.paginationButton}>
                            <FaChevronLeft />
                        </button>
                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`${styles.paginationButton} ${currentPage === number ? styles.active : ''}`}
                            >
                                {number}
                            </button>
                        ))}
                        <button onClick={nextPage} disabled={currentPage === totalPages} className={styles.paginationButton}>
                            <FaChevronRight />
                        </button>
                    </div>
                </>
            )}

            <button className={styles.addButton} onClick={handleAddClientClick}>
                <FaUserPlus /> Adicionar Cliente
            </button>
        </div>
    );
}