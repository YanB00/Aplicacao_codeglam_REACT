import React from "react";
import { useLocation } from 'react-router-dom'; 
import styles from "./SettingsPage.module.css";
import Sidebar from "../components/Sidebar"; 
import SalonInfo from "../components/settings/SalonInfo";
import AdminProfile from "../components/settings/AdminProfile";
import StaffPermissions from "../components/settings/StaffPermissions";
import Interactions from "../components/settings/Interactions";
import SecurityBackup from "../components/settings/SecurityBackup";


export default function SettingsPage() { 
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId'); 


  return (
    <div className={styles.page}>
      <Sidebar userId={userId}/>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h2 className={styles.topBarTitle}>Configurações</h2>
        </div>
        <SalonInfo />
        <AdminProfile />
        <StaffPermissions />
        <Interactions />
        <SecurityBackup />
      </div>
    </div>
  );
}