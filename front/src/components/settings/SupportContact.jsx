import React from 'react';
import styles from './SupportContact.module.css'; 

export default function SupportContact() {
    const supportEmail = 'innobytecodeglam@gmail.com'; 

    return (
        <div className={styles.supportContactModule}>
            <h3 className={styles.supportContactTitle}>Precisa de Suporte?</h3>
            <p className={styles.supportContactText}>
                Em caso de dúvidas, problemas ou para reativar seu cadastro após a desativação, nossa equipe de suporte está pronta para ajudar.
            </p>
            <p className={styles.supportEmail}>
                Entre em contato conosco através do e-mail: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>
        </div>
    );
}