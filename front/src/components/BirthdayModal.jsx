// BirthdayModal.jsx
import { FaHeart } from 'react-icons/fa';
import styles from './BirthdayModal.module.css';
import { Link } from 'react-router-dom';

export default function BirthdayModal({ person, onClose }) {
  if (!person) return null;

  const formatSince = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) { 
        return 'Invalid Date';
      }
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
      });
    } catch (e) {
      console.error("Error formatting 'since' date:", e);
      return 'Invalid Date';
    }
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.header}>
        {onClose && <button onClick={onClose} className={styles.closeButton}>✕</button>}
      </div>

      <div className={styles.avatar}>
        {person.img ? (
          <img src={person.img} alt={person.name} />
        ) : (
          <div className={styles.placeholderLarge}>👤</div> 
        )}
      </div>

      <Link to={`/cliente/${person.id}`} className={styles.name}>
        {person.name} {person.age ? `, ${person.age}` : ''}
      </Link>

      <div className={styles.age}>
        {new Date(person.birthdate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </div>

      {person.favorites && person.favorites.length > 0 && ( 
        <>
          <div className={styles.favLabel}>Procedimentos favoritos:</div>
          <ul className={styles.favList}>
            {person.favorites.map((fav, index) => (
              <li key={index} className={styles.favItem}>
                <FaHeart /> {fav}
              </li>
            ))}
          </ul>
        </>
      )}

    </div>
  );
}