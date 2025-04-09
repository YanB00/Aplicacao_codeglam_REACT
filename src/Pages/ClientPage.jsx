import React from 'react';
import styles from './ClientPage.module.css';
import Sidebar from '../components/Sidebar'; // se já tiver esse componente
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function ClientPage() {
  const client = {
    name: 'Amanda Souza',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
    since: '2018-06-12',
    birthDate: '1990-04-10',
    cpf: '123.456.789-00',
    phone: '(11) 91234-5678',
    email: 'amanda@example.com',
    favorites: ['Corte', 'Coloração'],
    frequente: 'Sim',
    beneficios: 'Desconto mensal',
    problemasMedicos: 'Nenhum',
    adicionais: 'Prefere agendar no período da manhã',
  };

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
              <p className={styles.since}>Cliente desde {client.since}</p>
            </div>
            <div className={styles.infoItem}><FaKey/> <span>ID: #123456</span></div>
            <div className={styles.infoItem}><FaBirthdayCake /> <span>Nascimento: {client.birthDate}</span></div>
            <div className={styles.infoItem}><FaIdCard /> <span>CPF: {client.cpf}</span></div>
            <div className={styles.infoItem}><FaPhone /> <span>Telefone: {client.phone}</span></div>
            <div className={styles.infoItem}><FaEnvelope /> <span>Email: {client.email}</span></div>
          </div>

          <div className={styles.detailsCard}>
            <h3>Informações de Atendimento</h3>
            <p><strong>Procedimentos favoritos:</strong> {client.favorites.join(', ')}</p>
            <p><strong>Cliente frequente:</strong> {client.frequente}</p>
            <p><strong>Benefícios:</strong> {client.beneficios}</p>
            <p><strong>Problemas médicos:</strong> {client.problemasMedicos}</p>
            <p><strong>Informações adicionais:</strong> {client.adicionais}</p>
            <div className={styles.actions}>
              <button className={styles.updateBtn}>Atualizar</button>
              <button className={styles.historyBtn}>Ver Histórico</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
