import React, { useState } from "react";
import styles from "./SettingsSection.module.css";

export default function SalonInfo() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados do salão:", form);
  };

  return (
    <section className={styles.section}>
      <h2>Informações do Salão</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input name="nome" placeholder="Nome do salão" value={form.nome} onChange={handleChange} />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} />
        <button className={styles.salvar} type="submit">Salvar</button>
      </form>
    </section>
  );
}
