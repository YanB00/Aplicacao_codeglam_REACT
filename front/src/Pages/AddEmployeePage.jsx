import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddClientPage.module.css';
import { FaCamera } from 'react-icons/fa';


export default function AddEmployeePage() {

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

  const newEmployeeId = generateId();

  const handleCancel = ()=>{
    navigate('/funcionarios');
  }

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
        setCpf(value);
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
        setTelefone(value);
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

    const formData = new FormData();
    formData.append('nomeCompleto', nomeCompleto);
    formData.append('dataNascimento', dataNascimento);
    formData.append('cpf', cpf);
    formData.append('dataAdmissao', dataAdmissao);
    formData.append('servicosRealizados', servicosRealizados);
    formData.append('beneficios', beneficios);
    formData.append('informacoesAdicionais', informacoesAdicionais);
    formData.append('telefone', telefone);
    formData.append('email', email);
    if (foto) {
      formData.append('foto', foto); // Anexa a foto ao FormData
    }

    try {
      const response = await fetch('http://localhost:3000/add-funcionario', { 
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Resposta do Backend:', data);

      if (!data.errorStatus) {
        setMensagemStatus(data.mensageStatus);
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
                <label htmlFor="employeeId">ID do Funcionário</label>
                <input id="employeeId" type="text" value={newEmployeeId} readOnly />
              </div>
              <div>
                <label htmlFor="startDate">Funcionário desde</label>
                <input
                  id="startDate"
                  type="date"
                  value={dataAdmissao}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="services">Serviços realizados</label>
                <input
                  id="services"
                  type="text"
                  placeholder="Ex: Corte, Manicure"
                  value={servicosRealizados}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="benefits">Benefícios</label>
                <input
                  id="benefits"
                  type="text"
                  placeholder="Ex: Vale transporte, Comissão"
                  value={beneficios}
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
                  placeholder="Ex: Disponibilidade aos sábados"
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
                  placeholder="funcionario@email.com"
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