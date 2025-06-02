// EmployeePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaKey, FaBirthdayCake, FaIdCard, FaPhone, FaEnvelope, FaArrowLeft, FaTrashAlt } from 'react-icons/fa';
import EmployeeHistory from '../components/EmployeeHistory'; 
import styles from './EmployeePage.module.css';

export default function EmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 

  const getUserIdFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('userId');
  };
  const userId = getUserIdFromUrl();

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/funcionarios/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEmployee(data.data); 
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate(`/funcionarios?userId=${userId}`);
  };

  const handleEditClick = () => {
    if (employee) {
      navigate(`/funcionario/Editar/${employee.idFuncionario}?userId=${userId}`);
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmDeactivation = async () => {
    handleCloseConfirmModal();

    if (!employee) return; 

    try {
      const response = await fetch(`http://localhost:3000/funcionarios/deactivate/${employee.idFuncionario}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensageStatus || `HTTP error! status: ${response.status}`);
      }
      navigate(`/funcionarios?userId=${userId}`);
    } catch (e) {
      console.error('Erro ao desativar funcionário:', e);
      setError(e); 
    }
  };

  const formatList = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.topBar}>
            <button onClick={handleGoBack} className={styles.backButton}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
          <div className={styles.mainContent} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            Carregando detalhes do funcionário...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.topBar}>
            <button onClick={handleGoBack} className={styles.backButton}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
          <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Erro ao carregar detalhes do funcionário</h2>
            <p>{error.message}</p>
            <button className={styles.backButton} onClick={handleGoBack} style={{ marginTop: '20px' }}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.topBar}>
            <button onClick={handleGoBack} className={styles.backButton}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
          <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Funcionário não encontrado</h2>
            <button className={styles.backButton} onClick={handleGoBack} style={{ marginTop: '20px' }}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <FaArrowLeft /> Voltar
          </button>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
              <img src={employee.foto ? `http://localhost:3000/uploads/${employee.foto}` : 'https://placehold.co/150'} alt={employee.nomeCompleto} /> {/* URL_DA_IMAGEM_PADRAO */}
              <h2>{employee.nomeCompleto}</h2>
              <div className={styles.underline} />
              <p className={styles.since}>Funcionário desde {new Date(employee.dataAdmissao).toLocaleDateString()}</p>
            </div>

            <div className={styles.infoItem}><FaKey /> <span>ID: #{employee.idFuncionario}</span></div>
            <div className={styles.infoItem}><FaBirthdayCake /> <span>Nascimento: {new Date(employee.dataNascimento).toLocaleDateString()}</span></div>
            <div className={styles.infoItem}><FaIdCard /> <span>CPF: {employee.cpf}</span></div>
            <div className={styles.infoItem}><FaPhone /> <span>Telefone: {employee.telefone}</span></div>
            <div className={styles.infoItem}><FaEnvelope /> <span>Email: {employee.email}</span></div>
          </div>

          <div className={styles.detailsCard}>
            <h3>Informações do Funcionário</h3>
            {employee.servicosRealizados && (
              <p>
                <strong>Especialidades:</strong> {formatList(employee.servicosRealizados)}
              </p>
            )}
            {!employee.servicosRealizados && (
              <p><strong>Especialidades:</strong> Não especificado</p>
            )}
            {employee.beneficios && (
              <p>
                <strong>Benefícios:</strong> {formatList(employee.beneficios)}
              </p>
            )}
            {!employee.beneficios && (
              <p><strong>Benefícios:</strong> Não especificados</p>
            )}
            {employee.informacoesAdicionais && (
              <p>
                <strong>Informações adicionais:</strong> {formatList(employee.informacoesAdicionais)}
              </p>
            )}
            {!employee.informacoesAdicionais && (
              <p><strong>Informações adicionais:</strong> Nenhuma</p>
            )}

            <div className={styles.buttonContainer}>
              <button className={styles.button} onClick={handleEditClick}>
                Atualizar
              </button>
              <button className={`${styles.button} ${styles.deleteButton}`} onClick={handleOpenConfirmModal}>
                <FaTrashAlt /> Apagar
              </button>
            </div>
          </div>
        </div>

        <div className={styles.historySection}>
=          {employee.salaoId ? (
            <EmployeeHistory 
              employeeId={employee.idFuncionario} 
              userId={userId}  
              salaoId={employee.salaoId} 
            />
          ) : (
            <p>Carregando histórico de atendimentos e filtros...</p> 
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirmar Desativação</h3>
            <p>Tem certeza que deseja desativar este funcionário?</p>
            <div className={styles.modalActions}>
              <button className={`${styles.button} ${styles.modalCancelButton}`} onClick={handleCloseConfirmModal}>
                Cancelar
              </button>
              <button className={`${styles.button} ${styles.modalConfirmButton}`} onClick={handleConfirmDeactivation}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}