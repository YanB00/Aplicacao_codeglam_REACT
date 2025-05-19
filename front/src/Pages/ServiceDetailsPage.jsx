// pages/ServiceDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './ServiceDetailsPage.module.css';

// Simula uma requisição de API para obter os detalhes do serviço
const fetchServiceDetails = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        _id: id,
        titulo: `Serviço ${id}`,
        preco: Math.random() * 100 + 30,
        comissao: Math.floor(Math.random() * 25),
        duracao: `${Math.floor(Math.random() * 90) + 30} min`,
        recorrencia: 30,
        descricao: `Descrição detalhada do Serviço ${id}. Inclui informações importantes e passos para a realização.`,
        status: Math.random() > 0.5 ? 'A' : 'B',
        dataCadastro: new Date().toISOString(),
      });
    }, 500);
  });
};

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchServiceDetails(id)
      .then((data) => {
        setService(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar detalhes do serviço.');
        setLoading(false);
      });
  }, [id]);

  const handleGoBack = () => {
    navigate('/servicos');
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'A': return 'Ativo';
      case 'B': return 'Bloqueado';
      case 'C': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (isoDate) =>
    new Intl.DateTimeFormat('pt-BR').format(new Date(isoDate));

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.topBar}></div>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Carregando detalhes do serviço...</div>
        ) : error ? (
          <>
            <div className={styles.error}>{error}</div>
            <button onClick={handleGoBack} className={styles.backButton}>
              Voltar para Serviços
            </button>
          </>
        ) : service ? (
          <div className={styles.detailsContainer}>
            <h2 className={styles.title}>{service.titulo}</h2>
            <p className={styles.id}>ID: {service._id}</p>

            <div className={styles.infoSection}>
              <p className={styles.price}>Preço: {formatCurrency(service.preco)}</p>
              <p className={styles.commission}>Comissão: {service.comissao}%</p>
              <p className={styles.duration}>Duração: {service.duracao}</p>
              <p className={styles.recorrencia}>Recorrência: {service.recorrencia} dias</p>
              <p className={styles.status}>Status: {formatStatus(service.status)}</p>
              <p className={styles.dataCadastro}>Cadastrado em: {formatDate(service.dataCadastro)}</p>
            </div>

            <div className={styles.descriptionSection}>
              <h3>Descrição:</h3>
              <p className={styles.descriptionText}>{service.descricao}</p>
            </div>

            <div className={styles.actionButtons}>
              <button onClick={handleGoBack} className={styles.backButton}>
                Voltar para Serviços
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.notFound}>
            Serviço não encontrado.
            <button onClick={handleGoBack} className={styles.backButton}>
              Voltar para Serviços
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
