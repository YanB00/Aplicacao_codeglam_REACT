import React, { useState, useEffect } from 'react';
import styles from './BirthdayList.module.css';
import { FaUserCircle } from 'react-icons/fa';
import BirthdayModal from './BirthdayModal';

const API_BASE_URL = 'http://localhost:3000'; 

export default function BirthdayList() {
  const [selected, setSelected] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/clientes/birthdays/currentMonth`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.errorStatus) {
          throw new Error(data.mensageStatus || 'Erro ao buscar aniversariantes.');
        }

        const formattedBirthdays = data.data.map(client => {
          const birthDate = new Date(client.dataNascimento);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          return {
            id: client._id,
            name: client.nomeCompleto,
            img: client.foto ? `${API_BASE_URL}/${client.foto}` : null,
            birthdate: client.dataNascimento, 
            favorites: Array.isArray(client.favoritos) ? client.favoritos : [],
            email: client.email,
            telefone: client.telefone,
            problemasSaude: client.problemasSaude,
            informacoesAdicionais: client.informacoesAdicionais,
            age: age,
          };
        });
        setBirthdays(formattedBirthdays);
      } catch (err) {
        console.error("Failed to fetch birthdays:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  if (loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Aniversariantes do mês</h3>
        <div className={styles.list}>
          <p>Carregando aniversariantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Aniversariantes do mês</h3>
        <div className={styles.list}>
          <p>Erro ao carregar aniversariantes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Aniversariantes do mês</h3>
      <div className={styles.list}>
        {birthdays.length === 0 ? (
          <p>Nenhum aniversariante neste mês.</p>
        ) : (
          birthdays.map((p, i) => (
            <div
              key={p.id}
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
          ))
        )}
      </div>
    </div>
  );
}