import { useState } from 'react';
import styles from '../styles/cadastro_grupo.module.css';

export default function CadastroGrupo() {
  const [conviteCode, setConviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleCadastrar = () => {
    console.log({
      conviteCode,
      groupName,
      groupDescription
    });
    alert('Grupo cadastrado com sucesso!');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <img src="/jabuti.png" alt="Jabutilar" className={styles.logo} />
          <span className={styles.logoText}>JABUTILAR</span>
        </div>
        <button className={styles.profileBtn}>
          <img src="/logotipo.png" alt="Perfil" className={styles.profileImg} />
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.card}>
          {/* Título */}
          <h1 className={styles.title}>
            Você ainda não está associado a nenhum<br />grupo doméstico
          </h1>

          {/* Section 1: Convite */}
          <div className={styles.section}>
            <label className={styles.label}>CONVITE</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={conviteCode}
                onChange={(e) => setConviteCode(e.target.value)}
                placeholder="Colar aqui o código de um grupo existente"
                className={styles.input}
              />
              <button type="button" className={styles.pasteBtn}>Colar</button>
            </div>
            <div className={styles.divider}>OU</div>
          </div>

          {/* Section 2: Criar Grupo */}
          <div className={styles.formSection}>
            <h2 className={styles.subtitle}>Crie o seu próprio grupo!</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>NOME</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Digite o nome do grupo"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>DESCRIÇÃO</label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
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
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* Logo e Info */}
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <img src="/jabutilar.png" alt="Jabutilar" />
            </div>
            <p className={styles.copyright}>© JabutiLar Inc.</p>
            <p className={styles.copyright}>All rights reserved</p>
            
            <div className={styles.footerInfo}>
              <img src="/localização.png" alt="Localização" />
              <span>R. Cícero Duarte, 905 - Junco, Picos - PI, 64607-670</span>
            </div>
            
            <div className={styles.footerInfo}>
              <img src="/telefone.png" alt="Telefone" />
              <span>(89) 99923-0714</span>
            </div>
          </div>

          {/* Tartaruga Logo */}
          <div className={styles.footerCenter}>
            <img src="/jabuti.png" alt="Jabuti" className={styles.turtleImg} />
          </div>

          {/* Social Media */}
          <div className={styles.footerSocial}>
            <a href="#" className={styles.socialLink}>
              <img src="/instagramblack.png" alt="Instagram" />
            </a>
            <a href="#" className={styles.socialLink}>
              <img src="/facebookblack.png" alt="Facebook" />
            </a>
            <a href="#" className={styles.socialLink}>
              <img src="/linkedinblack.png" alt="LinkedIn" />
            </a>
            <a href="#" className={styles.socialLink}>
              <img src="/twitterblack.png" alt="Twitter" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}