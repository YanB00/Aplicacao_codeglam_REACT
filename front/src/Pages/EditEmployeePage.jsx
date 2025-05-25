import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditEmployeePage.module.css';
import { FaCamera, FaArrowLeft } from 'react-icons/fa';

export default function EditEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    dataNascimento: '',
    cpf: '',
    dataAdmissao: '',
    cargo: '',
    beneficios: '',
    informacoesAdicionais: '',
    telefone: '',
    email: '',
    foto: null, 
  });

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/funcionarios/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEmployee(data.data);
        setFormData({
          nomeCompleto: data.data.nomeCompleto || '',
          dataNascimento: data.data.dataNascimento ? data.data.dataNascimento.slice(0, 10) : '',
          cpf: data.data.cpf || '',
          dataAdmissao: data.data.dataAdmissao ? data.data.dataAdmissao.slice(0, 10) : '',
          cargo: data.data.cargo || '',
          beneficios: data.data.beneficios || '',
          informacoesAdicionais: data.data.informacoesAdicionais || '',
          telefone: data.data.telefone || '',
          email: data.data.email || '',
          foto: null,
        });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (event) => {
    setFormData({
      ...formData,
      foto: event.target.files[0],
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await fetch(`http://localhost:3000/funcionarios/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensageStatus || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Funcionário atualizado:', result);
      navigate(`/funcionario/${id}`); // Redirecionar para a página do funcionário
    } catch (e) {
      setError(e);
      console.error('Erro ao atualizar funcionário:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/funcionario/${id}`); // Voltar para a página do funcionário
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.mainContent}>Carregando dados do funcionário...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.topBar}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
          <div className={styles.mainContent}>Erro ao carregar dados do funcionário: {error.message}</div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.topBar}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
          <div className={styles.mainContent}>Funcionário não encontrado.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <FaArrowLeft /> Voltar
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.avatarSection}>
            <img
              src={employee.foto ? `http://localhost:3000/uploads/${employee.foto}` : 'https://randomuser.me/api/portraits/women/89.jpg'}
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
                onChange={handleFileChange}
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
                  name="nomeCompleto"
                  placeholder="Nome completo"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="dataNascimento">Data de nascimento</label>
                <input
                  id="dataNascimento"
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="employeeId">ID do Funcionário</label>
                <input id="employeeId" type="text" placeholder={`#${employee.idFuncionario}`} value={`#${employee.idFuncionario}`} readOnly />
              </div>
              <div>
                <label htmlFor="dataAdmissao">Data de admissão</label>
                <input
                  id="dataAdmissao"
                  type="date"
                  name="dataAdmissao"
                  value={formData.dataAdmissao}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  type="text"
                  name="cargo"
                  placeholder="Ex: Designer de Unhas"
                  value={formData.cargo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="beneficios">Benefícios</label>
                <input
                  id="beneficios"
                  type="text"
                  name="beneficios"
                  placeholder="Ex: Vale-transporte, Desconto"
                  value={formData.beneficios}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="informacoesAdicionais">Informações adicionais</label>
                <input
                  id="informacoesAdicionais"
                  type="text"
                  name="informacoesAdicionais"
                  placeholder="Ex: Entrada 09:00 - Saída 18:00"
                  value={formData.informacoesAdicionais}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="tel">Telefone</label>
                <input
                  id="tel"
                  type="text"
                  name="telefone"
                  placeholder="(XX) XXXXX-XXXX"
                  value={formData.telefone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  name="email"
                  placeholder="juliana@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}