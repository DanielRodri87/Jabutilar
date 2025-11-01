import { useState } from 'react';

export default function CadastroGrupo() {
  const [conviteCode, setConviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const handleCadastrar = (e) => {
    e.preventDefault();
    console.log({ conviteCode, groupName, groupDescription });
    alert('Grupo cadastrado com sucesso!');
  };

  return (
    <>
      <style>{`
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

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: white;
          font-family: 'Airbnb Cereal', sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 0 44px;
          margin-top: 35px;
        }

        .logo {
          width: 46%;
          height: 36%;
          align-items: center;
          gap: 10px;
        }

        .containerCadastro {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .cardCadastro {
          width: 685px;
          background-color: #fafafa;
          border-radius: 35px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 32px;
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
          pointer-events: none;
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
            {/* Input convite com botão */}
            <div className="conviteRow">
              <div className="inputWrapper">
                <span className="floatingLabel">CONVITE</span>
                <input
                  type="text"
                  name="convite"
                  className="input"
                  placeholder="Cole aqui o convite de um grupo já existente"
                  value={conviteCode}
                  onChange={(e) => setConviteCode(e.target.value)}
                  required
                />
              </div>

              <button
                type="button"
                className="smallButton"
                onClick={() => alert('Abrir convite')}
              >
                <img src="/open.png" alt="Abrir" />
              </button>
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="dividerLine"></div>
              <span className="dividerText">ou</span>
              <div className="dividerLine"></div>
            </div>

            {/* Campos para criar grupo */}
            <div className="groupFields">
              <p className="subtitle">Crie o seu próprio grupo!</p>

              <div className="inputWrapper">
                <span className="floatingLabel">NOME</span>
                <input
                  type="text"
                  name="nome"
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
                  name="descricao"
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
