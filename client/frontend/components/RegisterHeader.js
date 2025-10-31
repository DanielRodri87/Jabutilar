import styles from '../styles/register-header.module.css';

export default function RegisterHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.logoWrapper}>
        <img
          className={styles.logo}
          src="/logotipo.png"
          alt="Logo"
          width="40"
          height="40"
        />
      </div>
      <div>
        <button
          className={styles.backButton}
          onClick={() => (window.location.href = "/")}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
