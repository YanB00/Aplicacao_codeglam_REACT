
//lista de aniversariantes
import React, { useState } from 'react';
import styles from './BirthdayList.module.css';
import { FaUserCircle } from 'react-icons/fa'; 
import BirthdayModal from './BirthdayModal';

const people = [
  {
    id: '12345',
    name: 'Amanda Souza',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
    birthdate: '1990-04-10', 
    since: '2018-06-12',
    favorites: ['Corte', 'Coloração'],
  },
  {
    name: 'Ana Maria',
    img: '',
    birthdate: '1985-04-18',
    since: '2020-01-15',
    favorites: ['Luzes'],
  },
  {
    name: 'Geovanna',
    img: 'https://randomuser.me/api/portraits/women/32.jpg',
    birthdate: '1998-04-25',
    since: '2022-09-30',
    favorites: ['Hidratação'],
  },
  {
    name: 'Larissa Nunes',
    img: 'https://randomuser.me/api/portraits/women/60.jpg',
    birthdate: '1993-04-03',
    since: '2019-11-07',
    favorites: ['Escova', 'Progressiva'],
  },
];

export default function BirthdayList() {
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Aniversariantes do mês</h3>
      <div className={styles.list}>
        {people.map((p, i) => (
          <div
            key={i}
            className={styles.personWrapper}
            onClick={() => setSelected(selected === i ? null : i)}
          >
            <div className={styles.person}>
              <div className={styles.avatar}>
                {p.img ? (
                  <img src={p.img} alt={p.name} />
                ) : (
                  <div className={styles.placeholder}>👤</div>
                )}
              </div>
              <span>{p.name}</span>
            </div>

            {selected === i && (
              <div className={styles.inlineModal}>
                <BirthdayModal person={p} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
