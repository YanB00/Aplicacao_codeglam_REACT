import React, { useState, useEffect } from 'react';
import ModalInfo from './ModalInfo';
import styles from './TopCards.module.css';
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom'; 
export default function TopCards({ salonId }) {
  const [openModals, setOpenModals] = useState({});
  const [canceledAppointments, setCanceledAppointments] = useState([]);
  const [dailyAppointments, setDailyAppointments] = useState([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState([]);


  const fetchAllSalonAppointments = async () => {
    if (!salonId) {
      console.warn('salonId é undefined. Não é possível buscar agendamentos.');
      setCanceledAppointments([]);
      setDailyAppointments([]);
      setMonthlyAppointments([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/agendamentos/salao/${salonId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dados recebidos para o Salão (bruto):', data);

      if (!data.errorStatus) {
        const allAppointments = data.data;

        const filteredCanceled = allAppointments.filter(app => app.cancelado);
        setCanceledAppointments(filteredCanceled);

        const today = new Date().toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'America/Sao_Paulo'
        });
        const filteredDaily = allAppointments.filter(app => {
          const appDate = new Date(app.dataAgendamento).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/Sao_Paulo'
          });
          return appDate === today && !app.cancelado;
        });
        setDailyAppointments(filteredDaily);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const filteredMonthly = allAppointments.filter(app => {
          const appDate = new Date(app.dataAgendamento);
          return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear && !app.cancelado;
        });
        setMonthlyAppointments(filteredMonthly);

      } else {
        console.error('Error fetching salon appointments:', data.mensageStatus);
        setCanceledAppointments([]);
        setDailyAppointments([]);
        setMonthlyAppointments([]);
      }
    } catch (error) {
      console.error('Failed to fetch salon appointments:', error);
      setCanceledAppointments([]);
      setDailyAppointments([]);
      setMonthlyAppointments([]);
    }
  };

  useEffect(() => {
    fetchAllSalonAppointments();
  }, [salonId]); 

  const toggleModal = (index) => {
    setOpenModals((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const cards = [
    {
      title: 'Agendados do Dia',
      value: dailyAppointments.length,
      color: '#a678e2',
      data: dailyAppointments.map(app => ({
        time: app.horaInicio.substring(0, 5),
        name: app.clienteId ? app.clienteId.nomeCompleto : 'N/A',
        service: app.servicoId ? app.servicoId.titulo : 'N/A',
        color: 'blue'
      })),
    },
    {
      title: 'Agendados do Mês',
      value: monthlyAppointments.length,
      color: '#6698ED',
      data: [
        { name: `Total: ${monthlyAppointments.length} agendamentos`, service: 'Detalhes no Agendamento', color: 'blue' },
      ],
    },
    {
      title: 'Cancelamentos',
      value: canceledAppointments.length,
      color: '#D671D3',
      data: canceledAppointments.map(app => ({
        name: app.clienteId ? app.clienteId.nomeCompleto : 'N/A',
        service: app.servicoId ? app.servicoId.titulo : 'N/A',
        note: app.observacoes || 'Nenhuma observação',
        color: 'pink'
      })),
    },
  ];

  return (
    <div className={styles.cardsContainer}>
      {cards.map((card, index) => (
        <div
          key={index}
          className={styles.cardWrapper}
        >
          <div
            className={styles.card}
            style={{ borderBottom: `4px solid ${card.color}` }}
          >
            <div className={styles.cardContent}>
              <div>
                <h4>{card.title}</h4>
                <p className={styles.value}>{card.value}</p>
              </div>
              <button
                className={styles.addButton}
                onClick={() => toggleModal(index)}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {openModals[index] && (
            <>
              <div className={styles.overlayBackground} />
              <div className={styles.popup}>
                <ModalInfo
                  title={card.title}
                  data={card.data}
                  onClose={() => toggleModal(index)}
                  salonId={salonId} 
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}