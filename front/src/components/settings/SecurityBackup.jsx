import React from "react";
import styles from "./SettingsSection.module.css";

export default function SecurityBackup() {
  const handleBackup = () => {
    alert("Backup iniciado...");
  };

  return (
    <section className={styles.section}>
      <h2>Backup e Segurança</h2>
      <button className={styles.salvar} onClick={handleBackup}>Realizar Backup</button>
      <p>Último backup: 14/05/2025 às 21:37</p>
    </section>
  );
}
