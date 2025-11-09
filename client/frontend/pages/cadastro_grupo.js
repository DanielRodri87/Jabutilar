import { useState } from 'react';

export default function CadastroGrupo() {
  const [conviteCode, setConviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 20; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCadastrar = (e) => {
    e.preventDefault();
    if (!groupName.trim() || !groupDescription.trim()) return;

    const code = generateCode();
    setGeneratedCode(code);
    setShowCode(false);
    setCopied(false);
    setShowPopup(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) setShowPopup(false);
  };

  return (
    <>
      <style jsx>{`
        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_Lt.otf') format('opentype');
          font-weight: 300;
        }
        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_Bd.otf') format('opentype');
          font-weight: 700;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: white; font-family: 'Airbnb Cereal', sans-serif; }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 0 44px;
          margin-top: 35px;
        }

        .logo { width: 46%; height: 36%; align-items: center; gap: 10px; }

        .containerCadastro {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          position: relative;
        }

        .cardCadastro {
          width: 685px;
          background-color: #fafafa;
          border-radius: 35px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 32px;
          z-index: 10;
        }

        .title {
          font-weight: 700;
          font-size: 28px;
          margin-bottom: 24px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .conviteRow {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .inputWrapper {
          position: relative;
          flex: 1;
        }

        .floatingLabel {
          position: absolute;
          left: 12px;
          top: 8px;
          font-weight: 700;
          font-size: 12px;
          color: #111827;
          pointer-events: none;
          transition: color 160ms ease;
        }

        .input {
          width: 100%;
          padding: 22px 12px 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 5px;
          font-size: 14px;
          outline: none;
          transition: border-color 160ms ease;
        }

        .input:focus {
          border-color: #667467;
        }

        .inputWrapper:focus-within .floatingLabel {
          color: #667467;
        }

        .smallButton {
          background-color: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.3s ease;
        }

        .smallButton::before {
          content: "";
          position: absolute;
          inset: 0;
          background-color: #C1D9C1;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .smallButton:hover::before {
          opacity: 0.25;
        }

        .smallButton:hover {
          border-color: #667467;
        }

        .smallButton img {
          width: 20px;
          height: 20px;
          position: relative;
          z-index: 1;
        }

        .divider {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin: 24px 0;
          gap: 12px;
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

        .groupFields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .submitButton {
          width: 100%;
          background-color: transparent;
          color: black;
          font-weight: 700;
          padding: 15px 0;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease;
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
        }

        /* POPUP DE CONVITE - FINAL */
        .overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .popup {
          background: white;
          border-radius: 28px;
          padding: 28px;
          width: 90%;
          max-width: 520px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: scaleIn 0.3s ease;
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .popupTitle {
          font-weight: 700;
          font-size: 28px;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
          text-align: center;
          color: #111;
        }

        .codeContainer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9f9f9;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .codeWrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .eyeButton {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eyeButton:hover {
          background: #e5e7eb;
        }

        .eyeButton img {
          width: auto;
          height: 24px;
          object-fit: contain;
        }

        .eyeButton img.naover {
          height: 25px;
        }

        .codeDisplay {
          flex: 1;
          font-family: monospace;
          font-size: 16px;
          letter-spacing: 1.5px;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: text; /* SELECIONÁVEL */
        }

        .copyButton {
          background-color: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease;
          flex-shrink: 0;
        }

        .copyButton::before {
          content: "";
          position: absolute;
          inset: 0;
          background-color: #C1D9C1;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        .copyButton:hover::before {
          opacity: 0.21;
        }

        .copyButton:hover {
          border-color: #667467;
        }

        .copyButton img {
          width: 18px;
          height: 18px;
          position: relative;
          z-index: 1;
          transition: opacity 0.3s ease;
        }

        .copyButton.copied img {
          opacity: 0;
        }

        .copyButton.copied::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 18px;
          height: 18px;
          background: url('/copiado.png') no-repeat center;
          background-size: contain;
          z-index: 1;
        }

        /* FOOTER */
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

        .footerContainer {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          max-width: 1200px;
          margin-left: 20px;
          width: 100%;
        }

        .footerLeft {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .jabutilar { width: 120px; height: auto; }

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

        .footerInfo img { width: 18px; height: 18px; }

        .footerInfo span, .footerInfo a {
          font-size: 13px;
          color: #333;
          text-decoration: none;
        }

        .footerInfo a:hover { color: #22c55e; }

        .footerCenter {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .footerCenter img { width: 150px; height: auto; }

        .footerRight {
          display: flex;
          justify-content: flex-end;
        }

        .socialLinks {
          display: flex;
          gap: 7px;
        }

        .socialLinks img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          transition: opacity 0.2s;
        }

        .socialLinks img:hover { opacity: 0.7; }
      `}</style>

      <header>
        <title>Você ainda não está associado a nenhum grupo</title>
        <meta name="description" content="Página de cadastrar um grupo no Jabutilar" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
          <div>
            <img className="logo" src="/logotipo.png" alt="Logo" width="40" height="40" />
          </div>
        </div>
      </header>

      <div className="containerCadastro">
        <div className="cardCadastro">
          <h1 className="title">
            Você ainda não está associado a nenhum grupo doméstico
          </h1>

          <form className="form" onSubmit={handleCadastrar}>
            <div className="conviteRow">
              <div className="inputWrapper">
                <span className="floatingLabel">CONVITE</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Cole aqui o convite de um grupo já existente"
                  value={conviteCode}
                  onChange={(e) => setConviteCode(e.target.value)}
                />
              </div>
              <button type="button" className="smallButton">
                <img src="/open.png" alt="Abrir" />
              </button>
            </div>

            <div className="divider">
              <div className="dividerLine"></div>
              <span className="dividerText">ou</span>
              <div className="dividerLine"></div>
            </div>

            <div className="groupFields">
              <p className="subtitle">Crie o seu próprio grupo!</p>

              <div className="inputWrapper">
                <span className="floatingLabel">NOME</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Digite o nome do grupo"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="inputWrapper">
                <span className="floatingLabel">DESCRIÇÃO</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Descreva brevemente o seu grupo"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submitButton">
              <span>Cadastrar grupo</span>
            </button>
          </form>
        </div>
      </div>

      {/* POPUP DE CONVITE - FINAL */}
      {showPopup && (
        <div className="overlay" onClick={handleOverlayClick}>
          <div className="popup">
            <h2 className="popupTitle">Convide amigos para o seu grupo</h2>

            <div className="codeContainer">
              <div className="codeWrapper">
                <button
                  className="eyeButton"
                  onClick={() => setShowCode(!showCode)}
                  type="button"
                >
                  <img
                    src={showCode ? '/naover.png' : '/ver.png'}
                    alt={showCode ? 'Ocultar' : 'Ver'}
                    className={showCode ? 'naover' : ''}
                  />
                </button>

                <div className="codeDisplay">
                  {showCode ? generatedCode : '●●●●●●●●●●●●●●●●●●●●'}
                </div>
              </div>

              <button
                className={`copyButton ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                type="button"
              >
                <img
                  src="/copiar.png"
                  alt="Copiar"
                  style={{ opacity: copied ? 0 : 1 }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

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
      </>
  );
}
