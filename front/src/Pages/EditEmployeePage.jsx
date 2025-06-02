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
  const [cpfError, setCpfError] = useState('');

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
          cpf: data.data.cpf ? formatCpf(data.data.cpf) : '',
          dataAdmissao: data.data.dataAdmissao ? data.data.dataAdmissao.slice(0, 10) : '',
          cargo: data.data.cargo || '',
          beneficios: data.data.beneficios || '',
          informacoesAdicionais: data.data.informacoesAdicionais || '',
          telefone: data.data.telefone ? formatPhone(data.data.telefone) : '',
          email: data.data.email || '',
          foto: data.data.foto || null,
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

    if (name === 'cpf') {
      const formattedCpf = formatCpf(value);
      setFormData({
        ...formData,
        [name]: formattedCpf,
      });
      if (formattedCpf.length === 14) {
        if (!validateCpf(formattedCpf)) {
          setCpfError('CPF inválido.');
        } else {
          setCpfError('');
        }
      } else {
        setCpfError('');
      }
    } else if (name === 'telefone') {
      const formattedPhone = formatPhone(value);
      setFormData({
        ...formData,
        [name]: formattedPhone,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (event) => {
    setFormData({
      ...formData,
      foto: event.target.files[0], 
    });
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!validateCpf(formData.cpf)) {
    setCpfError('Por favor, insira um CPF válido.');
    return;
  }

  setLoading(true);
  setError(null);

  const formDataToSend = new FormData();

  // Anexar campos de texto e formatados explicitamente
  // Isso evita o problema de 'CastError' ao garantir que cada campo é adicionado uma vez
  // e no formato esperado (string, após formatação se necessário).

  formDataToSend.append('nomeCompleto', formData.nomeCompleto);
  formDataToSend.append('dataNascimento', formData.dataNascimento);
  formDataToSend.append('cpf', formData.cpf.replace(/[^\d]+/g, '')); // Já formatado
  formDataToSend.append('dataAdmissao', formData.dataAdmissao);
  formDataToSend.append('cargo', formData.cargo);
  formDataToSend.append('beneficios', formData.beneficios);
  formDataToSend.append('informacoesAdicionais', formData.informacoesAdicionais);
  formDataToSend.append('telefone', formData.telefone.replace(/\D/g, '')); // Já formatado
  formDataToSend.append('email', formData.email);

  // TRATAMENTO EXPLÍCITO DA FOTO (conforme a última correção)
  if (formData.foto instanceof File) {
    formDataToSend.append('foto', formData.foto);
  } else if (typeof formData.foto === 'string' && formData.foto) {
    formDataToSend.append('fotoExistente', formData.foto);
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
    navigate(`/funcionario/${id}?userId=${employee.salaoId}`);
  } catch (e) {
    setError(e);
    console.error('Erro ao atualizar funcionário:', e);
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate(`/funcionario/${id}?userId=${employee.salaoId}`); 
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

  const displayImage = formData.foto instanceof File
    ? URL.createObjectURL(formData.foto) // Nova imagem selecionada
    : (employee.foto ? `http://localhost:3000/uploads/${employee.foto}` : 'https://randomuser.me/api/portraits/women/89.jpg');


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
              src={displayImage}
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
                  maxLength="14"
                />
                {cpfError && <p className={styles.errorMessage}>{cpfError}</p>}
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
                  maxLength="15"
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
              <button type="submit" className={styles.saveBtn} disabled={loading || !!cpfError}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}