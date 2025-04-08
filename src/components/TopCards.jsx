import styles from './TopCards.module.css';
import { FaPlus } from 'react-icons/fa';

const cards = [
  { title: 'Agendamentos dia', value: '15 / 50' },
  { title: 'Agendamentos mês', value: '200 / 1.000' },
  { title: 'Cancelados', value: '01 / 1.000' },
];

export default function TopCards() {
  return (
    <div className={styles.cardRow}>
      {cards.map((card, i) => (
        <div key={i} className={styles.card}>
          <div>
            <p className={styles.title}>{card.title}</p>
            <p className={styles.value}>{card.value}</p>
          </div>
          <FaPlus className={styles.icon} />
        </div>
      ))}
    </div>
  );
}
