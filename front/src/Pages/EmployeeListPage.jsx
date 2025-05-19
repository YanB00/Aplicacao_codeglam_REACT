import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EmployeeCard from '../components/EmployeeCard';
import styles from './EmployeeListPage.module.css'; // Mantenha este nome de arquivo se já estiver usando
import { FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const initialEmployeesData = [
  { id: '12346', name: 'Ana', img: 'https://randomuser.me/api/portraits/women/45.jpg', birthDate: '1990-04-10', since: 'junho 2018', service: ['Alongamento em fibra', 'Design de sobrancelhas'] },
  { id: 'EMP124', name: 'Bruno', img: 'https://randomuser.me/api/portraits/men/32.jpg', birthDate: '1988-11-22', since: 'agosto 2020', service: ['Manicure', 'Pedicure'] },
  { id: 'EMP125', name: 'Carla', img: 'https://randomuser.me/api/portraits/women/29.jpg', birthDate: '1995-07-05', since: 'janeiro 2022', service: ['Massagem relaxante', 'Drenagem linfática'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  { id: 'EMP126', name: 'Daniel', img: 'https://randomuser.me/api/portraits/men/51.jpg', birthDate: '1985-03-15', since: 'setembro 2019', service: ['Corte de cabelo', 'Barba'] },
  

  
];

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  useEffect(() => {
    const sortedEmployees = [...initialEmployeesData].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setEmployees(sortedEmployees);
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
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.id.toLowerCase().includes(searchTerm)
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

  return (
    <div className={styles.page}>
      <Sidebar />
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
            <EmployeeCard key={employee.id} employee={employee} />
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