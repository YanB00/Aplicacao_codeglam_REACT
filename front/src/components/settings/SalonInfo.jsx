import React, { useState, useEffect } from "react";
import styles from "./SettingsSection.module.css";

const formatPhone = (value) => {
  if (!value) return '';
  value = value.replace(/\D/g, ''); 
  if (value.length > 10) {
    return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (value.length > 6) {
    return value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
  } else if (value.length > 2) {
    return value.replace(/^(\d{2})(\d+)/, '($1) $2');
  }
  return value;
};

export default function SalonInfo({ userId }) { 
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false); 
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); 
  const [messageType, setMessageType] = useState(null); 

  const BASE_URL = 'http://localhost:3000'; 
  useEffect(() => {
    const fetchSalonData = async () => {
      if (!userId) {
        console.warn("SalonInfo: userId not available, cannot fetch salon data.");
        setLoading(false);
        setError("ID do salão não fornecido. Não é possível carregar as informações.");
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
          throw new Error(errorData.mensageStatus || `Falha ao carregar informações do salão. Status: ${response.status}`);
        }
        const result = await response.json();

        if (result.errorStatus || !result.data) {
          throw new Error(result.mensageStatus || 'Erro ao processar dados do salão.');
        }

        const salonData = result.data;
        setForm({
          nome: salonData.empresa || '', 
          telefone: salonData.telefone ? formatPhone(salonData.telefone) : '', 
          email: salonData.email || '',
        });
      } catch (err) {
        console.error("Erro ao buscar informações do salão:", err);
        setError(err.message || "Ocorreu um erro ao carregar as informações do salão.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
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
      setMessage("ID do salão não fornecido. Não é possível salvar.", 'error');
      setSaving(false);
      return;
    }

    console.log("Sending form data:", form); 
    const jsonBody = JSON.stringify({
      empresa: form.nome,
      telefone: form.telefone,
      email: form.email,
    });
    console.log("JSON body being sent:", jsonBody); 

    try {
      const response = await fetch(`${BASE_URL}/register/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonBody, 
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensageStatus || `Falha ao salvar informações do salão. Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.errorStatus) {
        throw new Error(result.mensageStatus || 'Erro retornado pelo backend ao salvar.');
      }

      // setMessage("Informações do salão salvas com sucesso!", 'success');
    } catch (err) {
      console.error("Erro ao salvar informações do salão:", err);
      setMessage(err.message || "Ocorreu um erro ao salvar as informações do salão.", 'error');
    } finally {
      setSaving(false); 
    }
  };
 return (
        <section className={styles.section}>
            <h2>Informações do Salão</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {message && (
                    <div className={`${styles.alert} ${messageType === 'error' ? styles.error : styles.success}`}>
                        {message}
                    </div>
                )}
                <label>
                    Nome do salão
                    <input name="nome" placeholder="Nome do salão" value={form.nome} onChange={handleChange} disabled={loading || saving} />
                </label>
                <label>
                    Telefone
                    <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} disabled={loading || saving} />
                </label>
                <label>
                    Email
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={true} />
                </label>
                <button className={styles.salvar} type="submit" disabled={loading || saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </form>
        </section>
    );
}