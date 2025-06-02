import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AddClientPage.module.css';
import { FaCamera } from 'react-icons/fa';

export default function AddClientPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [favoritos, setFavoritos] = useState('');
  const [problemasSaude, setProblemasSaude] = useState('');
  const [informacoesAdicionais, setInformacoesAdicionais] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState(null);
  const [cpfError, setCpfError] = useState('');
  const [messageStatus, setMessageStatus] = useState(''); 
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setUserId(params.get('userId'));
    console.log('UserID na AddClientPage:', params.get('userId'));
  }, [location.search]);

  const validateCpf = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return false;
    }
    return true;
  };

  const formatCpf = (value) => {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value;
  };

  const formatPhone = (value) => {
    value = value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+)/, '($1) $2');
    }
    return value;
  };

  const handleInputChange = (e) => {
    const { id, value, type, files } = e.target;

    if (type === 'file') {
      setFoto(files[0]);
    } else {
      switch (id) {
        case 'fullName':
          setNomeCompleto(value);
          break;
        case 'birthdate':
          setDataNascimento(value);
          break;
        case 'cpf':
          const formattedCpf = formatCpf(value);
          setCpf(formattedCpf);
          if (formattedCpf.length === 14) {
            if (!validateCpf(formattedCpf)) {
              setCpfError('CPF inválido.');
            } else {
              setCpfError('');
            }
          } else {
            setCpfError('');
          }
          break;
        case 'favorites':
          setFavoritos(value);
          break;
        case 'healthIssues':
          setProblemasSaude(value);
          break;
        case 'additionalInfo':
          setInformacoesAdicionais(value);
          break;
        case 'tel':
          const formattedPhone = formatPhone(value);
          setTelefone(formattedPhone);
          break;
        case 'email':
          setEmail(value);
          break;
        default:
          break;
      }
    }
  };

  const handleCancel = () => {
    if (userId) {
      navigate(`/clientes?userId=${userId}`);
    } else {
      navigate('/clientes');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nomeCompleto || !dataNascimento || !cpf || !telefone || !email) {
      setMessageStatus('Por favor, preencha todos os campos obrigatórios.');
      setIsError(true);
      return;
    }

    if (cpfError) {
      setMessageStatus('Por favor, corrija o CPF inválido.');
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append('nomeCompleto', nomeCompleto);
    formData.append('dataNascimento', dataNascimento);
    formData.append('cpf', cpf.replace(/\D/g, '')); 
    
    const favoritosArray = favoritos.split(',').map(item => item.trim()).filter(item => item !== '');
    favoritosArray.forEach(fav => formData.append('favoritos', fav));

    formData.append('problemasSaude', problemasSaude);
    formData.append('informacoesAdicionais', informacoesAdicionais);
    formData.append('telefone', telefone);
    formData.append('email', email);
    if (foto) {
      formData.append('foto', foto);
    }

    try {
      const response = await fetch('http://localhost:3000/clientes', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json(); 

      if (!response.ok) {
        setMessageStatus(data.mensageStatus || 'Erro ao cadastrar cliente.');
        setIsError(true);
        console.error('Erro do Backend:', data.errorObject || data);
        return; 
      }

      setMessageStatus(data.mensageStatus || 'CLIENTE CADASTRADO COM SUCESSO');
      setIsError(false);

      setNomeCompleto('');
      setDataNascimento('');
      setCpf('');
      setFavoritos('');
      setProblemasSaude('');
      setInformacoesAdicionais('');
      setTelefone('');
      setEmail('');
      setFoto(null);
      setCpfError(''); 

      setTimeout(() => {
        if (userId) {
          navigate(`/clientes?userId=${userId}`);
        } else {
          navigate('/clientes');
        }
      }, 1000); 
      
    } catch (error) {
      setMessageStatus('Houve um erro ao enviar os dados. Verifique a conexão com o servidor.');
      setIsError(true);
      console.error('Erro na requisição:', error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topBar}></div>

        <div className={styles.formContainer}>
          <div className={styles.avatarSection}>
            <img
              src={foto ? URL.createObjectURL(foto) : "https://media.lordicon.com/icons/wired/gradient/21-avatar.gif"}
              alt="Avatar"
              className={styles.avatar}
            />

            <label htmlFor="avatar-upload" className={styles.cameraIcon}>
              <FaCamera />
              <input
                id="avatar-upload"
                type="file"
                hidden
                accept="image/*"
                onChange={handleInputChange}
              />
            </label>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div>
                <label htmlFor="fullName">Nome completo</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nome completo"
                  value={nomeCompleto}
                  onChange={handleInputChange}
                  required // Make this field required
                />
              </div>
              <div>
                <label htmlFor="birthdate">Data de nascimento</label>
                <input
                  id="birthdate"
                  type="date"
                  value={dataNascimento}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div>
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleInputChange}
                  maxLength="14"
                  required 
                />
                {cpfError && <p className={styles.errorMessage}>{cpfError}</p>}
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="favorites">Favoritos</label>
                <input
                  id="favorites"
                  type="text"
                  placeholder="Ex: Design de Unhas"
                  value={favoritos}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="healthIssues">Problemas de saúde</label>
                <input
                  id="healthIssues"
                  type="text"
                  placeholder="Ex: Nenhum"
                  value={problemasSaude}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="additionalInfo">Informações adicionais</label>
                <input
                  id="additionalInfo"
                  type="text"
                  placeholder="Prefere vir de manhã"
                  value={informacoesAdicionais}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="tel">Telefone</label>
                <input
                  id="tel"
                  type="text"
                  placeholder="(XX) XXXXX-XXXX"
                  value={telefone}
                  onChange={handleInputChange}
                  maxLength="15"
                  required 
                />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email" 
                  placeholder="juliana@gmail.com"
                  value={email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>

            {messageStatus && (
              <p className={isError ? styles.errorMessage : styles.successMessage}>
                {messageStatus}
              </p>
            )}

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className={styles.saveBtn}>
                Salvar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
