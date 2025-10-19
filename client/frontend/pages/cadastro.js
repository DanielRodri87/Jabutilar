export default function Cadastro() {
  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f3f4f6;
        }

        .container {
          min-height: 100vh;
          padding: 48px 16px;
        }

        .card {
          max-width: 448px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 32px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logoText {
          font-weight: bold;
          font-size: 18px;
        }

        .backButton {
          background: none;
          border: none;
          color: #4b5563;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .backButton:hover {
          color: #111827;
        }

        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .namesContainer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .label {
          display: block;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
        }

        .input:focus {
          border-color: #22c55e;
        }

        .dateContainer {
          display: flex;
          gap: 8px;
        }

        .dateInput {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }

        .dateInput:focus {
          border-color: #22c55e;
        }

        .usernameContainer {
          display: flex;
          align-items: center;
        }

        .atSymbol {
          color: #9ca3af;
          padding-right: 8px;
        }

        .usernameInput {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }

        .usernameInput:focus {
          border-color: #22c55e;
        }

        .phoneContainer {
          display: flex;
          gap: 8px;
        }

        .countryCode {
          display: flex;
          align-items: center;
          background-color: #dcfce7;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          gap: 4px;
        }

        .phoneInput {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }

        .phoneInput:focus {
          border-color: #22c55e;
        }

        .checkboxContainer {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 0;
        }

        .checkbox {
          margin-top: 4px;
          cursor: pointer;
        }

        .checkboxLabel {
          font-size: 12px;
          color: #6b7280;
        }

        .submitButton {
          width: 100%;
          background-color: #4ade80;
          color: white;
          font-weight: bold;
          padding: 12px 0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }

        .submitButton:hover {
          background-color: #22c55e;
        }

        .submitButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          margin: 24px 0;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dividerLine {
          flex: 1;
          height: 1px;
          background-color: #d1d5db;
        }

        .dividerText {
          font-size: 14px;
          color: #9ca3af;
          white-space: nowrap;
        }

        .socialContainer {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .socialButton {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #d1d5db;
          padding: 12px 16px;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 14px;
          font-weight: 600;
        }

        .socialButton:hover {
          background-color: #f9fafb;
        }

        .footer {
          margin-top: 48px;
          background-color: #f3f4f6;
          padding: 32px 16px;
        }

        .footerContainer {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footerContent {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
          align-items: start;
        }

        .footerLeft {
          text-align: left;
        }

        .footerCenter {
          display: flex;
          justify-content: center;
        }

        .footerRight {
          display: flex;
          justify-content: flex-end;
        }

        .footerLogo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: bold;
          font-size: 14px;
        }

        .footerLeft p {
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0;
        }

        .socialLinks {
          display: flex;
          gap: 12px;
        }

        .socialLinks a {
          display: inline-block;
          opacity: 1;
          transition: opacity 0.2s;
        }

        .socialLinks a:hover {
          opacity: 0.7;
        }

        .footerBottom {
          border-top: 1px solid #d1d5db;
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          text-align: center;
        }

        .footerInfo {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }

        .footerInfo span,
        .footerInfo a {
          font-size: 12px;
          color: #6b7280;
        }

        .footerInfo a {
          font-weight: 600;
          text-decoration: none;
        }

        .footerInfo a:hover {
          color: #22c55e;
        }
      `}</style>

      <div className="container">
        <div className="card">
          <div className="header">
            <div className="logo">
              <img src="/jabuti.png" alt="Logo" width="40" height="40" />
              <span className="logoText">JABUTILÁ</span>
            </div>
            <button className="backButton">Voltar</button>
          </div>

          <h1 className="title">Entre e organize sua vida cáotica</h1>
          <p className="subtitle">Preencha os campos abaixo e deixe o público te achar com o dedo</p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="namesContainer">
              <div>
                <label className="label">PRIMEIRO NOME</label>
                <input type="text" name="primeiroNome" className="input" placeholder="Digite seu primeiro nome" required />
              </div>
              <div>
                <label className="label">SEGUNDO NOME</label>
                <input type="text" name="segundoNome" className="input" placeholder="Digite seu segundo nome" required />
              </div>
            </div>

            <div>
              <label className="label">DATA DE NASCIMENTO</label>
              <div className="dateContainer">
                <input type="number" name="dia" className="dateInput" placeholder="Dia" min="1" max="31" required />
                <input type="number" name="mes" className="dateInput" placeholder="Mês" min="1" max="12" required />
                <input type="number" name="ano" className="dateInput" placeholder="Ano" required />
              </div>
            </div>

            <div>
              <label className="label">USERNAME</label>
              <div className="usernameContainer">
                <span className="atSymbol">@</span>
                <input type="text" name="username" className="usernameInput" placeholder="Escolha um nome de usuário" required />
              </div>
            </div>

            <div>
              <label className="label">EMAIL</label>
              <input type="email" name="email" className="input" placeholder="Digite seu email" required />
            </div>

            <div>
              <label className="label">SENHA</label>
              <input type="password" name="senha" className="input" placeholder="Digite sua senha" required />
            </div>

            <div>
              <label className="label">CONFIRME SUA SENHA</label>
              <input type="password" name="confirmarSenha" className="input" placeholder="Confirme sua senha" required />
            </div>

            <div>
              <label className="label">CELULAR</label>
              <div className="phoneContainer">
                <div className="countryCode">
                  <img src="/brasil.png" alt="Brasil" width="20" height="15" />
                  <span>+55</span>
                </div>
                <input type="tel" name="celular" className="phoneInput" placeholder="(11) 99999-0000" required />
              </div>
            </div>

            <div className="checkboxContainer">
              <input type="checkbox" id="termos" name="termos" className="checkbox" required />
              <label htmlFor="termos" className="checkboxLabel">
                Concordo com mensagens que confiram os cortes, ligação de classificação e dados privados. Todos os dispositivos.
              </label>
            </div>

            <button type="submit" className="submitButton">Cadastrar</button>
          </form>

          <div className="divider">
            <div className="dividerLine"></div>
            <span className="dividerText">ou continue com</span>
            <div className="dividerLine"></div>
          </div>

          <div className="socialContainer">
            <button className="socialButton" onClick={() => handleSocialLogin('Facebook')}>
              <img src="/facebook.png" alt="Facebook" width="24" />
              <span>Continuar com Facebook</span>
            </button>
            <button className="socialButton" onClick={() => handleSocialLogin('Apple')}>
              <img src="/apple.png" alt="Apple" width="24" />
              <span>Continuar com Apple</span>
            </button>
            <button className="socialButton" onClick={() => handleSocialLogin('Google')}>
              <img src="/google.png" alt="Google" width="24" />
              <span>Continuar com Google</span>
            </button>
          </div>
        </div>

        <footer className="footer">
          <div className="footerContainer">
            <div className="footerContent">
              <div className="footerLeft">
                <div className="footerLogo">
                  <img src="/nome da logo.png" alt="Jabutilá" width="32" />
                  <span>JABUTILÁ</span>
                </div>
                <p>© Jabutilá Inc.</p>
                <p>All rights reserved</p>
              </div>

              <div className="footerCenter">
                <img src="/jabuti.png" alt="Jabutilá" width="80" />
              </div>

              <div className="footerRight">
                <div className="socialLinks">
                  <a href="#"><img src="/Redes sociais.png" alt="Redes Sociais" width="24" /></a>
                </div>
              </div>
            </div>

            <div className="footerBottom">
              <div className="footerInfo">
                <img src="/localização.png" alt="Localização" width="20" />
                <span>R. Cecero Duarte, 305 - Junco, Picos - PI, 64607-670</span>
              </div>
              <div className="footerInfo">
                <img src="/telefone.png" alt="Telefone" width="20" />
                <a href="tel:+558699923074">(86) 99923-0714</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  console.log('Dados do formulário:', Object.fromEntries(formData));
  alert('Cadastro realizado com sucesso!');
}

function handleSocialLogin(provider) {
  console.log(`Login com ${provider}`);
}