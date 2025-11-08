import React, { useState, useEffect } from 'react';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    const authToken = sessionStorage.getItem('auth_token');
    const userDataStr = sessionStorage.getItem('user_data');
    
    if (!authToken || !userDataStr) {
      // Se não estiver logado, redirecionar para login
      window.location.href = '/';
      return;
    }
    
    try {
      const user = JSON.parse(userDataStr);
      setUserData(user);
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error);
      // Limpar dados corrompidos e redirecionar
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      window.location.href = '/';
      return;
    }
    
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    // Limpar dados de autenticação
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('facebook_auth_result');
    
    // Redirecionar para página de login
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Airbnb Cereal, sans-serif'
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Airbnb Cereal';
          src: url('../fonts/AirbnbCereal_W_Bd.otf') format('opentype');
          font-weight: 700;
          font-style: normal;
        }
        
        .home-container {
          min-height: 100vh;
          background-color: #fafafa;
          font-family: 'Airbnb Cereal', sans-serif;
        }
        
        .header {
          background: white;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-weight: 700;
          font-size: 24px;
          color: #22c55e;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }
        
        .logout-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .logout-button:hover {
          background: #dc2626;
        }
        
        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .welcome-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin-bottom: 30px;
        }
        
        .welcome-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 10px;
        }
        
        .welcome-subtitle {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .feature-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
        }
        
        .feature-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 10px;
        }
        
        .feature-description {
          color: #6b7280;
          line-height: 1.6;
        }
      `}</style>
      
      <div className="home-container">
        <header className="header">
          <div className="logo">🏠 JabutiLar</div>
          
          <div className="user-info">
            <div className="user-avatar">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span>Olá, {userData?.name || 'Usuário'}!</span>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        </header>
        
        <main className="content">
          <div className="welcome-card">
            <h1 className="welcome-title">
              Bem-vindo ao JabutiLar! 🎉
            </h1>
            <p className="welcome-subtitle">
              Sua casa organizada em um só lugar
            </p>
            <p>
              Login realizado com {userData?.provider === 'facebook' ? 'Facebook' : 'Email'} ✅
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">📝 Tarefas Domésticas</h3>
              <p className="feature-description">
                Organize e acompanhe todas as tarefas da sua casa de forma simples e eficiente.
              </p>
            </div>
            
            <div className="feature-card">
              <h3 className="feature-title">🛒 Lista de Compras</h3>
              <p className="feature-description">
                Crie e gerencie listas de compras compartilhadas com sua família.
              </p>
            </div>
            
            <div className="feature-card">
              <h3 className="feature-title">💰 Controle de Gastos</h3>
              <p className="feature-description">
                Monitore os gastos da casa e mantenha o orçamento sempre em dia.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
