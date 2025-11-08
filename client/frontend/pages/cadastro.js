import React, { useState } from 'react';
import { apiEndpoints } from '../config/api';
import { getAuthUrl } from '../config/oauth';

export default function Cadastro() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    facebook: false
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const formData = new FormData(e.target);
    
    // Validar se as senhas coincidem
    const senha = formData.get('senha');
    const confirmarSenha = formData.get('confirmarSenha');
    
    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem!');
      setIsLoading(false);
      return;
    }

    // Formatar a data de nascimento no formato YYYY-MM-DD
    const dia = formData.get('dia').padStart(2, '0');
    const mes = formData.get('mes').padStart(2, '0');
    const ano = formData.get('ano');
    const dataNascimento = `${ano}-${mes}-${dia}`;

    const dadosCadastro = {
      email: formData.get('email'),
      senha: senha,
      nome: `${formData.get('primeiroNome')} ${formData.get('segundoNome')}`,
      username: formData.get('username'),
      data_nascimento: dataNascimento
    };

    try {
      const response = await fetch(apiEndpoints.cadastro, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCadastro)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Cadastro realizado com sucesso!', data);
        alert('Cadastro realizado com sucesso!');
        
        // Aqui você pode adicionar lógica de redirecionamento
        // window.location.href = '/cadastro_grupo';
      } else {
        setErrorMessage(data.detail || 'Erro ao realizar cadastro. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      setErrorMessage('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialLogin(provider) {
    try {
      setSocialLoading(prev => ({ ...prev, [provider]: true }));
      setErrorMessage('');
      
      console.log(`Iniciando login com ${provider}`);
      
      if (provider === 'facebook' && typeof window !== 'undefined') {
        // Use direct Facebook OAuth URL with popup
        const authUrl = getAuthUrl('facebook');
        if (authUrl) {
          // Salvar o provider no sessionStorage para usar após o callback
          sessionStorage.setItem('oauth_provider', provider);
          
          // Calcular posição central
          const width = 600;
          const height = 600;
          const left = (window.screen.width / 2) - (width / 2);
          const top = (window.screen.height / 2) - (height / 2);
          
          // Abrir popup centralizado
          const popup = window.open(
            authUrl,
            'facebook-login',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes`
          );
          
          // Monitorar o popup para detectar quando fecha
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              setSocialLoading(prev => ({ ...prev, [provider]: false }));
              
              // Verificar se houve sucesso no login
              const authResult = sessionStorage.getItem('facebook_auth_result');
              if (authResult === 'success') {
                sessionStorage.removeItem('facebook_auth_result');
                alert('Login com Facebook realizado com sucesso!');
                // Redirecionar para dashboard ou página inicial
                // window.location.href = '/dashboard';
              } else if (authResult === 'error') {
                sessionStorage.removeItem('facebook_auth_result');
                setErrorMessage('Erro no login com Facebook. Tente novamente.');
              }
            }
          }, 1000);
          
          return;
        }
      }
      
      // Fallback to backend OAuth URL for other providers or if direct URL fails
      const response = await fetch(`http://localhost:8000/auth/${provider}/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter URL de autenticação: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Redirecionar para a URL de autenticação do provider usando popup centralizado
      if (data.url && typeof window !== 'undefined') {
        // Salvar o provider no sessionStorage para usar após o callback
        sessionStorage.setItem('oauth_provider', provider);
        
        // Calcular posição central
        const width = 600;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        const popup = window.open(
          data.url,
          `${provider}-login`,
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes`
        );
        
        // Monitorar o popup para detectar quando fecha
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setSocialLoading(prev => ({ ...prev, [provider]: false }));
          }
        }, 1000);
      } else {
        throw new Error('URL de autenticação não disponível');
      }
      
    } catch (error) {
      console.error(`Erro ao conectar com ${provider}:`, error);
      setErrorMessage(`Erro ao conectar com ${provider}. Tente novamente.`);
      setSocialLoading(prev => ({ ...prev, [provider]: false }));
    }
  }

  function handleBack() {
    window.history.back();
  }

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_Lt.otf') format('opentype');
          font-weight: 300;
          font-style: normal;
        }

        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_Bk.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_Md.otf') format('opentype');
          font-weight: 500;
          font-style: normal;
        }

        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_Bd.otf') format('opentype');
          font-weight: 700;
          font-style: normal;
        }

        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_XBd.otf') format('opentype');
          font-weight: 800;
          font-style: normal;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: white;
        }

        .container {
          min-height: 100vh;
        }

        .card {
          width: 685px;
          height: 985px;
          margin: 0 auto;
          background-color: #fafafaff;
          border-radius: 35px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 32px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 0 35px;
          margin-top: 28px;
        }

        .logo {
          width: 30%;
          height: 30%;
          align-items: center;
          gap: 8px;
        }

        .logoText {
          font-weight: bold;
          font-size: 18px;
        }

        .backButton {
          margin-right: 35px;
          background: none;
          border: none;
          color: #4b5563;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .backButton:hover {
          color: #111827;
        }

        .backButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .title {
          font-family: 'Airbnb Cereal', sans-serif;
          font-weight: 700;
          font-size: 35px;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-family: 'Airbnb Cereal Normal', sans-serif;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 5px;
          padding: 12px;
          margin-bottom: 16px;
          color: #c33;
          font-size: 14px;
          text-align: center;
          font-family: 'Airbnb Cereal', sans-serif;
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
          margin-bottom: 6px;
        }

        .inputWrapper {
          position: relative;
        }

        .floatingLabel {
          position: absolute;
          left: 12px;
          top: 8px;
          font-family: 'Airbnb Cereal', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #111827;
          pointer-events: none;
          background: transparent;
        }

        .inputWrapper:focus-within .floatingLabel {
          color: #667467;
        }

        .inputWrapper:focus-within .input,
        .inputWrapper:focus-within .composedInput {
          border-color: #667467;
        }

        .floatingLabel {
          transition: color 160ms ease;
        }

        .input, .composedInput {
          transition: border-color 160ms ease;
        }

        .input {
          width: 100%;
          padding: 22px 12px 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 5px;
          font-size: 14px;
          outline: none;
        }

        .input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .labelTitle {
          display: block;
          font-family: 'Airbnb Cereal', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.2px;
          color: #111827;
          margin-bottom: 4px;
        }

        .labelText {
          display: block;
          font-family: 'Airbnb Cereal', sans-serif;
          font-weight: 300;
          font-size: 12px;
          color: rgba(17,24,39,0.5);
          margin-top: 0;
        }

        .input:focus {
          border-color: #22c55e;
        }

        .composedInput {
          width: 100%;
          padding: 22px 12px 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 5px;
          display: flex;
          gap: 8px;
          align-items: center;
          background: transparent;
        }

        .composedInput .dateInput {
          flex: 1;
          padding: 0;
          border: none;
          border-radius: 0;
          font-size: 14px;
          background: transparent;
          outline: none;
        }

        .composedInput .dateInput:focus {
          box-shadow: none;
          outline: none;
        }

        .composedInput .dateInput:disabled {
          background-color: transparent;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .usernameWrapper .floatingLabel {
          left: 36px;
        }

        .usernameContainer {
          position: relative;
          display: flex;
          align-items: center;
        }

        .usernameContainer .atSymbol {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          z-index: 2;
        }

        .usernameInput.input {
          padding: 22px 12px 8px 44px;
        }

        .usernameInput.input::placeholder {
          text-indent: 3px;
          color: rgba(17,24,39,0.5);
        }

        .usernameWrapper .floatingLabel {
          left: 44px;
          z-index: 3;
          background: white;
          padding: 0 4px;
        }

        .composedInput.phoneContainerWrapper {
          padding: 22px 12px 8px 12px;
        }

        .composedInput.phoneContainerWrapper .phoneContainer {
          display: flex;
          gap: 8px;
          align-items: center;
          width: 100%;
          background: transparent;
        }

        .composedInput.phoneContainerWrapper .countryCode {
          background: transparent;
          border: none;
          padding: 0 8px;
        }

        .composedInput.phoneContainerWrapper .phoneInput {
          flex: 1;
          border: none;
          padding: 0;
          background: transparent;
          outline: none;
        }

        .composedInput.phoneContainerWrapper .phoneInput:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .dateContainer {
          display: flex;
          gap: 8px;
        }

        .dateInput {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 5px;
          font-size: 14px;
        }

        .dateInput:focus {
          border-color: #667467;
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
          border-radius: 5px;
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
          border-radius: 5px;
          border: 1px solid #d1d5db;
          gap: 4px;
        }

        .phoneInput {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 5px;
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

        .checkbox:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .checkboxLabel {
          font-size: 12px;
          color: #6b7280;
        }

        .submitButton {
          width: 100%;
          background-color: transparent;
          color: black;
          font-weight: 700;
          padding: 12px 0;
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          position: relative;
          overflow: hidden;
          transition: border-color 1s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .submitButton::before {
          content: "";
          position: absolute;
          inset: 0;
          background-color: #C1D9C1;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 0;
          pointer-events: none;
        }

        .submitButton:hover::before {
          opacity: 0.21;
        }

        .submitButton:hover {
          border-color: #667467;
        }

        .submitButton span {
          position: relative;
          z-index: 1;
          display: inline-block;
        }

        .submitButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submitButton:disabled:hover {
          border-color: transparent;
        }

        .submitButton:disabled::before {
          opacity: 1;
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
          background-color: transparent;
          cursor: pointer;
          transition: border-color 1s ease;
          font-size: 14px;
          font-weight: 600;
          position: relative;
          overflow: hidden;
        }

        .socialButton::before {
          content: "";
          position: absolute;
          inset: 0;
          background-color: #ffffff;
          opacity: 1;
          transition: background-color 1s ease, opacity 1s ease;
          z-index: 0;
          pointer-events: none;
        }

        .socialButton span,
        .socialButton img,
        .socialButton svg {
          position: relative;
          z-index: 1;
        }

        .socialButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .facebookButton:hover:not(:disabled) {
          border-color: #1877F2;
        }

        .facebookButton:hover:not(:disabled)::before {
          background-color: #1877F2;
          opacity: 0.21;
        }

        .googleButton:hover:not(:disabled) {
          border-color: #F14336;
        }

        .googleButton:hover:not(:disabled)::before {
          background-color: #F14336;
          opacity: 0.21;
        }

        .footer {
          width: 100vw;
          box-sizing: border-box;
          position: relative;
          bottom: 0;
          left: 0;
          margin: 0;
        }

        .jabutilar {
          width: 120px;
          height: auto;
        }

        .footerContainer {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          max-width: 1200px;
          margin-left: 20px;
        }

        .main-content {
          flex: 1;
        }

        .footer {
          margin-top: 48px;
          width: 100%;
          background-color: #fafafaff;
          padding: 32px 0 32px 16px;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .footerLeft {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          margin-left: 0px;
        }

        .footerLeft .logoText {
          font-family: 'Airbnb Cereal', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 1px;
          color: #000;
        }

        .footerLeft p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .footerInfo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footerInfo img {
          width: 18px;
          height: 18px;
        }

        .footerInfo span,
        .footerInfo a {
          font-size: 13px;
          color: #333;
          text-decoration: none;
        }

        .footerInfo a:hover {
          color: #22c55e;
        }

        .footerCenter {
          margin-left: 100%;
          justify-content: center;
          align-items: center;
        }

        .footerCenter img {
          width: 150px;
          height: auto;
        }

        .footerRight {
          margin-left: 150%;
        }

        .socialLinks {
          display: flex;
          gap: 7px;
          justify-content: center;
          align-items: center;
        }

        .socialLinks img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          transition: opacity 0.2s;
        }

        .socialLinks img:hover {
          opacity: 0.7;
        }
      `}</style>

      <div>
        <title>Entre e organize sua vida caótica</title>
        <meta name="description" content="Página de cadastro do Jabutilar" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <div>
            <img className="logo" src="/logotipo.png" alt="Logo" width="40" height="40" />
          </div>
          <div>
            <button className="backButton" onClick={handleBack} disabled={isLoading}>Voltar</button>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="card">
          <h1 className="title">Entre e organize sua vida cáotica</h1>
          <p className="subtitle">Preencha os campos abaixo e deixe o público te achar com o dedo</p>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="namesContainer">
              <div>
                <div className="inputWrapper">
                  <span className="floatingLabel">PRIMEIRO NOME</span>
                  <input 
                    type="text" 
                    name="primeiroNome" 
                    className="input" 
                    placeholder="Digite o seu nome aqui" 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <div className="inputWrapper">
                  <span className="floatingLabel">SEGUNDO NOME</span>
                  <input 
                    type="text" 
                    name="segundoNome" 
                    className="input" 
                    placeholder="Digite seu sobrenome aqui" 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="inputWrapper">
                <span className="floatingLabel">DATA DE NASCIMENTO</span>
                <div className="composedInput">
                  <input 
                    type="number" 
                    name="dia" 
                    className="dateInput" 
                    placeholder="Dia" 
                    min="1" 
                    max="31" 
                    required 
                    disabled={isLoading}
                  />
                  <input 
                    type="number" 
                    name="mes" 
                    className="dateInput" 
                    placeholder="Mês" 
                    min="1" 
                    max="12" 
                    required 
                    disabled={isLoading}
                  />
                  <input 
                    type="number" 
                    name="ano" 
                    className="dateInput" 
                    placeholder="Ano" 
                    min="1900"
                    max={new Date().getFullYear()}
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="inputWrapper usernameWrapper">
                <span className="floatingLabel">USERNAME</span>
                <div className="usernameContainer">
                  <span className="atSymbol">@</span>
                  <input 
                    type="text" 
                    name="username" 
                    className="usernameInput input" 
                    placeholder="Escolha um nome de usuário" 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="inputWrapper">
                <span className="floatingLabel">EMAIL</span>
                <input 
                  type="email" 
                  name="email" 
                  className="input" 
                  placeholder="Digite seu email aqui" 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="inputWrapper">
                <span className="floatingLabel">SENHA</span>
                <input 
                  type="password" 
                  name="senha" 
                  className="input" 
                  placeholder="Crie uma senha segura" 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="inputWrapper">
                <span className="floatingLabel">CONFIRME SUA SENHA</span>
                <input 
                  type="password" 
                  name="confirmarSenha" 
                  className="input" 
                  placeholder="Repita a senha para confirmar" 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="inputWrapper">
                <span className="floatingLabel">CELULAR</span>
                <div className="composedInput phoneContainerWrapper">
                  <div className="phoneContainer">
                    <div className="countryCode">
                      <img src="/brasil.png" alt="Brasil" width="20" height="15" />
                      <span>+55</span>
                    </div>
                    <input 
                      type="tel" 
                      name="celular" 
                      className="phoneInput phoneInputInner" 
                      placeholder="Informe seu telefone com DDD" 
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="checkboxContainer">
              <input 
                type="checkbox" 
                id="termos" 
                name="termos" 
                className="checkbox" 
                required 
                disabled={isLoading}
              />
              <label htmlFor="termos" className="checkboxLabel">
                Concordo com mensagens que confiram os cortes, ligação de classificação e dados privados. Todos os dispositivos.
              </label>
            </div>

            <button 
              type="submit" 
              className="submitButton"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Cadastrando...' : 'Cadastrar'}</span>
            </button>
          </form>

          <div className="divider">
            <div className="dividerLine"></div>
            <span className="dividerText">ou continue com</span>
            <div className="dividerLine"></div>
          </div>

        <div className="socialContainer">
          <button 
            type="button" 
            className="socialButton facebookButton" 
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading || socialLoading.facebook}
          >
            <img src="/facebook.png" alt="Facebook" width="24" />
            <span>
              {socialLoading.facebook ? 'Conectando...' : 'Continuar com Facebook'}
            </span>
          </button>

          <button 
            type="button" 
            className="socialButton googleButton" 
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading || socialLoading.google}
          >
            <img src="/google.png" alt="Google" width="24" />
            <span>
              {socialLoading.google ? 'Conectando...' : 'Continuar com Google'}
            </span>
          </button>
        </div>
        </div>

        <footer className="footer">
          <div className="footerContainer">
            <div className="footerLeft">
              <img className="jabutilar" src="/jabutilar.png" alt="jabutilar"/>
              <p>© JabutiLar Inc.<br />All rights reserved</p>

              <div className="footerInfo">
                <img src="/localização.png" alt="Localização" />
                <span>R. Cícero Duarte, 905 - Junco, Picos - PI, 64607-670</span>
              </div>
              <div className="footerInfo">
                <img src="/telefone.png" alt="Telefone" />
                <a href="tel:+5586999230714">(89) 99923-0714</a>
              </div>
            </div>

            <div className="footerCenter">
              <img src="/jabuti.png" alt="Logo Jabuti" />
            </div>

            <div className="footerRight">
              <div className="socialLinks">
                <a href="#"><img src="/instagramblack.png" alt="Instagram" /></a>
                <a href="#"><img src="/facebookblack.png" alt="Facebook" /></a>
                <a href="#"><img src="/linkedinblack.png" alt="LinkedIn" /></a>
                <a href="#"><img src="/twitterblack.png" alt="Twitter" /></a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}