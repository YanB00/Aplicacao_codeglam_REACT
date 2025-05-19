// pages/AddServicePage.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import styles from './AddServicePage.module.css';
import { useNavigate } from 'react-router-dom';

export default function AddServicePage() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [comissao, setComissao] = useState('');
  const [duracao, setDuracao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('A'); // Valor padrão 'Ativo'

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
      case 'duracao':
        setDuracao(value);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    //  chamada API para salvar o novo serviço
    const newService = {
      titulo,
      preco: parseFloat(preco),
      comissao: parseInt(comissao),
      duracao,
      descricao,
      status,
    };
    console.log('Novo serviço a ser salvo:', newService);
    // Após salvar,  o usuário  vai para a lista de serviços
    navigate('/servicos');
  };

  const handleCancel = () => {
    navigate('/servicos');
  };

  return (
    <div className={styles.page}>
      <Sidebar />
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
            <div className={styles.formGroup}>
              <label htmlFor="duracao">Duração:</label>
              <input type="text" id="duracao" name="duracao" value={duracao} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="descricao">Descrição:</label>
              <textarea id="descricao" name="descricao" value={descricao} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Status:</label>
              <select id="status" name="status" value={status} onChange={handleInputChange} required>
                <option value="A">Ativo</option>
                <option value="B">Bloqueado</option>
                <option value="C">Cancelado</option>
              </select>
            </div>
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancelar</button>
              <button type="submit" className={styles.saveBtn}>Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}