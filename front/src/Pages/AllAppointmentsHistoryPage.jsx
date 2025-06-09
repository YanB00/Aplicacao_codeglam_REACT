import React, { useEffect } from 'react'; 
import AllAppointmentsHistoryComponent from '../components/AllAppointmentsHistory';
import { useLocation } from 'react-router-dom';

export default function AllAppointmentsHistoryPage({ userId: propUserId }) { 
    const location = useLocation(); 

    useEffect(() => {
        console.log("AllAppointmentsHistoryPage: Received propUserId:", propUserId);
        if (!propUserId) {
            console.warn("AllAppointmentsHistoryPage: userId prop is missing. History might not load.");
        }
    }, [propUserId]); 

    if (!propUserId) { 
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                <p>Carregando informações do usuário para o histórico...</p>
            </div>
        );
    }

    return (
        <>
            <AllAppointmentsHistoryComponent userId={propUserId} />
        </>
    );
}