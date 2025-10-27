import React, { useState } from "react";
import { apiEndpoints } from '../config/api';

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const EXIT_DURATION = 900;
    const ENTER_DURATION = 1000;
    const DISPLAY_INTERVAL = 6000;

    const reviews = [
    {
        text: "Adorei a experiência! O site é rápido, intuitivo e me ajudou a encontrar exatamente o que eu precisava. Com certeza vou recomendar para meus amigos.",
        author: "Leonardo, a Tartaruga Ninja",
        stars: 5
    },
    {
        text: "O serviço é muito bom e atendeu às minhas expectativas. Só acho que poderiam ter mais opções de pagamento, mas no geral foi ótimo.",
        author: "Michelangelo, a Tartaruga Ninja",
        stars: 4
    },
    {
        text: "Excelente atendimento e suporte rápido. Resolvi tudo em poucos minutos, sem complicação. Me surpreendeu positivamente!",
        author: "Donatello, a Tartaruga Ninja",
        stars: 5
    },
    {
        text: "Incrível! Layout moderno, atendimento atencioso e funcionamento impecável. É raro encontrar algo tão bem feito hoje em dia.",
        author: "Rafael, a Tartaruga Ninja",
        stars: 5
    },
    ];

    const [currentReview, setCurrentReview] = React.useState(0);
    const [prevReview, setPrevReview] = React.useState(null);
    const [entering, setEntering] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    const currentRef = React.useRef(currentReview);
    React.useEffect(() => { currentRef.current = currentReview; }, [currentReview]);

    function cycleReviews() {
        if (isAnimating) return;
        setIsAnimating(true);

        const next = (currentRef.current + 1) % reviews.length;

        setPrevReview(currentRef.current);

        setTimeout(() => {
            setCurrentReview(next);    
            currentRef.current = next; 
            setPrevReview(null);    
            setEntering(true);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                setEntering(false); 
            }));
            setTimeout(() => {
                setEntering(false);
                setIsAnimating(false);
            }, ENTER_DURATION + 40);
        }, EXIT_DURATION);
    }

    React.useEffect(() => {
        const id = setInterval(() => cycleReviews(), DISPLAY_INTERVAL);
        return () => clearInterval(id);
    }, []);

    async function handleSubmite(event) {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await fetch(apiEndpoints.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login realizado com sucesso!', data);
                
                // Armazenar o token de acesso usando React state em vez de localStorage
                // (localStorage não é suportado em artifacts)
                
                alert('Login realizado com sucesso!');
                
                // Aqui você pode adicionar lógica de redirecionamento
                // ou atualização de estado da aplicação
            } else {
                setErrorMessage(data.detail || 'Erro ao realizar login. Verifique suas credenciais.');
            }
        } catch (error) {
            console.error('Erro ao conectar com o servidor:', error);
            setErrorMessage('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
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

                .containerlogin {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    min-height: 100vh;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .cardlogin {
                    margin-top: -135px;
                    width: 500px;
                    background-color: #fafafaff;
                    border-radius: 35px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    padding: 40px;
                    z-index: 2;
                    position: relative;
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

                .title {
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 700;
                    font-size: 42px;
                    margin-bottom: 10px;
                    letter-spacing: -0.5px;
                }

                .subtitle {
                    font-family: 'Airbnb Cereal', sans-serif;
                    color: #6b7280;
                    font-size: 16px;
                    margin-bottom: 30px;
                }

                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .namesContainer {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .label {
                    display: block;
                    margin-bottom: 8px;
                }

                .inputWrapper {
                    position: relative;
                }

                .floatingLabel {
                    position: absolute;
                    left: 15px;
                    top: 10px;
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
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
                    padding: 28px 15px 10px 15px;
                    border: 1px solid #d1d5db;
                    border-radius: 5px;
                    font-size: 14px;
                    outline: none;
                }

                .input:disabled {
                    background-color: #f3f4f6;
                    cursor: not-allowed;
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

                .buttonContainer {
                    margin-top: 10px;
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
                    font-size: 18px;
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

                .signup-link {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 14px;
                    color: #6b7280;
                    font-family: 'Airbnb Cereal', sans-serif;
                }

                .signup-link a {
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 1s ease;
                }

                .signup-link a:hover {
                    color: #C1D9C1;
                    text-decoration: bold;
                }

                .backgroundlogin {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                    position: relative;
                }

                .backgroundlogin img {
                    margin-left: -90px;
                    width: 100%;
                    max-width: 780px;
                    border-radius: 20px;
                    filter: blur(0px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .explore-text {
                    margin-top: 20px;
                    font-size: 16px;
                    color: #6b7280;
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 400;
                    text-align: left;
                    margin-left: -400px;
                }

                .explore-text img {
                    width: 15px;
                    height: auto;
                    opacity: 0.5;
                    vertical-align: middle;
                    margin-left: 4px;
                }

                .features-container {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    align-items: flex-start;
                    gap: 40px;
                    max-width: 1400px;
                    margin-top: -80px;
                    margin-left: 40px;
                    padding: 0 20px;
                }

                .feature-item {
                    flex: 1;
                    text-align: left;
                    max-width: 400px;
                }

                .feature-item img {
                    width: 10%;
                    height: auto;
                    margin-bottom: 16px;
                    border-radius: 8px;
                }

                .feature-title {
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 700;
                    font-size: 20px;
                    margin-bottom: 8px;
                    color: #111827;
                    letter-spacing: -0.2px;
                }

                .feature-text {
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 300;
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.5;
                }

                .contact-container {
                    position: relative;
                    width: 100%;
                    height: 600px;
                    background: url('/mapa.png') no-repeat center center;
                    background-size: cover;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    margin-top: 80px;
                    border-radius: 20px;
                    overflow: hidden;
                }

                .contact-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 100px;
                }

                .contact-card {
                    background-color: rgba(255, 255, 255, 0.92);
                    border-radius: 35px;
                    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
                    padding: 50px 55px;
                    width: 560px;
                    z-index: 2;
                }

                .contact-card .title {
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 700;
                    font-size: 28px;
                    margin-bottom: 10px;
                }

                .contact-card .subtitle {
                    font-family: 'Airbnb Cereal', sans-serif;
                    color: #6b7280;
                    font-size: 15px;
                    margin-bottom: 30px;
                }

                .namesRow {
                    display: flex;
                    gap: 18px;
                    width: 100%;
                }

                .namesRow .inputWrapper {
                    flex: 1 1 0;
                    width: 100%;
                }

                .namesRow .inputWrapper input {
                    width: 100%;
                }

                .phoneContainerWrapper {
                    width: 100%;
                }

                .phoneContainer {
                    display: flex;
                    align-items: center;
                    border: 1px solid #d1d5db;
                    border-radius: 5px;
                    padding: 8px 10px;
                }

                .countryCode {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 500;
                    color: #111827;
                }

                .phoneInputInner {
                    border: none;
                    outline: none;
                    flex: 1;
                    padding: 8px;
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-size: 14px;
                }

                .phoneInputInner::placeholder {
                    color: rgba(17, 24, 39, 0.5);
                }

                .inputWrapper .floatingLabel {
                    position: absolute;
                    left: 15px;
                    top: 6px;
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
                    color: #111827;
                    pointer-events: none;
                    background: transparent;
                    transition: color 160ms ease;
                }

                .tallPhoneInput {
                    height: 48px;
                    line-height: 48px;
                }

                .loweredPhoneInput {
                    padding-top: 18px;
                }

                .phoneContainer .countryCode {
                    display: flex;
                    align-items: center;
                    padding-top: 12px;
                }

                .reviews-container {
                    position: relative;
                    width: 100%;
                    height: 280px;
                    display: flex;
                    justify-content: center;
                    align-items: left;
                    overflow: hidden;
                    margin-top: 100px;
                    margin-bottom: -100px;
                    background-color: #ffffff;
                }

                .review-item {
                    position: absolute;
                    opacity: 0;
                    transform: translateX(100%);
                    transition:
                        opacity 0.8s ease,
                        transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
                    text-align: left;
                    padding: 0 100px;
                    max-width: 900px;
                    will-change: transform, opacity;
                }

                .review-item.active {
                    opacity: 1;
                    transform: translateX(0);
                }

                .review-item.exit-left {
                    opacity: 0;
                    transform: translateX(-100%);
                }

                .review-text {
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 300;
                    font-size: 18px;
                    color: #111827;
                    margin-bottom: 16px;
                    transition: all 0.8s ease;
                }

                .review-author {
                    font-family: 'Airbnb Cereal', sans-serif;
                    font-weight: 700;
                    font-size: 16px;
                    color: #111827;
                    margin-bottom: 10px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }

                .review-item.active .review-author {
                    opacity: 1;
                    transform: translateY(0);
                }

                .review-stars {
                    display: inline-block;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
                }

                .review-item.active .review-stars {
                    opacity: 1;
                    transform: translateY(0);
                }

                .review-stars img {
                    width: 22px;
                    height: 22px;
                    margin-right: 4px;
                    vertical-align: middle;
                    transform: scale(0.8);
                    transition: transform 0.4s ease;
                }

                .review-item.active .review-stars img {
                    transform: scale(1);
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
                <title>Casa organizada, caos controlado</title>
                <meta name="description" content="Página de login do Jabutilar" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                    <div>
                        <img className="logo" src="/logotipo.png" alt="Logo" width="40" height="40" />
                    </div>
                </div>
                <div className="containerlogin">
                    <div className="cardlogin">
                        <h1 className="title">Casa organizada, caos controlado</h1>
                        <p className="subtitle">Entre agora e tenha toda a vida doméstica em um só lugar, sem complicações.</p>

                        {errorMessage && (
                            <div className="error-message">
                                {errorMessage}
                            </div>
                        )}

                        <form className="form" onSubmit={handleSubmite}>
                            <div className="namesContainer">
                                <div>
                                    <div className="inputWrapper">
                                        <span className="floatingLabel">EMAIL</span>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            className="input" 
                                            placeholder="Digite o seu email aqui" 
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
                                            name="password" 
                                            className="input" 
                                            placeholder="Digite a sua senha aqui" 
                                            required 
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="buttonContainer">
                                <button 
                                    type="submit" 
                                    className="submitButton"
                                    disabled={isLoading}
                                >
                                    <span>{isLoading ? 'Entrando...' : 'Login'}</span>
                                </button>
                            </div>
                            <p className="signup-link">
                                Não possui cadastro? <a href="/cadastro">Cadastre-se</a>
                            </p>
                        </form>
                    </div>
                    <div className="backgroundlogin">
                        <img src="/loginbackground.png" alt="Background" />
                        <p className="explore-text">
                            Explore abaixo e nos conheça mais! <img src="/seta.png" alt="Seta" />
                        </p>
                    </div>
                </div>
                <div className="features-container">
                    <div className="feature-item">
                        <img src="/login1.png" alt="login1" />
                        <h2 className="feature-title">Organização simplificada</h2>
                        <p className="feature-text">Mantenha todas as tarefas, contas e listas de compras da sua casa em um só lugar.</p>
                    </div>
                    <div className="feature-item">
                        <img src="/login2.png" alt="login2" />
                        <h2 className="feature-title">Controle total da sua rotina</h2>
                        <p className="feature-text">Gerencie prazos, lembretes e prioridades da casa de forma prática.</p>
                    </div>
                    <div className="feature-item">
                        <img src="/login3.png" alt="login3" />
                        <h2 className="feature-title">Mais tempo para o que importa</h2>
                        <p className="feature-text">Com a vida centralizada, você foca no que realmente importa.</p>
                    </div>
                </div>

                <div className="contact-container">
                <div className="contact-overlay">
                    <div className="contact-card">
                    <h2 className="title">Entre em contato com a gente!</h2>
                    <p className="subtitle">
                        Estamos prontos — fale conosco e transforme suas ideias em ação!
                    </p>

                    <form className="form" onSubmit={(e) => e.preventDefault()}>
                        <div className="namesRow">
                        <div className="inputWrapper">
                            <span className="floatingLabel">PRIMEIRO NOME</span>
                            <input
                            type="text"
                            name="primeiroNome"
                            className="input"
                            placeholder="Digite o seu nome aqui"
                            required
                            />
                        </div>
                        <div className="inputWrapper">
                            <span className="floatingLabel">SEGUNDO NOME</span>
                            <input
                            type="text"
                            name="segundoNome"
                            className="input"
                            placeholder="Digite seu sobrenome aqui"
                            required
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
                                className="phoneInput phoneInputInner tallPhoneInput loweredPhoneInput"
                                placeholder="Informe seu telefone com DDD"
                                required
                                />
                            </div>
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
                            placeholder="Digite o seu email aqui"
                            required
                            />
                        </div>
                        </div>

                        <div className="buttonContainer">
                        <button type="submit" className="submitButton">
                            <span>Enviar</span>
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
                </div>
                <div className="reviews-container">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className={`review-item ${index === currentReview ? "active" : ""}`}
                        >
                            <p className="review-text">"{review.text}"</p>
                            <p className="review-author">{review.author}</p>
                            <div className="review-stars">
                                {[...Array(review.stars)].map((_, i) => (
                                    <img key={i} src="/estrela.png" alt="Estrela" />
                                ))}
                            </div>
                        </div>
                    ))}
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