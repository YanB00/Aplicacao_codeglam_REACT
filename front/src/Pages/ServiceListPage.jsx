// pages/ServiceListPage.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ServiceCard from '../components/ServiceCard';
import styles from './ServiceListPage.module.css';
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Substituir pela API
const initialServicesData = [
  { _id: '1', titulo: 'Corte de Cabelo Simples', preco: 50.00, comissao: 10, duracao: '30 min', descricao: 'Corte reto ou repicado.', status: 'A' },
  { _id: '2', titulo: 'Manicure', preco: 35.00, comissao: 15, duracao: '45 min', descricao: 'Cuidado e esmaltação das unhas.', status: 'B' },
  { _id: '3', titulo: 'Pedicure', preco: 40.00, comissao: 15, duracao: '60 min', descricao: 'Cuidado e esmaltação dos pés.', status: 'C' },
  { _id: '4', titulo: 'Unhas em Gel', preco: 120.00, comissao: 20, duracao: '2 horas', descricao: 'Aplicação de unhas de gel.', status: 'A' },
  { _id: '5', titulo: 'Sobrancelha', preco: 25.00, comissao: 10, duracao: '20 min', descricao: 'Design de sobrancelha.', status: 'A' },
  { _id: '6', titulo: 'Depilação', preco: 60.00, comissao: 15, duracao: '1 hora', descricao: 'Depilação com cera.', status: 'A' },
  { _id: '7', titulo: 'Penteado', preco: 80.00, comissao: 20, duracao: '1h30', descricao: 'Penteados para eventos.', status: 'A' },
  { _id: '8', titulo: 'Maquiagem', preco: 90.00, comissao: 20, duracao: '1h', descricao: 'Maquiagem profissional.', status: 'A' },
  { _id: '9', titulo: 'Luzes', preco: 200.00, comissao: 30, duracao: '3h', descricao: 'Luzes no cabelo.', status: 'A' },
  { _id: '10', titulo: 'Progressiva', preco: 250.00, comissao: 30, duracao: '3h', descricao: 'Alisamento capilar.', status: 'A' },
  { _id: '11', titulo: 'Hidratação', preco: 70.00, comissao: 15, duracao: '1h', descricao: 'Hidratação profunda.', status: 'A' },
  { _id: '12', titulo: 'Botox Capilar', preco: 150.00, comissao: 25, duracao: '2h', descricao: 'Tratamento capilar.', status: 'A' },
  { _id: '13', titulo: 'Escova Simples', preco: 45.00, comissao: 10, duracao: '40 min', descricao: 'Escova modeladora simples.', status: 'A' },
  { _id: '14', titulo: 'Coloração', preco: 180.00, comissao: 25, duracao: '2h30', descricao: 'Coloração capilar completa.', status: 'A' },
  { _id: '15', titulo: 'Reflexo', preco: 190.00, comissao: 30, duracao: '2h30', descricao: 'Técnica de mechas mais sutis.', status: 'A' },
  { _id: '16', titulo: 'Peeling Facial', preco: 150.00, comissao: 20, duracao: '1h', descricao: 'Tratamento para renovação da pele.', status: 'A' },
  { _id: '17', titulo: 'Limpeza de Pele', preco: 130.00, comissao: 20, duracao: '1h30', descricao: 'Limpeza profunda com extração.', status: 'A' },
  { _id: '18', titulo: 'Design de Barba', preco: 30.00, comissao: 10, duracao: '30 min', descricao: 'Barbearia com acabamento detalhado.', status: 'A' },
  { _id: '19', titulo: 'Massagem Relaxante', preco: 100.00, comissao: 25, duracao: '1h', descricao: 'Massagem terapêutica relaxante.', status: 'A' },
  { _id: '20', titulo: 'Banho de Lua', preco: 85.00, comissao: 15, duracao: '1h', descricao: 'Clareamento dos pelos do corpo.', status: 'C' },
];



export default function ServiceListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 10;

  useEffect(() => {
    // Simulação de busca na API e ordenação inicial
    const filteredAndSortedServices = initialServicesData
      .filter(service =>
        service.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.titulo.localeCompare(b.titulo));
    setServices(filteredAndSortedServices);
  }, [searchTerm]); // Refazer a filtragem e ordenação ao mudar o termo de busca

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetar a página ao pesquisar
  };

  const handleAddServiceClick = () => {
    navigate('/add-servico');
  };

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(services.length / servicesPerPage);

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
      <Sidebar />
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
        <button className={styles.addButton} onClick={handleAddServiceClick}>
          <FaPlus /> Adicionar Serviço
        </button>
      </div>
    </div>
  );
}