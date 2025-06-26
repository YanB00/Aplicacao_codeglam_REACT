import React from "react";
import styles from "./SettingsPage.module.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import SalonInfo from "../components/settings/SalonInfo";
import AdminProfile from "../components/settings/AdminProfile";
import ModuleActivations from "../components/settings/ModuleActivations";
import ScheduleSettings from "../components/settings/ScheduleSettings";
import DropAccount from "../components/settings/DropAccount";
import SupportContact from "../components/settings/SupportContact";

export default function SettingsPage({ userId: propUserId, onSalonDataUpdate, onLogout }) { 
  return (
    <div className={styles.settingsPageContent}>
      <div className={styles.topBar}>
        <h2 className={styles.topBarTitle}>Configurações</h2>
        <button onClick={onLogout} className={styles.logoutButton} aria-label="Desligar">
          <i className="fas fa-power-off"></i> 
        </button>
      </div>
      <SalonInfo userId={propUserId} onSalonDataUpdate={onSalonDataUpdate} />
      <ScheduleSettings userId={propUserId} />
      <AdminProfile userId={propUserId} onSalonDataUpdate={onSalonDataUpdate} />
      <ModuleActivations userId={propUserId} onSalonDataUpdate={onSalonDataUpdate} />

        <SupportContact />

      <div className={styles.section}><DropAccount userId={propUserId} onLogout={onLogout} /></div>
    </div>
  );
}