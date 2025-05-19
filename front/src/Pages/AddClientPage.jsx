// AddClientPage.js
import React from 'react';
import styles from './AddClientPage.module.css';
import Sidebar from '../components/Sidebar';
import { FaCamera } from 'react-icons/fa';

export default function AddClientPage() {
  // Função para gerar um ID automático com 6 caracteres
  const generateId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const newClientId = generateId();

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.content}>
        {/* Barra roxa superior */}
        <div className={styles.topBar}></div>

        <div className={styles.formContainer}>
          <div className={styles.avatarSection}>
            <img
              src="https://media.lordicon.com/icons/wired/gradient/21-avatar.gif" // Imagem padrão
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
                <label htmlFor="clientId">ID do Cliente</label>
                <input id="clientId" type="text" value={newClientId} readOnly />
              </div>
              <div>
                <label htmlFor="startDate">Cliente desde</label>
                <input id="startDate" type="date" />
              </div>
              <div>
                <label htmlFor="favorites">Favoritos</label>
                <input id="favorites" type="text" placeholder="Ex: Design de Unhas" />
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
                <label htmlFor="email">Email</label>
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