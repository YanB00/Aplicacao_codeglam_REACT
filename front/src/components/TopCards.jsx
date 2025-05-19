//os cards q mostram na home


import React, { useState } from 'react';
import ModalInfo from './ModalInfo';
import styles from './TopCards.module.css';
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function TopCards() {
  const [openModals, setOpenModals] = useState({});

  const toggleModal = (index) => {
    setOpenModals((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const cards = [
    {
      title: 'Agendados do Dia',
      value: 8,
      color: '#a678e2',
      data: [
        { time: '08:00', name: 'Ana', service: 'Corte', color: 'pink' },
        { time: '09:00', name: 'Bruno', service: 'Coloração', color: 'purple' },
        { time: '10:30', name: 'Clara', service: 'Progressiva', color: 'blue' },
      ],
    },
    {
      title: 'Agendados do Mês',
      value: 35,
      color: '#6698ED',
      data: [
        { name: 'Total: 35 agendamentos', service: 'Detalhes no relatório mensal', color: 'blue' },
      ],
    },
    {
      title: 'Cancelamentos',
      value: 2,
      color: '#D671D3',
      data: [
        { name: 'Maria', service: 'Luzes', note: 'Cliente reagendou', color: 'pink' },
      ],
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
