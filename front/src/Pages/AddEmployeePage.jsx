import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import styles from './AddClientPage.module.css'; 
import { FaCamera } from 'react-icons/fa';


export default function AddEmployeePage({ userId: propUserId }) {

  const navigate = useNavigate();
  const generateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [servicosRealizados, setServicosRealizados] = useState('');
  const [beneficios, setBeneficios] = useState('');
  const [informacoesAdicionais, setInformacoesAdicionais] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState(null);
  const [mensagemStatus, setMensagemStatus] = useState('');
  const [erroStatus, setErroStatus] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(propUserId);

    useEffect(() => {
        if (propUserId && propUserId !== currentUserId) {
            setCurrentUserId(propUserId);
        }
        if (!propUserId) {
            console.warn("AddEmployeePage: userId prop is missing. Consider redirecting or handling this case.");
        }
    }, [propUserId]);




  const newEmployeeId = generateId();

  const handleCancel = () => {
    navigate(`/funcionarios?userId=${currentUserId || ''}`);
  };

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

  const handleInputChange = (event) => {
    const { id, value } = event.target;
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
      case 'startDate':
        setDataAdmissao(value);
        break;
      case 'services':
        setServicosRealizados(value);
        break;
      case 'benefits':
        setBeneficios(value);
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
      case 'avatar-upload':
        setFoto(event.target.files[0]);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateCpf(cpf)) {
      setMensagemStatus('Por favor, insira um CPF válido.');
      setErroStatus(true);
      return; 
    }

    const servicesArray = servicosRealizados.split(',').map(s => s.trim()).filter(s => s !== '');
    const benefitsArray = beneficios.split(',').map(b => b.trim()).filter(b => b !== '');

    const formData = new FormData();
    formData.append('nomeCompleto', nomeCompleto);
    formData.append('dataNascimento', dataNascimento);
    formData.append('cpf', cpf.replace(/[^\d]+/g, ''));
    formData.append('dataAdmissao', dataAdmissao);

    servicesArray.forEach((service, index) => {
        formData.append(`servicosRealizados[${index}]`, service);
    });
    benefitsArray.forEach((benefit, index) => {
        formData.append(`beneficios[${index}]`, benefit);
    });

    formData.append('informacoesAdicionais', informacoesAdicionais);
    formData.append('telefone', telefone);
    formData.append('email', email);
    if (foto) {
      formData.append('foto', foto);
    }

  if (currentUserId) {
    formData.append('userId', currentUserId); 
  } else {
    setMensagemStatus('Erro: ID do usuário não encontrado para associar o funcionário.');
    setErroStatus(true);
    return;
  }

    try {
      const response = await fetch('http://localhost:3000/funcionarios/add-funcionario', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Resposta do Backend:', data);

      if (!data.errorStatus) {
        setMensagemStatus(data.mensageStatus || 'FUNCIONÁRIO CADASTRADO COM SUCESSO');
        setErroStatus(false);
       
        // Limpar os campos do formulário após o sucesso
        setNomeCompleto('');
        setDataNascimento('');
        setCpf('');
        setDataAdmissao('');
        setServicosRealizados('');
        setBeneficios('');
        setInformacoesAdicionais('');
        setTelefone('');
        setEmail('');
        setFoto(null);

        setTimeout(() => {
          navigate(`/funcionario/${data.data.idFuncionario}?userId=${currentUserId || ''}`);        }, 1000); 
      } else {
        setMensagemStatus(data.mensageStatus);
        setErroStatus(true);
        console.error('Erro ao cadastrar funcionário:', data.errorObject);
      }
    } catch (error) {
      setMensagemStatus('Houve um erro ao enviar os dados.');
      setErroStatus(true);
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
                            alt="Avatar do Funcionário"
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
                                <input id="fullName" type="text" placeholder="Nome completo" value={nomeCompleto} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label htmlFor="birthdate">Data de nascimento</label>
                                <input id="birthdate" type="date" value={dataNascimento} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label htmlFor="cpf">CPF</label>
                                <input id="cpf" type="text" placeholder="000.000.000-00" value={cpf} onChange={handleInputChange} maxLength="14" />
                                {cpfError && <p className={styles.errorMessage}>{cpfError}</p>}
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div>
                                <label htmlFor="employeeId">ID do Funcionário</label>
                                <input id="employeeId" type="text" value={newEmployeeId} readOnly />
                            </div>
                            <div>
                                <label htmlFor="startDate">Funcionário desde</label>
                                <input id="startDate" type="date" value={dataAdmissao} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label htmlFor="services">Serviços realizados</label>
                                <input id="services" type="text" placeholder="Ex: Corte, Manicure" value={servicosRealizados} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div>
                                <label htmlFor="benefits">Benefícios</label>
                                <input id="benefits" type="text" placeholder="Ex: Vale transporte, Comissão" value={beneficios} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div>
                                <label htmlFor="additionalInfo">Informações adicionais</label>
                                <input id="additionalInfo" type="text" placeholder="Ex: Disponibilidade aos sábados" value={informacoesAdicionais} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label htmlFor="tel">Telefone</label>
                                <input id="tel" type="text" placeholder="(XX) XXXXX-XXXX" value={telefone} onChange={handleInputChange} maxLength="15" />
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <input id="email" type="text" placeholder="funcionario@email.com" value={email} onChange={handleInputChange} />
                            </div>
                        </div>

                        {mensagemStatus && (
                            <p className={erroStatus ? styles.errorMessage : styles.successMessage}>
                                {mensagemStatus}
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