import React from 'react';
import styles from './ServiceCard.module.css';
import { useNavigate } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/servico/${service._id}`);
  };

  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
  };

  const formatDuration = (duration) => {

    if (typeof duration === 'string' && duration.includes(':')) {
      return duration; 
    } else if (typeof duration === 'number') {
      const totalMinutes = parseInt(duration);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return duration; 
  };


  const getStatusClassName = (status) => {
    switch (status) {
      case 'Ativo':
        return styles.statusActive;
      case 'Cancelado':
        return styles.statusCanceled;
      case 'Bloqueado':
        return styles.statusBlocked;
      default:
        return '';
    }
  };

  return (
    <div className={styles.card} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <h4 className={styles.title}>{service.titulo}</h4>
      <p className={styles.price}>Preço: {formatPrice(service.preco)}</p>
      <p className={styles.commission}>Comissão: {service.comissao}%</p>
      <p className={styles.duration}>Duração: {formatDuration(service.duracao)}</p> 
      <p className={styles.status}>
        Status: <span className={getStatusClassName(service.status)}>{service.status}</span>
      </p>
    </div>
  );
}