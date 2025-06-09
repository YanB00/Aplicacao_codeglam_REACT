import React, { useState, useEffect } from "react";
import styles from "./SettingsSection.module.css"; 

const BASE_URL = 'http://localhost:3000';
const moduleNames = {
    clientes: 'Módulo Clientes',
    funcionarios: 'Módulo Funcionários',
    servicos: 'Módulo Serviços',
    agenda: 'Módulo Agenda',
    historico: 'Módulo Histórico',
};

export default function ModuleActivations({ userId , onSalonDataUpdate}) {
    const [modules, setModules] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);

    useEffect(() => {
        const fetchModuleStatus = async () => {
            if (!userId) {
                console.warn("ModuleActivations: userId not available, cannot fetch module status.");
                setLoading(false);
                setError("ID do salão não fornecido. Não é possível carregar o status dos módulos.");
                return;
            }

            setLoading(true);
            setError(null);
            setMessage(null);
            setMessageType(null);

            try {
                const response = await fetch(`${BASE_URL}/register/${userId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.mensageStatus || `Falha ao carregar status dos módulos. Status: ${response.status}`);
                }
                const result = await response.json();

                if (result.errorStatus || !result.data) {
                    throw new Error(result.mensageStatus || 'Erro ao processar dados de status dos módulos.');
                }

                const salonData = result.data;
                setModules(salonData.modulosAtivos || {});

            } catch (err) {
                console.error("Erro ao buscar status dos módulos:", err);
                setError(err.message || "Ocorreu um erro ao carregar o status dos módulos.");
            } finally {
                setLoading(false);
            }
        };

        fetchModuleStatus();
    }, [userId, BASE_URL]);

    const handleChangeModuleStatus = (moduleName, isChecked) => {
        setModules(prevModules => ({
            ...prevModules,
            [moduleName]: isChecked
        }));
        setMessage(null);
        setMessageType(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setMessage(null);
        setMessageType(null);

        if (!userId) {
            setMessage("ID do salão não fornecido. Não é possível salvar.", 'error');
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/register/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modulosAtivos: modules }), 
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.mensageStatus || `Falha ao salvar status dos módulos. Status: ${response.status}`);
            }

            const result = await response.json();
            if (result.errorStatus) {
                throw new Error(result.mensageStatus || 'Erro retornado pelo backend ao salvar.');
            }

            // setMessage("Status dos módulos salvo com sucesso!", 'success');
            if (onSalonDataUpdate) {
                onSalonDataUpdate(); 
            }
        } catch (err) {
            console.error("Erro ao salvar status dos módulos:", err);
            setMessage(err.message || "Ocorreu um erro ao salvar o status dos módulos.", 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className={styles.section}>
                <h2>Ativar/Desativar Módulos</h2>
                <p>Carregando status dos módulos...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.section}>
                <h2>Ativar/Desativar Módulos</h2>
                <p className={styles.errorMessage}>Erro: {error}</p>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <h2>Ativar/Desativar Módulos</h2>
            {message && (
                <div className={`${styles.alert} ${messageType === 'error' ? styles.error : styles.success}`}>
                    {message}
                </div>
            )}
            <div className={styles.moduleList}>
                {Object.keys(moduleNames).map(moduleKey => (
                    <label key={moduleKey} className={styles.moduleItem}>
                        <input
                            type="checkbox"
                            checked={!!modules[moduleKey]} 
                            onChange={(e) => handleChangeModuleStatus(moduleKey, e.target.checked)}
                            disabled={saving}
                        />
                        {moduleNames[moduleKey]}
                    </label>
                ))}
            </div>
            <button className={styles.salvar} onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
            </button>
        </section>
    );
}