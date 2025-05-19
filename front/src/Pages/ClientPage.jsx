import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import ClientHistory from '../components/ClientHistory';
import styles from './EmployeePage.module.css';

export default function ClientPage() {
  const { id } = useParams();
  console.log('ID da URL:', id);

  const navigate = useNavigate();

  const clientList = [
    {
      id: '12345',
      name: 'Ana',
      img: 'https://randomuser.me/api/portraits/women/45.jpg',
      since: '2018-06-12',
      birthDate: '1990-04-10',
      cpf: '123.456.789-00',
      phone: '(11) 91234-5678',
      email: 'juliana@example.com',
      favorite: 'Unha em gel',
      healthIssues: 'Nenhum',
      notes: 'prefere vir de manhã',
    },
  ];

  const client = clientList.find(cli => cli.id.toLowerCase() === id.toLowerCase());

  const handleGoBack = () => {
    navigate('/clientes'); // Ajuste a rota conforme a sua necessidade
  };

  const handleEditClick = () => {
    navigate(`/cliente/editar/${client.id}`);
  };



  if (!client) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.topBar}></div>
          <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Cliente não encontrado</h2>
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
              <img src={client.img} alt={client.name} />
              <h2>{client.name}</h2>
              <div className={styles.underline} />
              <p className={styles.since}> cliente desde {client.since}</p>
            </div>

            <div className={styles.infoItem}><FaKey /> <span>ID: #{client.id}</span></div>
            <div className={styles.infoItem}><FaBirthdayCake /> <span>Nascimento: {client.birthDate}</span></div>
            <div className={styles.infoItem}><FaIdCard /> <span>CPF: {client.cpf}</span></div>
            <div className={styles.infoItem}><FaPhone /> <span>Telefone: {client.phone}</span></div>
            <div className={styles.infoItem}><FaEnvelope /> <span>Email: {client.email}</span></div>
          </div>

          <div className={styles.detailsCard}>
            <h3>Informações do cliente</h3>
            <p><strong>Favoritos:</strong> {client.favorite}</p>
            <p><strong>Problemas de saúde:</strong> {client.healthIssues}</p>
            <p><strong>Informações adicionais:</strong> {client.notes}</p>

            <button className={styles.button} onClick={handleEditClick}>
              Atualizar
            </button>
          </div>
        </div>

        <div className={styles.historySection}>
          <ClientHistory clientId={client.id} /> {/* Passando o ID para o ClientHistory */}
        </div>
      </div>
    </div>
  );
}