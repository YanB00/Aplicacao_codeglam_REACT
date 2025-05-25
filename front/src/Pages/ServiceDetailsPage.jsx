import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './ServiceDetailsPage.module.css';

export default function ServiceDetailsPage() {
  const { id: servicoIdFromParams } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaoIdForSidebar, setSalaoIdForSidebar] = useState(null);

  useEffect(() => {
    console.log("ServiceDetailsPage: Effect triggered. servicoIdFromParams:", servicoIdFromParams);

    const loadServiceDetails = async () => {
      if (!servicoIdFromParams) {
        console.error("ServiceDetailsPage: ID do serviço (servicoIdFromParams) não fornecido na URL.");
        setError('ID do serviço não fornecido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setService(null);
      setSalaoIdForSidebar(null);

      try {
        console.log(`ServiceDetailsPage: Fetching service with ID: ${servicoIdFromParams}`);
        const response = await fetch(`http://localhost:3000/servicos/item/${servicoIdFromParams}`);        
        console.log("ServiceDetailsPage: Fetch response status:", response.status, response.statusText);
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error("ServiceDetailsPage: API error JSON response:", errorData);
          } catch (parseError) {
            const errorText = await response.text();
            console.error("ServiceDetailsPage: API error text response (not JSON):", errorText);
            errorData = { mensageStatus: `Erro HTTP: ${response.status} ${response.statusText}. Resposta não era JSON.` };
          }
          throw new Error(errorData.mensageStatus || `Falha ao carregar detalhes do serviço. Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("ServiceDetailsPage: API success full result:", result);

        if (result.errorStatus) {
          console.error("ServiceDetailsPage: API indica erro explícito:", result.mensageStatus);
          throw new Error(result.mensageStatus || 'Erro retornado pela API.');
        }

        // ***** IMPORTANT CHECK ADDED HERE *****
        if (Array.isArray(result.data)) {
          console.error("ServiceDetailsPage: Erro crítico! Esperava um objeto de serviço, mas a API retornou um array.", result.data);
          if (result.mensageStatus === "SERVIÇOS DO SALÃO ENCONTRADOS") {
            setError("Falha ao carregar dados: A API pode estar interpretando o ID do serviço como um ID de salão. Verifique a configuração das rotas no backend.");
          } else if (result.data.length === 0) {
            setError("Serviço não encontrado (API retornou uma lista vazia).");
          } else {
            setError("Formato de dados do serviço inesperado (recebido array). A API pode estar configurada incorretamente.");
          }
          setService(null);
        } else if (typeof result.data === 'object' && result.data !== null) {
          // This is the expected path if data is a single service object
          console.log("ServiceDetailsPage: Service data received (object):", result.data);
          setService(result.data);

          if (result.data.salaoId) {
            console.log("ServiceDetailsPage: salaoId found in service data:", result.data.salaoId);
            setSalaoIdForSidebar(result.data.salaoId);
          } else {
            console.warn("ServiceDetailsPage: 'salaoId' não encontrado nos dados do serviço. Sidebar pode não carregar o nome da empresa.");
          }
        } else if (result.data === null && result.mensageStatus === 'Serviço não encontrado.') {
            // Handle case where backend correctly says service not found with data: null
            console.warn("ServiceDetailsPage: Serviço não encontrado (conforme API).");
            setError(result.mensageStatus); // "Serviço não encontrado."
            setService(null);
        }else {
          console.error("ServiceDetailsPage: Dados do serviço em formato inesperado ou nulos:", result.data);
          setError("Dados do serviço retornados pela API em formato inválido ou nulo.");
          setService(null);
        }

      } catch (err) {
        console.error('ServiceDetailsPage: Exception during loadServiceDetails:', err);
        setError(err.message || 'Ocorreu um erro desconhecido ao buscar os detalhes do serviço.');
      } finally {
        setLoading(false);
        console.log("ServiceDetailsPage: Fetch process finished. Loading set to false.");
      }
    };

    loadServiceDetails();
  }, [servicoIdFromParams]);

  const handleGoBack = () => {
    navigate(salaoIdForSidebar ? `/servicos?userId=${salaoIdForSidebar}` : '/servicos');
  };

  const handleEditService = () => {
    const editPath = `/servicos/editar/${servicoIdFromParams}`;
    navigate(salaoIdForSidebar ? `${editPath}?userId=${salaoIdForSidebar}` : editPath);
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return 'R$ --,--';
      }
      value = parsedValue;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Data não disponível';
    try {
      return new Intl.DateTimeFormat('pt-BR').format(new Date(isoDate));
    } catch (e) {
      console.error("Error formatting date:", isoDate, e);
      return 'Data inválida';
    }
  };

   return (
    <div className={styles.page}>
      <Sidebar userId={salaoIdForSidebar} />
      <div className={styles.mainArea}> 
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Detalhes do Serviço</h1>
        </div>
        <div className={styles.contentWrapper}> 
          {loading && <div className={styles.loading}>Carregando detalhes do serviço...</div>}
          
          {!loading && error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorText}>
                <strong>Erro:</strong> {error}
              </div>
              <button onClick={handleGoBack} className={styles.backButton}>
                Voltar para Serviços
              </button>
            </div>
          )}

          {!loading && !error && service && (
            <div className={styles.detailsContainer}>
              <h2 className={styles.serviceTitleCard}>{service.titulo || 'Título não disponível'}</h2> 
              <p className={styles.id}>ID: {service._id || 'N/A'}</p>
              <div className={styles.infoSection}>
                <p>Preço: {service.preco !== undefined ? formatCurrency(service.preco) : 'R$ --,--'}</p>
                <p>Comissão: {service.comissao !== undefined ? `${service.comissao}%` : '--%'}</p>
                <p>Duração: {service.duracao || 'Não informada'}</p>
                <p>Status: {service.status || 'Não informado'}</p>
                <p>Cadastrado em: {formatDate(service.dataCadastro || service.createdAt)}</p>
              </div>
              <div className={styles.descriptionSection}>
                <h3 className={styles.descriptionHeader}>Descrição:</h3>
                <p className={styles.descriptionText}>{service.descricao || 'Não informada'}</p>
              </div>
              <div className={styles.actionButtons}>
                <button onClick={handleGoBack} className={`${styles.button} ${styles.backButton}`}>Voltar</button>
                <button onClick={handleEditService} className={`${styles.button} ${styles.editButton}`}>Editar</button>
              </div>
            </div>
          )}

          {!loading && !error && !service && (
            <div className={styles.notFoundContainer}> 
               <p>Serviço não encontrado ou dados indisponíveis.</p>
              <button onClick={handleGoBack} className={styles.backButton}>
                Voltar para Serviços
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}