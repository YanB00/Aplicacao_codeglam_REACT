import React from "react";
import styles from "./SettingsPage.module.css";
import SalonInfo from "../components/settings/SalonInfo";
import AdminProfile from "../components/settings/AdminProfile";
import ModuleActivations from "../components/settings/ModuleActivations"; 

export default function SettingsPage({ userId: propUserId,  onSalonDataUpdate }) { 

  return (

    <div className={styles.settingsPageContent}> 
      <div className={styles.topBar}>
        <h2 className={styles.topBarTitle}>Configurações</h2>
      </div>
      <SalonInfo userId={propUserId} onSalonDataUpdate={onSalonDataUpdate} />
      <AdminProfile userId={propUserId} onSalonDataUpdate={onSalonDataUpdate} />
      <ModuleActivations userId={propUserId} onSalonDataUpdate={onSalonDataUpdate} />
    </div>
  );
}