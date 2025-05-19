import React from "react";
import styles from "./SettingsSection.module.css";

export default function StaffPermissions() {
  const staff = [
    { nome: "Bruna", role: "Esteticista" },
    { nome: "Carlos", role: "Cabeleireiro" },
  ];

  return (
    <section className={styles.section}>
      <h2>Funcionários e Permissões</h2>
      <ul className={styles.staffList}>
        {staff.map((s, index) => (
          <li key={index}>
            {s.nome} - {s.role}
            <select>
              <option>Usuário</option>
              <option>Administrador</option>
            </select>
          </li>
        ))}
      </ul>
    </section>
  );
}

