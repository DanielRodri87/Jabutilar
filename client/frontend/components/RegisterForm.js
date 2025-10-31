import styles from '../styles/register-form.module.css';

export default function RegisterForm({ onSubmit, error, loading }) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.namesContainer}>
        <div>
          <div className={styles.inputWrapper}>
            <span className={styles.floatingLabel}>PRIMEIRO NOME</span>
            <input 
              id="primeiroNome" 
              aria-label="primeiro nome" 
              type="text" 
              name="primeiroNome" 
              className={styles.input} 
              placeholder="Digite o seu nome aqui" 
              required 
            />
          </div>
        </div>
        <div>
          <div className={styles.inputWrapper}>
            <span className={styles.floatingLabel}>SEGUNDO NOME</span>
            <input 
              id="segundoNome" 
              aria-label="segundo nome" 
              type="text" 
              name="segundoNome" 
              className={styles.input} 
              placeholder="Digite seu sobrenome aqui" 
              required 
            />
          </div>
        </div>
      </div>

      <div>
        <div className={styles.inputWrapper}>
          <span className={styles.floatingLabel}>DATA DE NASCIMENTO</span>
          <div className={styles.composedInput}>
            <input type="number" name="dia" className={styles.dateInput} placeholder="Dia" min="1" max="31" required />
            <input type="number" name="mes" className={styles.dateInput} placeholder="Mês" min="1" max="12" required />
            <input type="number" name="ano" className={styles.dateInput} placeholder="Ano" required />
          </div>
        </div>
      </div>

      <div>
        <div className={styles.inputWrapper}>
          <span className={styles.floatingLabel}>USERNAME</span>
          <div className={styles.usernameContainer}>
            <span className={styles.atSymbol}>@</span>
            <input type="text" name="username" className={styles.usernameInput} placeholder="Escolha um nome de usuário" required />
          </div>
        </div>
      </div>

      <div>
        <div className={styles.inputWrapper}>
          <span className={styles.floatingLabel}>EMAIL</span>
          <input type="email" name="email" className={styles.input} placeholder="Digite seu email aqui" required />
        </div>
      </div>

      <div>
        <div className={styles.inputWrapper}>
          <span className={styles.floatingLabel}>SENHA</span>
          <input 
            id="senha" 
            aria-label="senha" 
            type="password" 
            name="senha" 
            className={styles.input} 
            placeholder="Crie uma senha segura" 
            required 
          />
        </div>
      </div>

      <div>
        <div className={styles.inputWrapper}>
          <span className={styles.floatingLabel}>CONFIRME SUA SENHA</span>
          <input 
            id="confirmarSenha" 
            aria-label="confirmar senha" 
            type="password" 
            name="confirmarSenha" 
            className={styles.input} 
            placeholder="Repita a senha para confirmar" 
            required 
          />
        </div>
      </div>

      <div>
        <div className={styles.inputWrapper}>
          <span className={styles.floatingLabel}>CELULAR</span>
          <div className={styles.composedInput}>
            <div className={styles.phoneContainer}>
              <div className={styles.countryCode}>
                <img src="/brasil.png" alt="Brasil" width="20" height="15" />
                <span>+55</span>
              </div>
              <input type="tel" name="celular" className={styles.phoneInput} placeholder="Informe seu telefone com DDD" required />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.checkboxContainer}>
        <input type="checkbox" id="termos" name="termos" className={styles.checkbox} required />
        <label htmlFor="termos" className={styles.checkboxLabel}>
          Concordo com mensagens que confiram os cortes, ligação de classificação e dados privados. Todos os dispositivos.
        </label>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className={styles.error}>
          {error}
        </div>
      )}

      <button type="submit" className={styles.submitButton} disabled={loading}>
        <span>{loading ? 'Aguarde...' : 'Cadastrar'}</span>
      </button>
    </form>
  );
}