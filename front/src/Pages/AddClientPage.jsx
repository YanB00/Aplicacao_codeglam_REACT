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
  const [clienteDesde, setClienteDesde] = useState('');
  const [favoritos, setFavoritos] = useState('');
  const [problemasSaude, setProblemasSaude] = useState('');
  const [informacoesAdicionais, setInformacoesAdicionais] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setUserId(params.get('userId'));
    console.log('UserID na AddClientPage:', params.get('userId'));
  }, [location.search]);

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
          setCpf(value);
          break;
        case 'startDate':
          setClienteDesde(value);
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
          setTelefone(value);
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

    const formData = new FormData();
    formData.append('nomeCompleto', nomeCompleto);
    formData.append('dataNascimento', dataNascimento);
    formData.append('cpf', cpf);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.mensageStatus}`);
      }

      // Limpar os campos do formulário após o sucesso
      setNomeCompleto('');
      setDataNascimento('');
      setCpf('');
      setClienteDesde('');
      setFavoritos('');
      setProblemasSaude('');
      setInformacoesAdicionais('');
      setTelefone('');
      setEmail('');
      setFoto(null);

      if (userId) {
        navigate(`/clientes?userId=${userId}`);
      } else {
        navigate('/clientes');
      }

    } catch (error) {
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
                />
              </div>
              <div>
                <label htmlFor="birthdate">Data de nascimento</label>
                <input
                  id="birthdate"
                  type="date"
                  value={dataNascimento}
                  onChange={handleInputChange} 
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
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="startDate">Cliente desde</label>
                <input
                  id="startDate"
                  type="date"
                  value={clienteDesde}
                  onChange={handleInputChange} 
                />
              </div>
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
                />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  placeholder="juliana@gmail.com"
                  value={email}
                  onChange={handleInputChange} 
                />
              </div>
            </div>

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