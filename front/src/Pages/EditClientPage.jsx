import React from 'react';
import styles from './EditEmployeePage.module.css';
import { FaCamera } from 'react-icons/fa';


export default function EditClientPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* Barra roxa superior */}
        <div className={styles.topBar}></div>

        <div className={styles.formContainer}>
          <div className={styles.avatarSection}>
            <img
              src="https://randomuser.me/api/portraits/women/45.jpg"
              alt="Avatar"
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
                <label htmlFor="employeeId">ID do Cliente</label>
                <input id="employeeId" type="text" placeholder="12345" />
              </div>
              <div>
                <label htmlFor="startDate">cliente desde  </label>
                <input id="startDate" type="date" />
              </div>
              <div>
                <label htmlFor="favorites">Fovoritos</label>
                <input id="position" type="text" placeholder="Ex: Designer de Unhas" />
              </div>
            </div>

            <div className={styles.row}>
        
              <div>
                <label htmlFor="healthIssues">Problemas de saúde</label>
                <input
                  id="healthIssues"
                  type="text"
                  placeholder="Ex: Nenhum"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="additionalInfo">Informações adicionais</label>
                <input
                  id="additionalInfo"
                  type="text"
                  placeholder="Prefere vir de manhã"
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
                <label htmlFor="Email">Email</label>
                <input
                  id="email"
                  type="text"
                  placeholder="juliana@gmail.com" 
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