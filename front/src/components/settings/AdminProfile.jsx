import React, { useState, useEffect } from "react";
import styles from "./SettingsSection.module.css";
import { format } from "date-fns"; 

const BASE_URL = 'http://localhost:3000'; 

export default function AdminProfile({ userId }) { 
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "" 
  });

  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false); 
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); 
  const [messageType, setMessageType] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!userId) {
        console.warn("AdminProfile: userId not available, cannot fetch admin data.");
        setLoading(false);
        setError("ID do usuário não fornecido. Não é possível carregar o perfil do administrador.");
        return;
      }

      setLoading(true);
      setError(null);
      setMessage(null);
      setMessageType(null);

      try {
        const response = await fetch(`${BASE_URL}/register/${userId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.mensageStatus || `Falha ao carregar perfil do administrador. Status: ${response.status}`);
        }
        const result = await response.json();

        if (result.errorStatus || !result.data) {
          throw new Error(result.mensageStatus || 'Erro ao processar dados do administrador.');
        }

        const adminData = result.data;
        setForm({
          nome: adminData.nome || '', 
          email: adminData.email || '',
          senha: '' 
        });
      } catch (err) {
        console.error("Erro ao buscar perfil do administrador:", err);
        setError(err.message || "Ocorreu um erro ao carregar o perfil do administrador.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [userId, BASE_URL]); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(null); 
    setMessageType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); 
    setError(null);
    setMessage(null);
    setMessageType(null);

    if (!userId) {
      setMessage("ID do usuário não fornecido. Não é possível atualizar o perfil.", 'error');
      setSaving(false);
      return;
    }

    if (!form.nome || !form.email) {
      setMessage("Nome completo e Email são obrigatórios.", 'error');
      setSaving(false);
      return;
    }

    const updateData = {
      nome: form.nome,
      email: form.email,
    };

    if (form.senha) {
      if (form.senha.length < 6) { 
        setMessage("A nova senha deve ter pelo menos 6 caracteres.", 'error');
        setSaving(false);
        return;
      }
      updateData.senha = form.senha; 
    }

    console.log("Admin profile data being sent:", updateData);

    try {
      const response = await fetch(`${BASE_URL}/register/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensageStatus || `Falha ao atualizar perfil. Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.errorStatus) {
        throw new Error(result.mensageStatus || 'Erro retornado pelo backend ao atualizar.');
      }

      // setMessage("Perfil atualizado com sucesso!", 'success');
      setForm(prevForm => ({ ...prevForm, senha: '' })); 
    } catch (err) {
      console.error("Erro ao atualizar perfil do administrador:", err);
      setMessage(err.message || "Ocorreu um erro ao atualizar o perfil do administrador.", 'error');
    } finally {
      setSaving(false); 
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <h2>Perfil do Administrador</h2>
        <p>Carregando informações...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <h2>Perfil do Administrador</h2>
        <p className={styles.errorMessage}>Erro: {error}</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2>Perfil do Administrador</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {message && (
          <div className={`${styles.alert} ${messageType === 'error' ? styles.error : styles.success}`}>
            {message}
          </div>
        )}
        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} disabled={loading || saving} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={true} /> {/* Email is read-only */}
        <input name="senha" placeholder="Nova senha" type="password" value={form.senha} onChange={handleChange} disabled={loading || saving} />
        <button className={styles.salvar} type="submit" disabled={loading || saving}>
          {saving ? 'Atualizando...' : 'Atualizar'}
        </button>
      </form>
    </section>
  );
}