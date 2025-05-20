// pages/EmployeeListPage.jsx
import React, { useState, useEffect } from 'react';
import EmployeeCard from '../components/EmployeeCard';
import styles from './EmployeeListPage.module.css';
import { FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 6; // Ajustei para combinar com a imagem
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3000/funcionarios'); // Use a URL do seu backend
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const sortedEmployees = data.data.sort((a, b) =>
          a.nomeCompleto.localeCompare(b.nomeCompleto)
        );
        setEmployees(sortedEmployees);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleAddEmployeeClick = () => {
    navigate('/add-funcionario');
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.nomeCompleto.toLowerCase().includes(searchTerm) ||
      employee.idFuncionario.toLowerCase().includes(searchTerm)
  );

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

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

  if (loading) {
    return <div>Carregando funcionários...</div>;
  }

  if (error) {
    return <div>Erro ao carregar funcionários: {error.message}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h2 className={styles.topBarTitle}>Funcionários</h2>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por nome ou ID..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />

          </div>
        </div>
        <div className={styles.grid}>
          {currentEmployees.map((employee) => (
            <EmployeeCard key={employee.idFuncionario} employee={employee} />
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
        <button className={styles.addButton} onClick={handleAddEmployeeClick}>
          <FaUserPlus /> Adicionar Funcionário
        </button>
      </div>
    </div>
  );
}