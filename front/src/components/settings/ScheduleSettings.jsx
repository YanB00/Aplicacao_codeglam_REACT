import React, { useState, useEffect } from 'react';
import styles from './ScheduleSettings.module.css';
import axios from 'axios';

const daysOfWeekOrder = [
  { name: 'Domingo', key: 'domingo' },
  { name: 'Segunda-feira', key: 'segunda' },
  { name: 'Terça-feira', key: 'terca' },
  { name: 'Quarta-feira', key: 'quarta' },
  { name: 'Quinta-feira', key: 'quinta' },
  { name: 'Sexta-feira', key: 'sexta' },
  { name: 'Sábado', key: 'sabado' },
];

export default function ScheduleSettings({ userId }) { 
  const [registroId, setRegistroId] = useState(null);
  const [horarios, setHorarios] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (userId) {
      setRegistroId(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (registroId) {
      fetchHorarios();
    }
  }, [registroId]);

  const fetchHorarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/register/${registroId}`);
      const fetchedHorariosData = response.data.data.horariosFuncionamento; 

      const initialHorarios = {};
      daysOfWeekOrder.forEach(day => {
        initialHorarios[day.key] = {
          abre: (fetchedHorariosData[day.key] && fetchedHorariosData[day.key].abre) || '09:00',
          fecha: (fetchedHorariosData[day.key] && fetchedHorariosData[day.key].fecha) || '18:00',
          ativo: (fetchedHorariosData[day.key] && typeof fetchedHorariosData[day.key].ativo === 'boolean') ? fetchedHorariosData[day.key].ativo : false,
        };
        if (day.key === 'domingo' && (!fetchedHorariosData[day.key] || !fetchedHorariosData[day.key].ativo)) {
             initialHorarios[day.key].ativo = false;
             initialHorarios[day.key].abre = '00:00';
             initialHorarios[day.key].fecha = '00:00';
        }
         if (initialHorarios[day.key].ativo === true && initialHorarios[day.key].abre === '00:00' && initialHorarios[day.key].fecha === '00:00') {
             initialHorarios[day.key].abre = '09:00';
             initialHorarios[day.key].fecha = '18:00';
         }
      });
      setHorarios(initialHorarios);

    } catch (err) {
      console.error("Erro ao buscar horários de funcionamento:", err.response ? err.response.data : err);
      setError(err.response?.data?.mensageStatus || "Não foi possível carregar os horários de funcionamento.");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (dayKey, field, value) => {
    setHorarios(prevHorarios => ({
      ...prevHorarios,
      [dayKey]: {
        ...prevHorarios[dayKey],
        [field]: value,
      },
    }));
    setSaveMessage('');
  };

  const handleActiveToggle = (dayKey) => {
    setHorarios(prevHorarios => ({
      ...prevHorarios,
      [dayKey]: {
        ...prevHorarios[dayKey],
        ativo: !prevHorarios[dayKey].ativo,
        abre: !prevHorarios[dayKey].ativo ? '00:00' : (prevHorarios[dayKey].abre || '09:00'),
        fecha: !prevHorarios[dayKey].ativo ? '00:00' : (prevHorarios[dayKey].fecha || '18:00'),
      },
    }));
    setSaveMessage('');
  };

  const isValidTimeFormat = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

  const handleSave = async () => {
    setError(null);
    setSaveMessage('Salvando...');
    try {
    const horariosToSend = {};
    for (const day of daysOfWeekOrder) {
        const dayKey = day.key;
        const currentDayHorario = horarios[dayKey];

        if (currentDayHorario.ativo) {
        if (!isValidTimeFormat(currentDayHorario.abre)) {
            setError(`Horário de abertura inválido para ${day.name}: ${currentDayHorario.abre}. Use o formato HH:mm.`);
            setSaveMessage('');
            return;
        }
        if (!isValidTimeFormat(currentDayHorario.fecha)) {
            setError(`Horário de fechamento inválido para ${day.name}: ${currentDayHorario.fecha}. Use o formato HH:mm.`);
            setSaveMessage('');
            return;
        }

        const [abreHour, abreMinute] = currentDayHorario.abre.split(':').map(Number);
        const [fechaHour, fechaMinute] = currentDayHorario.fecha.split(':').map(Number);

          if (fechaHour * 60 + fechaMinute <= abreHour * 60 + abreMinute) {
            setError(`A hora de fechamento deve ser posterior à hora de abertura para ${day.name}.`);
            setSaveMessage('');
            return;
        }
        }
        horariosToSend[dayKey] = {
            abre: currentDayHorario.ativo ? currentDayHorario.abre : '00:00',
            fecha: currentDayHorario.ativo ? currentDayHorario.fecha : '00:00',
            ativo: currentDayHorario.ativo
        };
    }

      const response = await axios.put(`http://localhost:3000/register/${registroId}`, { horariosFuncionamento: horariosToSend }); 

    setSaveMessage('Horários salvos com sucesso!');
    setHorarios(response.data.data.horariosFuncionamento); 
    } catch (err) {
    console.error("Erro ao salvar horários de funcionamento:", err.response ? err.response.data : err);
    setError(err.response?.data?.mensageStatus || "Erro ao salvar os horários.");
    setSaveMessage('');
    }
};

if (loading) {
    return <div className={styles.scheduleSettingsContainer}>Carregando horários...</div>;
}

  return (
    <div className={styles.scheduleSettingsContainer}>
      <div className={styles.header}>
        <h3>Horários de Atendimento do Salão</h3>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {saveMessage && <div className={styles.saveMessage}>{saveMessage}</div>}
      <div className={styles.scheduleList}>
        {daysOfWeekOrder.map((day) => {
          const horario = horarios[day.key] || { abre: '00:00', fecha: '00:00', ativo: false };
          return (
            <div key={day.key} className={styles.dayRow}>
              <div className={styles.dayName}>
                {day.name}:
              </div>
              <div className={styles.timeInputs}>
                <input
                  type="time"
                  value={horario.abre}
                  onChange={(e) => handleTimeChange(day.key, 'abre', e.target.value)}
                  disabled={!horario.ativo}
                  className={styles.timeInput}
                />
                <span> às </span>
                <input
                  type="time"
                  value={horario.fecha}
                  onChange={(e) => handleTimeChange(day.key, 'fecha', e.target.value)}
                  disabled={!horario.ativo}
                  className={styles.timeInput}
                />
              </div>
              <div className={styles.activeToggle}>
                <label>
                  <input
                    type="checkbox"
                    checked={horario.ativo}
                    onChange={() => handleActiveToggle(day.key)}
                  />
                  Ativo
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={handleSave} className={styles.saveButton}>
        Salvar Horários
      </button>
    </div>
  );
}