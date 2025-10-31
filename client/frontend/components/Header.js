import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <img src="/jabuti.png" alt="Jabutilar" className={styles.logo} />
        <span className={styles.logoText}>JABUTILAR</span>
      </div>
      <button className={styles.profileBtn}>
        <img src="/logotipo.png" alt="Perfil" className={styles.profileImg} />
      </button>
    </header>
  );
}