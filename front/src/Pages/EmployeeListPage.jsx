import React, { useState, useEffect, useCallback } from 'react';
import EmployeeCard from '../components/EmployeeCard';
import styles from './EmployeeListPage.module.css'; 
import { FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; 

export default function EmployeeListPage({ userId }) { 
    const navigate = useNavigate();
    const location = useLocation(); 
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 6;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEmployeesAPI = useCallback(async () => {
        setLoading(true);
        setError(null);
        setEmployees([]);
        try {
            const response = await fetch(`http://localhost:3000/funcionarios/salao/${userId}`); 

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.mensageStatus) {
                        errorMessage = errorData.mensageStatus;
                    }
                } catch (parseError) {
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            if (data && data.data && Array.isArray(data.data)) {
                    const sortedEmployees = data.data.sort((a, b) =>
                    a.nomeCompleto.localeCompare(b.nomeCompleto)
                );
                setEmployees(sortedEmployees);
            } else {
                setEmployees([]);
            }
        } catch (e) {
            setError(e);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }, [userId]); 

    useEffect(() => {
        if (userId && userId !== 'null') {
            fetchEmployeesAPI();
        } else {
            setLoading(false);
            setEmployees([]);
            setError(new Error('Usuário não autenticado ou inválido. Não é possível carregar funcionários.'));
        }
    }, [userId, fetchEmployeesAPI]); 

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleAddEmployeeClick = () => {
        navigate(`/add-funcionario?userId=${userId || ''}`);
    };

    const filteredEmployees = employees.filter(
        (employee) =>
            employee.nomeCompleto.toLowerCase().includes(searchTerm) ||
            (employee.idFuncionario && employee.idFuncionario.toLowerCase().includes(searchTerm))
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

    let contentToRender;
    if (loading) {
        contentToRender = <div>Carregando funcionários...</div>;
    } else if (error) {
        contentToRender = <div>Erro ao carregar funcionários: {error.message}</div>;
    } else if (filteredEmployees.length === 0) {
        contentToRender = <div>Nenhum funcionário encontrado.</div>;
    } else {
        contentToRender = (
            <>
                <div className={styles.grid}>
                    {currentEmployees.map((employee) => (
                        <EmployeeCard key={employee.idFuncionario} employee={employee} userId={userId} />
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
                    <button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className={styles.paginationButton}>
                        <FaChevronRight />
                    </button>
                </div>
            </>
        );
    }

    return (
        <div className={styles.employeeListPageContent}> 
            <div className={styles.topBar}> 
                <h2 className={styles.topBarTitle}>Funcionários</h2>
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
            {contentToRender}
            <button className={styles.addButton} onClick={handleAddEmployeeClick}>
                <FaUserPlus /> Adicionar Funcionário
            </button>
        </div>
    );
}