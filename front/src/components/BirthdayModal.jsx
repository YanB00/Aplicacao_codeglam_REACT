import { FaHeart } from 'react-icons/fa';
import styles from './BirthdayModal.module.css';
import { Link } from 'react-router-dom';

export default function BirthdayModal({ person, onClose }) {
  if (!person) return null;

  const formatSince = (since) => {
    if (!since) return '';
    const [year, month] = since.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.header}>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
      </div>

      <div className={styles.avatar}>
        <img src={person.img} alt={person.name} />
      </div>

      <Link to={`/cliente/${person.id}`} className={styles.name}>
  {person.name}, {person.age}
</Link>

      <div className={styles.age}>
        {new Date(person.birthdate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </div>

      <div className={styles.since}>
        Cliente desde {formatSince(person.since)}
      </div>

      <div className={styles.favLabel}>Procedimentos favoritos:</div>
      <ul className={styles.favList}>
        {person.favorites.map((fav, index) => (
          <li key={index} className={styles.favItem}>
            <FaHeart /> {fav}
          </li>
        ))}
      </ul>
    </div>
  );
}
