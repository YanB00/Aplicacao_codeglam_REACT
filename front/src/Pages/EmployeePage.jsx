import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import EmployeeHistory from '../components/EmployeeHistory';
import styles from './EmployeePage.module.css';

export default function EmployeePage() {
  const { id } = useParams();
  console.log('ID da URL:', id);

  const navigate = useNavigate();

  const employeeList = [
    {
      id: '12345',
      name: 'Juliana',
      img: 'https://randomuser.me/api/portraits/women/44.jpg',
      since: '2018-06-12',
      birthDate: '1990-04-10',
      cpf: '123.456.789-00',
      phone: '(11) 91234-5678',
      email: 'juliana@example.com',
      position: 'Designer de Unhas',
      benefits: 'Vale-transporte, Desconto em procedimentos',
      healthIssues: 'Nenhum',
      notes: 'Horario de entrada 09:00 - saída 18:00',
    },
    {
      id: 'EMP124',
      name: 'Carla',
      img: 'https://randomuser.me/api/portraits/women/55.jpg',
      since: '2020-03-22',
      birthDate: '1992-08-15',
      cpf: '987.654.321-00',
      phone: '(11) 99876-5432',
      email: 'carla@example.com',
      position: 'Cabeleireira',
      benefits: 'Vale-alimentação, Plano de saúde',
      healthIssues: 'Alergia a produtos com amônia',
      notes: 'Trabalha apenas meio período',
    },
  ];

  const employee = employeeList.find(emp => emp.id.toLowerCase() === id.toLowerCase());

  const handleGoBack = () => {
    navigate(-1); // Navega para a página anterior
  };

  const handleClick = () => {
    navigate(`/funcionario/Editar/${employee.id}`);
  };

  if (!employee) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.topBar}></div>
          <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Funcionário não encontrado</h2>
            <button className={styles.backButton} onClick={handleGoBack} style={{ marginTop: '20px' }}>
              <FaArrowLeft /> 
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.topBar}></div>
        <div className={styles.mainContent}>
          <div className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
              <img src={employee.img} alt={employee.name} />
              <h2>{employee.name}</h2>
              <div className={styles.underline} />
              <p className={styles.since}>Funcionária desde {employee.since}</p>
            </div>

            <div className={styles.infoItem}><FaKey /> <span>ID: #{employee.id}</span></div>
            <div className={styles.infoItem}><FaBirthdayCake /> <span>Nascimento: {employee.birthDate}</span></div>
            <div className={styles.infoItem}><FaIdCard /> <span>CPF: {employee.cpf}</span></div>
            <div className={styles.infoItem}><FaPhone /> <span>Telefone: {employee.phone}</span></div>
            <div className={styles.infoItem}><FaEnvelope /> <span>Email: {employee.email}</span></div>
          </div>

          <div className={styles.detailsCard}>
            <h3>Informações do Funcionário</h3>
            <p><strong>Cargo:</strong> {employee.position}</p>
            <p><strong>Benefícios:</strong> {employee.benefits}</p>
            <p><strong>Problemas de saúde:</strong> {employee.healthIssues}</p>
            <p><strong>Informações adicionais:</strong> {employee.notes}</p>

            <button className={styles.button} onClick={handleClick}>
              Atualizar
            </button>
          </div>
        </div>

        <div className={styles.historySection}>
          <EmployeeHistory employeeId={employee.id} /> {/* Passando o ID para o EmployeeHistory */}
        </div>
      </div>
    </div>
  );
}