//card de cliente pagina de cliente

import React from 'react';
import styles from './EmployeeCard.module.css';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ClientCard({ client }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/cliente/${client.id}`);
  };

  return (
    <div className={styles.card}>
      <img src={client.img} alt={client.name} className={styles.avatar} />
      <h4 className={styles.name}>{client.name}</h4>
      <p className={styles.since}>Cliente desde {client.since}</p>

      <div className={styles.procedures}>
        <strong>Procedimentos favoritos:</strong>
        <ul>
          {client.favorites.map((proc, index) => (
            <li key={index}>
              <FaHeart size={10} color="#9b5de5" style={{ marginRight: 6 }} />
              {proc}
            </li>
          ))}
        </ul>
      </div>

      <button className={styles.button} onClick={handleClick}>
        Perfil
      </button>
    </div>
  );
}
