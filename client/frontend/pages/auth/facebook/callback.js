import React, { useEffect, useState } from 'react';

export default function FacebookCallback() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(`Erro na autenticação: ${errorDescription || error}`);
      // Comunicar erro para a janela pai e fechar popup
      if (window.opener) {
        window.opener.sessionStorage.setItem('facebook_auth_result', 'error');
        setTimeout(() => window.close(), 2000);
      } else {
        // Se não for popup, redirecionar para página de login com erro
        setTimeout(() => {
          window.location.href = '/?error=facebook_auth_failed';
        }, 2000);
      }
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Código de autorização não encontrado.');
      if (window.opener) {
        window.opener.sessionStorage.setItem('facebook_auth_result', 'error');
        setTimeout(() => window.close(), 2000);
      } else {
        setTimeout(() => {
          window.location.href = '/?error=facebook_auth_failed';
        }, 2000);
      }
      return;
    }

    handleFacebookCallback(code);
  }, []);

  async function handleFacebookCallback(code) {
    try {
      // Simular processamento da autenticação
      // Em uma implementação real, você enviaria o código para seu backend
      console.log('Código de autorização recebido:', code);
      
      // Simular dados do usuário (substituir pela chamada real da API)
      const userData = {
        id: 'facebook_user_id',
        name: 'Daniel Rodriguez',
        picture: 'https://via.placeholder.com/150',
        provider: 'facebook'
      };

      setStatus('success');
      setMessage('Login realizado com sucesso! Redirecionando...');
      
      // Store authentication data
      const authToken = 'simulated_facebook_token_' + Date.now();
      
      if (window.opener) {
        // É um popup - comunicar com a janela pai
        window.opener.sessionStorage.setItem('auth_token', authToken);
        window.opener.sessionStorage.setItem('user_data', JSON.stringify(userData));
        window.opener.sessionStorage.setItem('facebook_auth_result', 'success');
        
        // Fechar popup após sucesso
        setTimeout(() => window.close(), 1500);
      } else {
        // Não é popup - armazenar localmente e redirecionar
        sessionStorage.setItem('auth_token', authToken);
        sessionStorage.setItem('user_data', JSON.stringify(userData));
        
        // Redirecionar para /home
        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);
      }
      
    } catch (error) {
      console.error('Erro ao processar callback do Facebook:', error);
      setStatus('error');
      setMessage('Erro ao conectar com o servidor.');
      
      if (window.opener) {
        window.opener.sessionStorage.setItem('facebook_auth_result', 'error');
        setTimeout(() => window.close(), 2000);
      } else {
        setTimeout(() => {
          window.location.href = '/?error=facebook_auth_failed';
        }, 2000);
      }
    }
  }

  return (
    <>
      <style>{`
        .callback-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Airbnb Cereal', sans-serif;
          background-color: #fafafa;
          padding: 20px;
        }
        
        .callback-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }
        
        .status-success {
          color: #22c55e;
        }
        
        .status-error {
          color: #ef4444;
        }
        
        .status-processing {
          color: #6b7280;
        }
        
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #22c55e;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .close-button {
          margin-top: 20px;
          padding: 10px 20px;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-family: 'Airbnb Cereal', sans-serif;
          font-weight: 600;
        }
        
        .close-button:hover {
          background: #16a34a;
        }
      `}</style>
      
      <div className="callback-container">
        <div className="callback-card">
          <h2 className={`status-${status}`}>
            {status === 'success' && '✅ Sucesso!'}
            {status === 'error' && '❌ Erro'}
            {status === 'processing' && '🔄 Processando...'}
          </h2>
          
          {status === 'processing' && <div className="spinner"></div>}
          
          <p className={`status-${status}`}>{message}</p>
          
          {status === 'error' && (
            <button 
              onClick={() => window.opener ? window.close() : (window.location.href = '/')}
              className="close-button"
            >
              {window.opener ? 'Fechar' : 'Voltar ao Login'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
