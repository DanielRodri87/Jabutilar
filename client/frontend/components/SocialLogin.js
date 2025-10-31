import styles from '../styles/social-login.module.css';

export default function SocialLogin({ onSocialLogin }) {
  return (
    <>
      <div className={styles.divider}>
        <div className={styles.dividerLine}></div>
        <span className={styles.dividerText}>ou continue com</span>
        <div className={styles.dividerLine}></div>
      </div>

      <div className={styles.socialContainer}>
        <button 
          type="button" 
          className={styles.socialButton} 
          onClick={() => onSocialLogin('Facebook')}
        >
          <img src="/facebook.png" alt="Facebook" width="24" />
          <span>Continuar com Facebook</span>
        </button>

        <button 
          type="button" 
          className={styles.socialButton} 
          onClick={() => onSocialLogin('Apple')}
        >
          <img src="/apple.png" alt="Apple" width="24" />
          <span>Continuar com Apple</span>
        </button>

        <button 
          type="button" 
          className={styles.socialButton} 
          onClick={() => onSocialLogin('Google')}
        >
          <img src="/google.png" alt="Google" width="24" />
          <span>Continuar com Google</span>
        </button>
      </div>
    </>
  );
}