//cards da pagina serviço
import React from 'react';
import styles from './ServiceCard.module.css';
import { useNavigate } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/servico/${service._id}`); // Rota para a página de detalhes do serviço (ainda não criada)
  };

  return (
    <div className={styles.card} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <h4 className={styles.title}>{service.titulo}</h4>
      <p className={styles.price}>Preço: R$ {service.preco.toFixed(2)}</p>
      <p className={styles.commission}>Comissão: {service.comissao}%</p>
      <p className={styles.duration}>Duração: {service.duracao}</p>
      <p className={styles.status}>Status: {service.status === 'A' ? 'Ativo' : service.status === 'B' ? 'Bloqueado' : 'Cancelado'}</p>
    </div>
  );
}