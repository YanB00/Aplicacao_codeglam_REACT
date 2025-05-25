// pages/ServiceListPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; 
import ServiceCard from '../components/ServiceCard';
import styles from './ServiceListPage.module.css';
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from "../components/Sidebar";

export default function ServiceListPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [userId, setUserId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);   
  const servicesPerPage = 10;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('userId');
    setUserId(id);
  }, [location.search]);

  const fetchServices = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return; 
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/servicos/${userId}`); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensageStatus || 'Failed to fetch services');
      }
      const result = await response.json();
      // Ordena os serviços por título após a busca
      const sortedServices = result.data.sort((a, b) => a.titulo.localeCompare(b.titulo));
      setServices(sortedServices);
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      setError(err.message || 'Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  }, [userId]); 

  useEffect(() => {
    fetchServices();
  }, [fetchServices]); 

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); 
  };

  const handleAddServiceClick = () => {
    if (userId) {
      navigate(`/add-servico?userId=${userId}`);
    } else {
      navigate('/add-servico'); 
    }
  };

  const filteredServices = services.filter(service =>
    service.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage); 

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
    <div className={styles.page}>
      <Sidebar userId={userId}/> {/* Passa o userId para a Sidebar */}
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h2 className={styles.topBarTitle}>Serviços</h2>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
        </div>

        {loading && <p>Carregando serviços...</p>}
        {error && <p className={styles.errorMessage}>Erro: {error}</p>}

        {!loading && !error && filteredServices.length === 0 && (
          <p>Nenhum serviço encontrado.</p>
        )}

        {!loading && !error && filteredServices.length > 0 && (
          <>
            <div className={styles.grid}>
              {currentServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
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

        <button className={styles.addButton} onClick={handleAddServiceClick}>
          <FaPlus /> Adicionar Serviço
        </button>
      </div>
    </div>
  );
}