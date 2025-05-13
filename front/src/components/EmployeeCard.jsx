import React from 'react';
import styles from './EmployeeCard.module.css';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function EmployeeCard({ employee }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/funcionario/${employee.id}`);
  };

  return (
    <div className={styles.card}>
      <img src={employee.img} alt={employee.name} className={styles.avatar} />
      <h4 className={styles.name}>{employee.name}</h4>
      <p className={styles.since}>Funcionária desde {employee.since}</p>

      <div className={styles.procedures}>
        <strong>Procedimentos realizados:</strong>
        <ul>
          {employee.procedures.map((proc, index) => (
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
