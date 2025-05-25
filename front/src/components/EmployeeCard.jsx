import React from 'react';
import styles from './EmployeeCard.module.css';
import { FaBriefcase } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function EmployeeCard({ employee, userId }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/funcionario/${employee.idFuncionario}?userId=${userId}`);
  };

  return (
    <div className={styles.card}>
      <img src={employee.foto ? `http://localhost:3000/uploads/${employee.foto}` : 'URL_DA_IMAGEM_PADRAO'} alt={employee.nomeCompleto} className={styles.avatar} />
      <h4 className={styles.name}>{employee.nomeCompleto}</h4>
      <p className={styles.since}>Funcionário desde {new Date(employee.dataAdmissao).toLocaleDateString()}</p>

      <div className={styles.procedures}>
        <strong>Serviços realizados:</strong>
        <ul>
          {employee.servicosRealizados && employee.servicosRealizados.map((serv, index) => (
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