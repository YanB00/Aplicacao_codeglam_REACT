import React from 'react';
import styles from './EditClientPage.module.css';
import Sidebar from '../components/Sidebar';
import { FaCamera } from 'react-icons/fa';  
export default function EditClientPage() {
  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.content}>
        {/* Barra roxa superior */}
        <div className={styles.topBar}></div>

        <div className={styles.formContainer}>
          <div className={styles.avatarSection}>
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
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

            <div className={styles.radioGroup}>
              <label>Cliente frequente?</label>
              <div>
                <label>
                  <input type="radio" name="frequente" value="Sim" /> Sim
                </label>
                <label>
                  <input type="radio" name="frequente" value="Não" /> Não
                </label>
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="procedures">Procedimentos Favoritos</label>
                <input
                  id="procedures"
                  type="text"
                  placeholder="Ex: Corte, Escova"
                />
              </div>
              <div>
                <label htmlFor="benefits">Benefícios</label>
                <input
                  id="benefits"
                  type="text"
                  placeholder="Ex: Desconto"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="medicalIssues">Problemas médicos</label>
                <input
                  id="medicalIssues"
                  type="text"
                  placeholder="Ex: Nenhum"
                />
              </div>
              <div>
                <label htmlFor="additionalInfo">Informações adicionais</label>
                <input
                  id="additionalInfo"
                  type="text"
                  placeholder="Ex: Prefere manhã"
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
