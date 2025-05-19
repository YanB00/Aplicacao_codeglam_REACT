//popup que surge na home aapos clicar nas cards de cima

import React from 'react';
import styles from './ModalInfo.module.css';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';

export default function ModalInfo({ title, data, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoClose size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {data.map((item, index) => (
            <div key={index} className={`${styles.card} ${styles[item.color]}`}>
              {item.time && <p className={styles.time}>{item.time}</p>}
              <p className={styles.name}>{item.name}</p>
              <p className={styles.service}>{item.service}</p>
              {item.note && <p className={styles.note}>{item.note}</p>}
            </div>
          ))}
        </div>

        <div className={styles.footer}>

        <Link className={styles.moreLink} to={'/calendario'}>
            Ver mais
        </Link>
        
        </div>
      </div>
    </div>
  );
}
