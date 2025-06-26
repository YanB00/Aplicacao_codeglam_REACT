import React, { useState } from 'react';
import styles from './DropAccount.module.css';
import Swal from 'sweetalert2'; 
import withReactContent from 'sweetalert2-react-content'; 

const MySwal = withReactContent(Swal); 

export default function DropAccount({ userId, onLogout }) {
    const [confirmInput, setConfirmInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        if (confirmInput !== 'EXCLUIR') {
            setError('Por favor, digite "EXCLUIR" para confirmar.');
            return;
        }

        const result = await MySwal.fire({
            title: 'Tem certeza?',
            html: (
                <div>
                    <p>Você está prestes a desativar o cadastro do seu salão.</p>
                    <p>Esta ação é irreversível e seu salão NÃO estará mais visível ou acessível. Para reativá-lo, você precisará entrar em contato com o suporte.</p>
                    <p style={{ color: 'red', fontWeight: 'bold' }}>Confirma a desativação?</p>
                </div>
            ),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545', 
            cancelButtonColor: '#6c757d', 
            confirmButtonText: 'Sim, desativar!',
            cancelButtonText: 'Não, cancelar',
            reverseButtons: true, 
            focusCancel: true, 
            customClass: { 
                popup: styles.customPopup,
                confirmButton: styles.customConfirmButton,
                cancelButton: styles.customCancelButton,
                title: styles.customTitle,
                htmlContainer: styles.customHtmlContainer,
            }
        });

        if (!result.isConfirmed) { 
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:3000/register/soft-delete/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && !data.errorStatus) {
                MySwal.fire({
                    title: 'Sucesso!',
                    text: 'Cadastro do salão desativado com sucesso!',
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                });
                onLogout(); 
            } else {
                setError(data.mensageStatus || 'Erro ao desativar o cadastro do salão.');
                MySwal.fire({
                    title: 'Erro!',
                    text: data.mensageStatus || 'Erro ao desativar o cadastro do salão.',
                    icon: 'error',
                    confirmButtonColor: '#dc3545',
                });
                console.error('Erro ao desativar conta:', data.errorObject || data.mensageStatus);
            }
        } catch (err) {
            setError('Erro de conexão ao tentar desativar o cadastro. Tente novamente.');
            MySwal.fire({
                title: 'Erro de Conexão!',
                text: 'Não foi possível conectar ao servidor. Tente novamente.',
                icon: 'error',
                confirmButtonColor: '#dc3545',
            });
            console.error('Erro na requisição de exclusão:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className={styles.dropAccountTitle}>Desativar Cadastro do Salão</h2>
            <p className={styles.dropAccountText}>
                Ao desativar o cadastro do seu salão, ele não estará mais visível ou acessível para novos agendamentos e seu painel será desativado. Você precisará entrar em contato com o suporte para reativá-lo, se desejar.
            </p>
            <p className={styles.warning}>
                Para confirmar a desativação, digite "EXCLUIR" no campo abaixo:
            </p>
            <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
                placeholder="DIGITE EXCLUIR"
                className={styles.confirmInput}
                disabled={loading}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
            <button
                onClick={handleDeleteAccount}
                className={styles.dropButton}
                disabled={loading || confirmInput !== 'EXCLUIR'}
            >
                {loading ? 'Desativando...' : 'Desativar Meu Salão'}
            </button>
        </>
    );
}