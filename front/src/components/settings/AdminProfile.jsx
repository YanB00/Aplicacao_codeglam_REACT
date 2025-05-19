import React, { useState } from "react";
import styles from "./SettingsSection.module.css";

export default function AdminProfile() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Perfil do ADM:", form);
  };

  return (
    <section className={styles.section}>
      <h2>Perfil do Administrador</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="senha" placeholder="Nova senha" type="password" value={form.senha} onChange={handleChange} />
        <button className={styles.salvar} type="submit">Atualizar</button>
      </form>
    </section>
  );
}
