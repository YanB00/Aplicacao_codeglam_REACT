import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import styles from './EditEmployeePage.module.css'; 
import { FaCamera } from 'react-icons/fa';

export default function EditClientPage() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 

  const [clientData, setClientData] = useState({
    nomeCompleto: '', 
    dataNascimento: '', 
    cpf: '',
    idCliente: '', 
    clienteDesde: '', 
    favoritos: '',
    problemasSaude: '',
    informacoesAdicionais: '',
    telefone: '', 
    email: '',
    foto: 'https://via.placeholder.com/150', 
    newFotoFile: null, 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cpfError, setCpfError] = useState(''); 
  const [messageStatus, setMessageStatus] = useState(''); 
  const [isError, setIsError] = useState(false); 

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

  // Utility function to format CPF
  const formatCpf = (value) => {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value;
  };

  // Utility function to format phone
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

  useEffect(() => {
    console.log("EditClientPage - ID do cliente da URL:", id); // Log para depuração
    const fetchClientData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/clientes/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Cliente não encontrado.');
          }
          throw new Error(`Erro ao buscar cliente: ${response.statusText}`);
        }
        const result = await response.json(); 

        if (result.errorStatus) {
            throw new Error(result.mensageStatus || 'Erro desconhecido ao buscar cliente.');
        }

        const data = result.data; 

        setClientData({
          nomeCompleto: data.nomeCompleto || '',
          dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString().split('T')[0] : '',
          cpf: data.cpf ? formatCpf(data.cpf) : '', 
          idCliente: data.idCliente || '',
          clienteDesde: data.dataCadastro ? new Date(data.dataCadastro).toISOString().split('T')[0] : '',
          favoritos: Array.isArray(data.favoritos) ? data.favoritos.join(', ') : (data.favoritos || ''),
          problemasSaude: data.problemasSaude || '',
          informacoesAdicionais: data.informacoesAdicionais || '',
          telefone: data.telefone ? formatPhone(data.telefone) : '', 
          email: data.email || '',
          foto: data.foto ? `http://localhost:3000/${data.foto.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150', 
          newFotoFile: null, 
        });
      } catch (e) {
        setError("Não foi possível carregar os dados do cliente: " + e.message);
        console.error("Erro ao buscar dados do cliente:", e);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClientData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'cpf') {
      const formattedCpf = formatCpf(value);
      setClientData((prevData) => ({
        ...prevData,
        cpf: formattedCpf,
      }));
      if (formattedCpf.length === 14) {
        if (!validateCpf(formattedCpf)) {
          setCpfError('CPF inválido.');
        } else {
          setCpfError('');
        }
      } else {
        setCpfError('');
      }
    } else if (id === 'telefone') {
      const formattedPhone = formatPhone(value);
      setClientData((prevData) => ({
        ...prevData,
        telefone: formattedPhone,
      }));
    }
    else {
      setClientData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientData((prevData) => ({
          ...prevData,
          foto: reader.result, 
          newFotoFile: file, 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessageStatus('');
    setIsError(false);

    if (!clientData.nomeCompleto || !clientData.dataNascimento || !clientData.cpf || !clientData.telefone || !clientData.email) {
      setMessageStatus('Por favor, preencha todos os campos obrigatórios.');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (cpfError) { 
      setMessageStatus('Por favor, corrija o CPF inválido.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('nomeCompleto', clientData.nomeCompleto);
    formData.append('dataNascimento', clientData.dataNascimento);
    formData.append('cpf', clientData.cpf.replace(/\D/g, '')); 
    
    const favoritosArray = clientData.favoritos.split(',').map(item => item.trim()).filter(item => item !== '');
    favoritosArray.forEach(fav => formData.append('favoritos', fav));

    formData.append('problemasSaude', clientData.problemasSaude);
    formData.append('informacoesAdicionais', clientData.informacoesAdicionais);
    formData.append('telefone', clientData.telefone.replace(/\D/g, ''));
    formData.append('email', clientData.email);

    if (clientData.newFotoFile) {
      formData.append('foto', clientData.newFotoFile);
    }

    try {
      const response = await fetch(`http://localhost:3000/clientes/${id}`, {
        method: 'PUT', 
        body: formData, 
      });

      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.mensageStatus || 'Erro desconhecido'}`);
      }

      const result = await response.json();
      console.log('Dados atualizados com sucesso:', result);
      setMessageStatus('Cliente atualizado com sucesso!');
      setIsError(false);
      
      const navigatePath = `/cliente/${id}`; 
      console.log('Tentando navegar para:', navigatePath); 
      setTimeout(() => {
        navigate(navigatePath); 
      }, 1500);

    } catch (e) {
      setError("Não foi possível atualizar os dados do cliente: " + e.message);
      setMessageStatus("Não foi possível atualizar os dados do cliente: " + e.message);
      setIsError(true);
      console.error("Erro ao atualizar dados do cliente:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Carregando dados do cliente...</div>;
  }

  if (error) {
    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <div className={styles.topBar}></div>
                <div className={styles.mainContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2>Erro: {error}</h2>
                    <button className={styles.backButton} onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topBar}></div>

        <div className={styles.formContainer}>
          <div className={styles.avatarSection}>
            <img
              src={clientData.foto} 
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
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div>
                <label htmlFor="nomeCompleto">Nome completo</label> 
                <input
                  id="nomeCompleto" 
                  type="text"
                  placeholder="Nome completo"
                  value={clientData.nomeCompleto}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="dataNascimento">Data de nascimento</label> 
                <input
                  id="dataNascimento" 
                  type="date"
                  value={clientData.dataNascimento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={clientData.cpf}
                  onChange={handleChange}
                  maxLength="14"
                  required
                />
                {cpfError && <p className={styles.errorMessage}>{cpfError}</p>} 
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="idCliente">ID do Cliente</label> 
                <input
                  id="idCliente" 
                  type="text"
                  placeholder="12345"
                  value={clientData.idCliente}
                  onChange={handleChange}
                  disabled 
                />
              </div>
              <div>
                <label htmlFor="clienteDesde">Cliente desde</label> 
                <input
                  id="clienteDesde" 
                  type="date"
                  value={clientData.clienteDesde}
                  onChange={handleChange}
                  disabled 
                />
              </div>
              <div>
                <label htmlFor="favoritos">Favoritos</label>
                <input
                  id="favoritos"
                  type="text"
                  placeholder="Ex: Designer de Unhas"
                  value={clientData.favoritos}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="problemasSaude">Problemas de saúde</label> 
                <input
                  id="problemasSaude" 
                  type="text"
                  placeholder="Ex: Nenhum"
                  value={clientData.problemasSaude}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="informacoesAdicionais">Informações adicionais</label> 
                <input
                  id="informacoesAdicionais" 
                  type="text"
                  placeholder="Prefere vir de manhã"
                  value={clientData.informacoesAdicionais}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="telefone">Telefone</label> 
                <input
                  id="telefone" 
                  type="text"
                  placeholder="(XX) XXXXX-XXXX"
                  value={clientData.telefone}
                  onChange={handleChange}
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
                  value={clientData.email}
                  onChange={handleChange}
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
              <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
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
