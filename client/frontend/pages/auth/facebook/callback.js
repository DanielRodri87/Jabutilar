import React, { useEffect, useState } from 'react';

// URL da API Backend
const API_URL = 'http://localhost:8000';

export default function FacebookCallback() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Conectando ao Facebook...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      handleError(error);
      return;
    }

    if (!code) {
      handleError('Código de autorização não encontrado.');
      return;
    }

    processLogin(code);
  }, []);

  const handleError = (msg) => {
    setStatus('error');
    setMessage(msg);
    if (window.opener) {
      window.opener.sessionStorage.setItem('facebook_auth_result', 'error');
      setTimeout(() => window.close(), 2000);
    } else {
        setTimeout(() => window.location.href = '/', 2000);
    }
  };

  async function processLogin(code) {
    try {
      setMessage('Trocando credenciais com o servidor...');
      
      const response = await fetch(`${API_URL}/auth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Falha no login');
      }

      // SUCESSO
      setStatus('success');
      setMessage(`Bem-vindo(a), ${data.user_data.name}!`);

      const storageData = {
          user_id: data.user_id,
          user_extra: JSON.stringify(data.user_data),
          new_login: data.is_new_user // Flag para abrir o popup
      };

      if (window.opener) {
        // Passar dados para a janela pai
        window.opener.sessionStorage.setItem('user_id', storageData.user_id);
        window.opener.sessionStorage.setItem('user_extra', storageData.user_extra);
        
        if (data.is_new_user) {
            window.opener.sessionStorage.setItem('show_profile_selector', 'true');
        }

        window.opener.sessionStorage.setItem('facebook_auth_result', 'success');
        
        setTimeout(() => window.close(), 1000);
      } else {
        // Caso não seja popup
        sessionStorage.setItem('user_id', storageData.user_id);
        sessionStorage.setItem('user_extra', storageData.user_extra);
        window.location.href = `/main?uid=${data.user_id}${data.is_new_user ? '&new=true' : ''}`;
      }

    } catch (error) {
      console.error(error);
      handleError('Erro ao processar login no servidor.');
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'sans-serif', background: '#fafafa'
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center'
      }}>
        <h2 style={{ color: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#6b7280' }}>
          {status === 'processing' && '🔄 Processando...'}
          {status === 'success' && '✅ Sucesso!'}
          {status === 'error' && '❌ Erro'}
        </h2>
        <p>{message}</p>
      </div>
    </div>
  );
}