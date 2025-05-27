import React, { useState, useEffect } from 'react';
import styles from './AppointmentDetails.module.css';
import { AiOutlineClose } from 'react-icons/ai';

const API_BASE_URL = 'http://localhost:3000';

const AppointmentDetails = ({ event, onClose, onEdit, onAppointmentUpdate }) => {
  const [isConcluido, setIsConcluido] = useState(false);
  const [isCancelado, setIsCancelado] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (event) {
      console.log('AppointmentDetails useEffect, event received:', event);
      setIsConcluido(event.concluido || false);
      setIsCancelado(event.cancelado || false);
      setErrorMessage('');
    }
  }, [event]);

  if (!event) {
    return null;
  }

  const handleStatusChange = async (statusType, newValue) => {
    console.log(
      "Attempting to update status for event ID:",
      event.id,
      "| Type:", typeof event.id,
      "| Length:", event.id?.length
    );

    if (!event || !event.id || String(event.id).length < 24) {
      console.error("Event ID is missing or truncated in handleStatusChange:", event.id);
      setErrorMessage("Erro: ID do agendamento inválido ou não encontrado.");
      setIsUpdating(false);
      return;
    }

    setIsUpdating(true);
    setErrorMessage('');

    let payload = {};
    if (statusType === 'concluido') {
      payload = { concluido: newValue };
      if (newValue === true) { // Se está a marcar como concluído
        payload.cancelado = false; // Garante que cancelado é false
      }
    } else if (statusType === 'cancelado') {
      payload = { cancelado: newValue };
      if (newValue === true) { 
        payload.concluido = false; 
      }
    }
    console.log("Payload being sent to backend:", JSON.stringify(payload));

    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text(); 
      let responseData;

      try {
        responseData = JSON.parse(responseText); 
      } catch (parseError) {
        console.error("Failed to parse backend response as JSON. Raw text:", responseText);
        throw new Error(`Erro do servidor (não JSON): ${response.status} - ${responseText.substring(0,100)}...`);
      }
      
      console.log("Backend response data:", responseData);


      if (!response.ok) {
        throw new Error(responseData.mensageStatus || responseData.errorObject || `Falha ao atualizar o status: ${response.statusText}`);
      }

      if (responseData.data) {
 
        if (onAppointmentUpdate) {
          onAppointmentUpdate(responseData.data);
        }
      } else {
        console.warn("Resposta do backend não continha 'data'. Resposta:", responseData);
         if (onAppointmentUpdate) { 
          onAppointmentUpdate(responseData);
        }
      }

    } catch (error) {
      console.error("Erro ao atualizar status (catch frontend):", error);
      setErrorMessage(error.message || "Ocorreu um erro ao atualizar. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConcluidoChange = (e) => {
    const newConcluidoValue = e.target.checked;
    handleStatusChange('concluido', newConcluidoValue);
  };

  const handleCanceladoChange = (e) => {
    const newCanceladoValue = e.target.checked;
    handleStatusChange('cancelado', newCanceladoValue);
  };

  return (
    <div className={styles.detailsModalOverlay}>
      <div className={styles.detailsContainer}>
        <div className={styles.topBar} style={{ backgroundColor: event.color || '#6e6e6e' }}>
          <AiOutlineClose className={styles.closeIcon} onClick={onClose} />
        </div>
        <h3>{event.timeStart} - {event.timeEnd}</h3>
        <p><strong>Cliente:</strong> {event.client || 'Não especificado'}</p>
        <p><strong>Funcionário:</strong> {event.employee}</p>
        <p><strong>Serviço:</strong> {event.service}</p>
        {event.valor !== undefined && <p><strong>Valor:</strong> R$ {parseFloat(event.valor).toFixed(2)}</p>}
        {event.observacoes && <p><strong>Observações:</strong> {event.observacoes}</p>}

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.statusSection}>
          <div>
            <label htmlFor={`concluido-${event.id || 'temp'}`}>Concluído:</label>
            <input
              type="checkbox"
              id={`concluido-${event.id || 'temp'}`}
              checked={isConcluido}
              onChange={handleConcluidoChange}
              disabled={isUpdating || isCancelado} // Se cancelado, não pode ser concluído
            />
          </div>
          <div>
            <label htmlFor={`cancelado-${event.id || 'temp'}`}>Cancelado:</label>
            <input
              type="checkbox"
              id={`cancelado-${event.id || 'temp'}`}
              checked={isCancelado}
              onChange={handleCanceladoChange}
              disabled={isUpdating || isConcluido} // Se concluído, não pode ser cancelado
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.editButton}
            style={{ backgroundColor: event.color || '#007bff', color: 'white' }}
            onClick={() => onEdit(event)}
            disabled={isUpdating}
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
