import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
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

        <div className={styles.footerCenter}>
          <img src="/jabuti.png" alt="Jabuti" className={styles.turtleImg} />
        </div>

        <div className={styles.footerSocial}>
          <button
            className={styles.socialLink}
            onClick={() => window.open("https://instagram.com", "_blank")}
          >
            <img src="/instagramblack.png" alt="Instagram" />
          </button>
          <button
            className={styles.socialLink}
            onClick={() => window.open("https://facebook.com", "_blank")}
          >
            <img src="/facebookblack.png" alt="Facebook" />
          </button>
          <button
            className={styles.socialLink}
            onClick={() => window.open("https://linkedin.com", "_blank")}
          >
            <img src="/linkedinblack.png" alt="LinkedIn" />
          </button>
          <button
            className={styles.socialLink}
            onClick={() => window.open("https://twitter.com", "_blank")}
          >
            <img src="/twitterblack.png" alt="Twitter" />
          </button>
        </div>
      </div>
    </footer>
  );
}
