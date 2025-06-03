// AllAppointmentsHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import styles from '../App.module.css';               
import AllAppointmentsHistory from '../components/AllAppointmentsHistory';
import { useLocation } from 'react-router-dom'; 

export default function AllAppointmentsHistoryPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let idFound = false;

    const urlParams = new URLSearchParams(location.search);
    const userIdFromUrl = urlParams.get('userId');

    if (userIdFromUrl) {
      setCurrentUserId(userIdFromUrl);
      idFound = true;
    }

    if (!idFound) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData._id) {
            setCurrentUserId(userData._id);
            idFound = true;
          }
        } catch (e) {
          console.error("Erro ao fazer parse do usuário do localStorage:", e);
        }
      }
    }

    if (!idFound) {
      console.warn("User ID (ID do salão) não encontrado na URL ou no localStorage.");
    }

  }, [location]); 

  if (!currentUserId) {
    return (
      <div className={styles.appContainer}>
        <Sidebar userId={null} /> 
        <div className={styles.mainContent}>
          <p>Carregando informações do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Sidebar userId={currentUserId} /> 
      <div className={styles.mainContent}>
        <AllAppointmentsHistory userId={currentUserId} /> 
      </div>
    </div>
  );
}