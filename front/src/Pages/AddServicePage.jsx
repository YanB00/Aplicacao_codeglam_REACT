// pages/AddServicePage.jsx
import React, { useState, useEffect } from 'react';
import styles from './AddServicePage.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AddServicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [comissao, setComissao] = useState('');
  const [duracaoHoras, setDuracaoHoras] = useState(''); 
  const [duracaoMinutos, setDuracaoMinutos] = useState(''); 
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('Ativo');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('userId');
    if (id) {
      setUserId(id);
    } else {
      console.error('userId not found in URL parameters.');
      setError('ID do salão não encontrado. Não é possível adicionar o serviço.');
    }
  }, [location.search]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'titulo':
        setTitulo(value);
        break;
      case 'preco':
        setPreco(value);
        break;
      case 'comissao':
        setComissao(value);
        break;
      case 'duracaoHoras': // Novo case
        setDuracaoHoras(value);
        break;
      case 'duracaoMinutos': // Novo case
        setDuracaoMinutos(value);
        break;
      case 'descricao':
        setDescricao(value);
        break;
      case 'status':
        setStatus(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!userId) {
      setError('Não foi possível determinar o salão para adicionar o serviço. Por favor, tente novamente.');
      setLoading(false);
      return;
    }

    const horas = parseInt(duracaoHoras || 0);
    const minutos = parseInt(duracaoMinutos || 0);

    if (isNaN(horas) || isNaN(minutos) || horas < 0 || minutos < 0 || minutos >= 60) {
      setError('Por favor, insira uma duração válida em horas e minutos (minutos entre 0 e 59).');
      setLoading(false);
      return;
    }

    const duracaoFormatada = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;


    try {
      const newService = {
        salaoId: userId,
        titulo,
        preco: parseFloat(preco),
        comissao: parseInt(comissao),
        duracao: duracaoFormatada, 
        descricao,
        status,
      };

      const response = await fetch(`${API_BASE_URL}/servicos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newService),
      });

      const result = await response.json();

      if (!response.ok || result.errorStatus) {
        throw new Error(result.mensageStatus || 'Erro ao cadastrar serviço');
      }

      setSuccess(true);
      console.log('Serviço cadastrado com sucesso:', result.data);
      navigate(`/servicos?userId=${userId}`);
    } catch (err) {
      console.error('Erro ao cadastrar serviço:', err);
      setError(err.message || 'Houve um erro ao cadastrar o serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/servicos?userId=${userId}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h2 className={styles.topBarTitle}>Adicionar Novo Serviço</h2>
        </div>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="titulo">Título:</label>
              <input type="text" id="titulo" name="titulo" value={titulo} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="preco">Preço:</label>
              <input type="number" id="preco" name="preco" value={preco} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="comissao">Comissão (%):</label>
              <input type="number" id="comissao" name="comissao" value={comissao} onChange={handleInputChange} required />
            </div>

            {/* Campos para Horas e Minutos */}
            <div className={styles.formGroup}>
              <label>Duração:</label>
              <div className={styles.durationInputGroup}>
                <input
                  type="number"
                  id="duracaoHoras"
                  name="duracaoHoras"
                  value={duracaoHoras}
                  onChange={handleInputChange}
                  min="0"
                  max="23" 
                  placeholder="Horas"
                  className={styles.smallInput} 
                />
                <span>H</span>
                <input
                  type="number"
                  id="duracaoMinutos"
                  name="duracaoMinutos"
                  value={duracaoMinutos}
                  onChange={handleInputChange}
                  min="0"
                  max="59" 
                  placeholder="Minutos"
                  className={styles.smallInput}
                />
                <span>M</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="descricao">Descrição:</label>
              <textarea id="descricao" name="descricao" value={descricao} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Status:</label>
              <select id="status" name="status" value={status} onChange={handleInputChange} required>
                <option value="Ativo">Ativo</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p className={styles.successMessage}>Serviço cadastrado com sucesso!</p>}
          </form>
        </div>
      </div>
    </div>
  );
}