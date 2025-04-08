import styles from './BirthdayList.module.css';

const people = [
  { name: 'Amanda Souza', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Ana Maria', img: '' },
  { name: 'Geovanna', img: 'https://randomuser.me/api/portraits/women/32.jpg' },
  { name: 'Larissa Nunes', img: 'https://randomuser.me/api/portraits/women/60.jpg' },
];

export default function BirthdayList() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Aniversariantes do mês</h3>
      <div className={styles.list}>
        {people.map((p, i) => (
          <div key={i} className={styles.person}>
            <div className={styles.avatar}>
              {p.img ? (
                <img src={p.img} alt={p.name} />
              ) : (
                <div className={styles.placeholder}>👤</div>
              )}
            </div>
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
