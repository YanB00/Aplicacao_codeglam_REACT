// pages/SettingsPage.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import styles from "./SettingsPage.module.css";
import SalonInfo from "../components/settings/SalonInfo";
import AdminProfile from "../components/settings/AdminProfile";
import StaffPermissions from "../components/settings/StaffPermissions";
import Interactions from "../components/settings/Interactions";
import SecurityBackup from "../components/settings/SecurityBackup";

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <Sidebar />
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