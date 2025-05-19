import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientCard from '../components/ClientCard';
import styles from './EmployeeListPage.module.css';
import { FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ClientListPage() {
  const navigate = useNavigate();
  const clientsData = [
    { id: '12345', name: 'Ana', img: 'https://randomuser.me/api/portraits/women/45.jpg', birthDate: '1990-04-10', since: 'junho 2018', favorites: ['Alongamento em fibra', 'Design de sobrancelhas'] },
    { id: 'EMP124', name: 'Ana Clara', img: 'https://randomuser.me/api/portraits/women/22.jpg', birthDate: '1993-09-21', since: 'março 2020', favorites: ['Cílios Egípcio', 'Pedicure'] },
    { id: 'EMP125', name: 'Beatriz', img: 'https://randomuser.me/api/portraits/women/30.jpg', birthDate: '1988-11-05', since: 'agosto 2021', favorites: ['Manicure', 'Depilação'] },
    { id: 'EMP126', name: 'Carlos', img: 'https://randomuser.me/api/portraits/men/15.jpg', birthDate: '1995-07-18', since: 'janeiro 2023', favorites: ['Corte de cabelo'] },
    { id: 'EMP127', name: 'Daniela', img: 'https://randomuser.me/api/portraits/women/55.jpg', birthDate: '1992-03-25', since: 'setembro 2019', favorites: ['Massagem relaxante'] },
    { id: 'EMP128', name: 'Eduardo', img: 'https://randomuser.me/api/portraits/men/40.jpg', birthDate: '1987-06-12', since: 'abril 2022', favorites: ['Barba'] },
    { id: 'EMP129', name: 'Fernanda', img: 'https://randomuser.me/api/portraits/women/10.jpg', birthDate: '1991-12-01', since: 'maio 2020', favorites: ['Penteado', 'Maquiagem'] },
    { id: 'EMP130', name: 'Gabriel', img: 'https://randomuser.me/api/portraits/men/28.jpg', birthDate: '1994-09-30', since: 'fevereiro 2024', favorites: ['Limpeza de pele'] },
    { id: 'EMP131', name: 'Helena', img: 'https://randomuser.me/api/portraits/women/60.jpg', birthDate: '1989-08-08', since: 'outubro 2018', favorites: ['Sobrancelhas de henna'] },
    { id: 'EMP132', name: 'Ígor', img: 'https://randomuser.me/api/portraits/men/50.jpg', birthDate: '1996-01-20', since: 'julho 2023', favorites: ['Coloração'] },
    { id: 'EMP133', name: 'Juliana', img: 'https://randomuser.me/api/portraits/women/35.jpg', birthDate: '1993-05-15', since: 'novembro 2019', favorites: ['Unhas de gel'] },
    { id: 'EMP134', name: 'Lucas', img: 'https://randomuser.me/api/portraits/men/33.jpg', birthDate: '1986-10-22', since: 'março 2021', favorites: ['Tratamento capilar'] },
    { id: 'EMP135', name: 'Mariana', img: 'https://randomuser.me/api/portraits/women/48.jpg', birthDate: '1997-02-14', since: 'dezembro 2022', favorites: ['Extensão de cílios'] },
    { id: 'CLI789', name: 'Isabela', img: 'https://randomuser.me/api/portraits/women/15.jpg', birthDate: '1998-07-29', since: 'abril 2023', favorites: ['Manicure', 'Pedicure'] },
{ id: 'CLI901', name: 'João', img: 'https://randomuser.me/api/portraits/men/62.jpg', birthDate: '1985-03-12', since: 'setembro 2022', favorites: ['Corte de cabelo', 'Barba'] },
{ id: 'CLI234', name: 'Larissa', img: 'https://randomuser.me/api/portraits/women/7.jpg', birthDate: '2000-11-01', since: 'janeiro 2024', favorites: ['Design de sobrancelhas', 'Depilação'] },
{ id: 'CLI567', name: 'Mateus', img: 'https://randomuser.me/api/portraits/men/91.jpg', birthDate: '1992-06-05', since: 'maio 2021', favorites: ['Limpeza de pele'] },
{ id: 'CLI890', name: 'Natália', img: 'https://randomuser.me/api/portraits/women/38.jpg', birthDate: '1989-09-18', since: 'agosto 2020', favorites: ['Alongamento de cílios', 'Maquiagem'] },
{ id: 'CLI123', name: 'Otávio', img: 'https://randomuser.me/api/portraits/men/78.jpg', birthDate: '1996-02-22', since: 'outubro 2023', favorites: ['Coloração', 'Tratamento capilar'] },
{ id: 'CLI456', name: 'Patrícia', img: 'https://randomuser.me/api/portraits/women/29.jpg', birthDate: '1994-12-10', since: 'julho 2019', favorites: ['Unhas de gel', 'Massagem relaxante'] },
{ id: 'CLI678', name: 'Ricardo', img: 'https://randomuser.me/api/portraits/men/5.jpg', birthDate: '1987-04-01', since: 'novembro 2021', favorites: ['Barboterapia'] },
{ id: 'CLI902', name: 'Sofia', img: 'https://randomuser.me/api/portraits/women/51.jpg', birthDate: '2001-08-15', since: 'março 2024', favorites: ['Penteados', 'Sobrancelhas de henna'] },
{ id: 'CLI345', name: 'Vinícius', img: 'https://randomuser.me/api/portraits/men/43.jpg', birthDate: '1990-10-07', since: 'junho 2022', favorites: ['Manutenção de barba'] },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]); // Estado para os clientes ordenados
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  useEffect(() => {
    // Ordenar os clientes por nome ao montar o componente
    const sortedClients = [...clientsData].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setClients(sortedClients);
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1); // Resetar a página ao pesquisar
  };

  const handleAddClientClick = () => {
    navigate('/add-cliente');
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.id.toLowerCase().includes(searchTerm)
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
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h2 className={styles.topBarTitle}>Clientes</h2>
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
          {currentClients.map((client) => (
            <ClientCard key={client.id} client={client} />
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
        <button className={styles.addButton} onClick={handleAddClientClick}>
          <FaUserPlus /> Adicionar Cliente
        </button>
      </div>
    </div>
  );
}