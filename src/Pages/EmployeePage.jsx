import React from 'react';
import { Link } from 'react-router-dom';
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope } from 'react-icons/fa';

import Sidebar from '../components/Sidebar';
import EmployeeHistory from '../components/EmployeeHistory'; // Supondo que você tenha ou vá criar esse componente
import styles from './EmployeePage.module.css';

export default function EmployeePage() {
  const employee = {
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
  };

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.content}>
        {/* Barra roxa superior */}
        <div className={styles.topBar}></div>

        <div className={styles.mainContent}>
          {/* Card de perfil do funcionário */}
          <div className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
              <img src={employee.img} alt={employee.name} />
              <h2>{employee.name}</h2>
              <div className={styles.underline} />
              <p className={styles.since}>Funcionária desde {employee.since}</p>
            </div>

            <div className={styles.infoItem}><FaKey /> <span>ID: #EMP123</span></div>
            <div className={styles.infoItem}><FaBirthdayCake /> <span>Nascimento: {employee.birthDate}</span></div>
            <div className={styles.infoItem}><FaIdCard /> <span>CPF: {employee.cpf}</span></div>
            <div className={styles.infoItem}><FaPhone /> <span>Telefone: {employee.phone}</span></div>
            <div className={styles.infoItem}><FaEnvelope /> <span>Email: {employee.email}</span></div>
          </div>

          {/* Card de detalhes */}
          <div className={styles.detailsCard}>
            <h3>Informações do Funcionário</h3>
            <p><strong>Cargo:</strong> {employee.position}</p>
            <p><strong>Benefícios:</strong> {employee.benefits}</p>
            <p><strong>Problemas de saúde:</strong> {employee.healthIssues}</p>
            <p><strong>Informações adicionais:</strong> {employee.notes}</p>

            <div className={styles.actions}>
              <Link to="/funcionario/editar" className={styles.updateBtn}>
                Atualizar
              </Link>
            </div>
          </div>
        </div>

        {/* Seção de histórico */}
        <div className={styles.historySection}>
          <EmployeeHistory /> {/* Substitua pelo componente correto, se necessário */}
        </div>
      </div>
    </div>
  );
}
