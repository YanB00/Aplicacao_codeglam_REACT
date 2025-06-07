import React, { useState, useEffect } from 'react'; 
import ModalInfo from './ModalInfo';
import styles from './TopCards.module.css';
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function TopCards() {
  const [openModals, setOpenModals] = useState({});
  const [canceledAppointments, setCanceledAppointments] = useState([]);
  const [dailyAppointments, setDailyAppointments] = useState([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState([]);


  // Function to fetch canceled appointments
  const fetchCanceledAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/agendamentos/cancelados'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dados recebidos para Cancelamentos:', data);
      if (!data.errorStatus) {
        setCanceledAppointments(data.data);
      } else {
        console.error('Error fetching canceled appointments:', data.mensageStatus);
      }
    } catch (error) {
      console.error('Failed to fetch canceled appointments:', error);
    }
  };

  // Function to fetch daily appointments
  const fetchDailyAppointments = async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Sao_Paulo' 
        });
      console.log('Data de hoje para busca (Frontend):', today);
      const response = await fetch(`http://localhost:3000/agendamentos/data/${today}`); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
        console.log('Dados recebidos para Agendados do Dia (BRUTO):', data);
      if (!data.errorStatus) {
        const filteredAppointments = data.data.filter(app => !app.cancelado);
        setDailyAppointments(filteredAppointments);
      } else {
        console.error('Error fetching daily appointments:', data.mensageStatus);
      }
    } catch (error) {
      console.error('Failed to fetch daily appointments:', error);
    }
  };

  const fetchMonthlyAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/agendamentos'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dados recebidos para Agendados do Mês:', data);
      if (!data.errorStatus) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const filteredMonthlyAppointments = data.data.filter(app => {
          const appDate = new Date(app.dataAgendamento);
          return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear && !app.cancelado;
        });
        setMonthlyAppointments(filteredMonthlyAppointments);
      } else {
        console.error('Error fetching monthly appointments:', data.mensageStatus);
      }
    } catch (error) {
      console.error('Failed to fetch monthly appointments:', error);
    }
  };


  useEffect(() => {
    fetchCanceledAppointments();
    fetchDailyAppointments();
    fetchMonthlyAppointments();
  }, []);

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
        { name: `Total: ${monthlyAppointments.length} agendamentos`, service: 'Detalhes no relatório mensal', color: 'blue' },
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
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}