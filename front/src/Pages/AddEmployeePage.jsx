// AddEmployeePage.js
import React from 'react';
import styles from './AddClientPage.module.css';
import Sidebar from '../components/Sidebar';
import { FaCamera, FaBriefcase } from 'react-icons/fa'; // Importe um ícone para serviços

export default function AddEmployeePage() {
  // Função para gerar um ID automático com 6 caracteres
  const generateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // IDs de funcionário em maiúsculo
  };

  const newEmployeeId = generateId();

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.content}>
        {/* Barra roxa superior (você pode adaptar a cor no CSS) */}
        <div className={styles.topBar}></div>

        <div className={styles.formContainer}>
          <div className={styles.avatarSection}>
            <img
              src="https://media.lordicon.com/icons/wired/gradient/21-avatar.gif" // Imagem padrão de funcionário
              alt="Avatar do Funcionário"
              className={styles.avatar}
            />

            <label htmlFor="avatar-upload" className={styles.cameraIcon}>
              <FaCamera />
              <input
                id="avatar-upload"
                type="file"
                hidden
                accept="image/*"
              />
            </label>
          </div>

          <form className={styles.form}>
            <div className={styles.row}>
              <div>
                <label htmlFor="fullName">Nome completo</label>
                <input id="fullName" type="text" placeholder="Nome completo" />
              </div>
              <div>
                <label htmlFor="birthdate">Data de nascimento</label>
                <input id="birthdate" type="date" />
              </div>
              <div>
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" type="text" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="employeeId">ID do Funcionário</label>
                <input id="employeeId" type="text" value={newEmployeeId} readOnly />
              </div>
              <div>
                <label htmlFor="startDate">Funcionário desde</label>
                <input id="startDate" type="date" />
              </div>
              <div>
                <label htmlFor="services">Serviços realizados</label>
                <input id="services" type="text" placeholder="Ex: Corte, Manicure" />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="benefits">Benefícios</label>
                <input
                  id="benefits"
                  type="text"
                  placeholder="Ex: Vale transporte, Comissão"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="additionalInfo">Informações adicionais</label>
                <input
                  id="additionalInfo"
                  type="text"
                  placeholder="Ex: Disponibilidade aos sábados"
                />
              </div>
              <div>
                <label htmlFor="tel">Telefone</label>
                <input
                  id="tel"
                  type="text"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  placeholder="funcionario@email.com"
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelBtn}>
                Cancelar
              </button>
              <button type="submit" className={styles.saveBtn}>
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}