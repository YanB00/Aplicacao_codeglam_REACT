//card de funcionario da pagina de funcionario
import React from 'react';
import styles from './EmployeeCard.module.css';
import { FaBriefcase } from 'react-icons/fa'; 
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
      <p className={styles.since}>Funcionário desde {employee.since}</p>

      <div className={styles.procedures}> 
        <strong>Serviços realizados:</strong> 
        <ul>
          {employee.service && employee.service.map((serv, index) => (
            <li key={index}>
              <FaBriefcase size={10} color="#9b5de5" style={{ marginRight: 6 }} /> 
              {serv}
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