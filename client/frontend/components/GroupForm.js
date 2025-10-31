import { useState } from 'react';
import styles from '../styles/group-form.module.css';

export default function GroupForm() {
  const [formData, setFormData] = useState({
    conviteCode: '',
    groupName: '',
    groupDescription: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCadastrar = () => {
    console.log(formData);
    alert('Grupo cadastrado com sucesso!');
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
        Você ainda não está associado a nenhum<br />grupo doméstico
      </h1>

      <div className={styles.section}>
        <label className={styles.label}>CONVITE</label>
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="conviteCode"
            value={formData.conviteCode}
            onChange={handleChange}
            placeholder="Colar aqui o código de um grupo existente"
            className={styles.input}
          />
          <button type="button" className={styles.pasteBtn}>Colar</button>
        </div>
        <div className={styles.divider}>OU</div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.subtitle}>Crie o seu próprio grupo!</h2>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>NOME</label>
          <input
            type="text"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
            placeholder="Digite o nome do grupo"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>DESCRIÇÃO</label>
          <textarea
            name="groupDescription"
            value={formData.groupDescription}
            onChange={handleChange}
            placeholder="Descrição complementar do seu grupo"
            rows="4"
            className={styles.textarea}
          />
        </div>

        <button 
          type="button"
          onClick={handleCadastrar} 
          className={styles.submitBtn}
        >
          Cadastrar grupo
        </button>
      </div>
    </div>
  );
}