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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          cpf: data.cpf || '',
          idCliente: data.idCliente || '',
          clienteDesde: data.dataCadastro ? new Date(data.dataCadastro).toISOString().split('T')[0] : '',
          favoritos: data.favoritos || '',
          problemasSaude: data.problemasSaude || '',
          informacoesAdicionais: data.informacoesAdicionais || '',
          telefone: data.telefone || '',
          email: data.email || '',
          foto: data.foto ? `http://localhost:3000/${data.foto.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150', 
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
    setClientData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientData((prevData) => ({
          ...prevData,
          foto: reader.result, 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSend = {
      nomeCompleto: clientData.nomeCompleto,
      dataNascimento: clientData.dataNascimento,
      cpf: clientData.cpf,
      idCliente: clientData.idCliente, 
    dataCadastro: clientData.clienteDesde, 
      favoritos: clientData.favoritos,
      problemasSaude: clientData.problemasSaude,
      informacoesAdicionais: clientData.informacoesAdicionais,
      telefone: clientData.telefone,
      email: clientData.email,
      foto: clientData.foto, 
    };


    try {
      const response = await fetch(`http://localhost:3000/clientes/${id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // Enviar os dados mapeados
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Dados atualizados com sucesso:', result);
      alert('Cliente atualizado com sucesso!');
      navigate(`/clientes/${id}`); // Redireciona de volta para a página do cliente
    } catch (e) {
      setError("Não foi possível atualizar os dados do cliente: " + e.message);
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
                />
              </div>
              <div>
                <label htmlFor="dataNascimento">Data de nascimento</label> 
                <input
                  id="dataNascimento" 
                  type="date"
                  value={clientData.dataNascimento}
                  onChange={handleChange}
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
                />
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
                />
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  placeholder="juliana@gmail.com"
                  value={clientData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

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