import React, { useState } from "react";
import styles from "./SettingsSection.module.css";

export default function Interactions() {
  const [notifications, setNotifications] = useState(true);
  const [chat, setChat] = useState(false);

  const handleSave = () => {
    console.log("Notificações:", notifications, "Chat:", chat);
  };

  return (
    <section className={styles.section}>
      <h2>Interações</h2>
      <label>
        <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
        Notificações por email
      </label>
      <label>
        <input type="checkbox" checked={chat} onChange={() => setChat(!chat)} />
        Habilitar chat interno
      </label>
      <button  className={styles.salvar} onClick={handleSave}>Salvar</button>
    </section>
  );
}
