import React, { useEffect, useState } from 'react';
import { apiEndpoints } from '../config/api';

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
      }
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Código de autorização não encontrado.');
      if (window.opener) {
        window.opener.sessionStorage.setItem('facebook_auth_result', 'error');
        setTimeout(() => window.close(), 2000);
      }
      return;
    }

    handleFacebookCallback(code);
  }, []);

  async function handleFacebookCallback(code) {
    try {
      const response = await fetch(`${apiEndpoints.base}/auth/facebook/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: `${window.location.origin}/auth/facebook/callback`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Login realizado com sucesso! Fechando janela...');
        
        // Store authentication data na janela pai
        if (window.opener) {
          if (data.access_token) {
            window.opener.sessionStorage.setItem('auth_token', data.access_token);
            window.opener.sessionStorage.setItem('user_data', JSON.stringify(data.user));
          }
          window.opener.sessionStorage.setItem('facebook_auth_result', 'success');
          
          // Fechar popup após sucesso
          setTimeout(() => window.close(), 1500);
        }
      } else {
        setStatus('error');
        setMessage(data.detail || 'Erro ao processar autenticação.');
        if (window.opener) {
          window.opener.sessionStorage.setItem('facebook_auth_result', 'error');
          setTimeout(() => window.close(), 2000);
        }
      }
    } catch (error) {
      console.error('Erro ao processar callback do Facebook:', error);
      setStatus('error');
      setMessage('Erro ao conectar com o servidor.');
      if (window.opener) {
        window.opener.sessionStorage.setItem('facebook_auth_result', 'error');
        setTimeout(() => window.close(), 2000);
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
              onClick={() => window.close()}
              className="close-button"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
