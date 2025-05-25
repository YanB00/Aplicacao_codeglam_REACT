import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './EditServicePage.module.css'; // Certifique-se que este CSS existe e está correto

export default function EditServicePage() {
  const { id: serviceIdFromParams } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [salaoId, setSalaoId] = useState(null);

  // Campos do formulário
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [comissao, setComissao] = useState('');
  // Novos estados para duração
  const [duracaoHoras, setDuracaoHoras] = useState('');
  const [duracaoMinutos, setDuracaoMinutos] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('Ativo');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userIdFromQuery = queryParams.get('userId');
    if (userIdFromQuery) {
      setSalaoId(userIdFromQuery);
    }

    if (serviceIdFromParams) {
      setLoading(true);
      setError(null);
      fetch(`http://localhost:3000/servicos/item/${serviceIdFromParams}`)
        .then(response => {
          if (!response.ok) {
            return response.json().then(errData => {
              throw new Error(errData.mensageStatus || `Falha ao carregar. Status: ${response.status}`);
            }).catch(() => {
              throw new Error(`Falha ao carregar. Status: ${response.status}`);
            });
          }
          return response.json();
        })
        .then(result => {
          if (result.errorStatus || !result.data) {
            throw new Error(result.mensageStatus || 'Erro ao processar dados.');
          }
          const serviceData = result.data;
          setTitulo(serviceData.titulo || '');
          setPreco(String(serviceData.preco || ''));
          setComissao(String(serviceData.comissao || ''));
          setDescricao(serviceData.descricao || '');
          setStatus(serviceData.status || 'Ativo');

          const duracaoTotalStr = serviceData.duracao || "00:00";
          const parts = duracaoTotalStr.split(':');
          if (parts.length === 2) {
            setDuracaoHoras(parts[0]);
            setDuracaoMinutos(parts[1]);
          } else {
            setDuracaoHoras('0'); 
            setDuracaoMinutos('0'); 
            console.warn("Formato de duração inesperado recebido do backend:", serviceData.duracao);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar detalhes do serviço:", err);
          setError(err.message || 'Não foi possível carregar os dados do serviço.');
          setLoading(false);
        });
    } else {
      setError("ID do serviço não fornecido na URL.");
      setLoading(false);
    }
  }, [serviceIdFromParams, location.search]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const hNum = parseInt(duracaoHoras, 10);
    const mNum = parseInt(duracaoMinutos, 10);

    if (isNaN(hNum) || hNum < 0 || isNaN(mNum) || mNum < 0 || mNum > 59) {
      setError('Valores de duração inválidos. Horas devem ser >= 0 e Minutos devem ser entre 0-59.');
      setSaving(false);
      return;
    }
    if (hNum === 0 && mNum === 0) {
        setError('A duração não pode ser zero horas e zero minutos.');
        setSaving(false);
        return;
    }


    const formattedHoras = String(hNum).padStart(2, '0');
    const formattedMinutos = String(mNum).padStart(2, '0');
    const finalDuracao = `${formattedHoras}:${formattedMinutos}`;

    const serviceDataToUpdate = {
      titulo,
      preco: parseFloat(preco),
      comissao: parseInt(comissao, 10),
      duracao: finalDuracao, // Duração formatada
      descricao,
      status,
    };

    try {
      const response = await fetch(`http://localhost:3000/servicos/item/${serviceIdFromParams}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceDataToUpdate),
      });
      const result = await response.json();
      if (!response.ok || result.errorStatus) {
        throw new Error(result.mensageStatus || `Erro ao salvar. Status: ${response.status}`);
      }
      setSaving(false);
      navigate(`/servico/${serviceIdFromParams}${salaoId ? `?userId=${salaoId}` : ''}`);
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
      setError(err.message || 'Ocorreu um erro ao salvar as alterações.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/servico/${serviceIdFromParams}${salaoId ? `?userId=${salaoId}` : ''}`);
  };

  if (loading) return <div className={styles.loading}>Carregando dados do serviço para edição...</div>;
  
  if (error && !loading) return (
    <div className={styles.page}>
        <Sidebar userId={salaoId} />
        <div className={styles.mainArea}>
            <div className={styles.topBar}><h1 className={styles.pageTitle}>Editar Serviço</h1></div>
            <div className={styles.content}>
                <p className={styles.error}><strong>Erro:</strong> {error}</p>
                <button onClick={() => navigate(-1)} className={`${styles.button} ${styles.cancelBtn}`}>Voltar</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <Sidebar userId={salaoId} />
      <div className={styles.mainArea}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Editar Serviço</h1>
        </div>
        <div className={styles.content}>
          <form className={styles.form} onSubmit={handleSave}>
            <label>
              Título:
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </label>

            <label>
              Preço (R$):
              <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required />
            </label>

            <label>
              Comissão (%):
              <input type="number" value={comissao} onChange={(e) => setComissao(e.target.value)} min="0" max="100" required />
            </label>

            {/* Novo campo de Duração */}
            <div className={styles.formRowDuracao}> {/* Adicione estilos para .formRowDuracao se necessário */}
              <label htmlFor="duracaoHoras" className={styles.labelDuracao}>Duração:</label>
              <div className={styles.inputsWrapperDuracao}> {/* Adicione estilos para .inputsWrapperDuracao */}
                <input
                  id="duracaoHoras"
                  type="number"
                  value={duracaoHoras}
                  onChange={(e) => setDuracaoHoras(e.target.value)}
                  placeholder="HH"
                  min="0"
                  className={styles.duracaoInputField} // Crie esta classe no seu CSS module
                  required
                />
                <span className={styles.duracaoUnit}>H</span>
                <input
                  id="duracaoMinutos"
                  type="number"
                  value={duracaoMinutos}
                  onChange={(e) => setDuracaoMinutos(e.target.value)}
                  placeholder="MM"
                  min="0"
                  max="59"
                  className={styles.duracaoInputField} // Crie esta classe no seu CSS module
                  required
                />
                <span className={styles.duracaoUnit}>M</span>
              </div>
            </div>


            <label>
              Status:
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="Ativo">Ativo</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </label>

            <label className={styles.fullWidth}>
              Descrição:
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="6" required />
            </label>

            {error && <p className={`${styles.error} ${styles.fullWidth}`}>{error}</p>}

            <div className={`${styles.buttons} ${styles.fullWidth}`}>
              <button type="button" onClick={handleCancel} disabled={saving} className={`${styles.button} ${styles.cancelBtn}`}>
                Cancelar
              </button>
              <button type="submit" disabled={saving || loading} className={`${styles.button} ${styles.saveBtn}`}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}