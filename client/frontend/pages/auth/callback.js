import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processando autenticação...');
  const [error, setError] = useState('');

  useEffect(() => {
    // Evita execução duplicada no React Strict Mode ou se o router não estiver pronto
    if (!router.isReady) return;

    const handleCallback = async () => {
      try {
        // 1. Tenta obter parâmetros do Hash (#) - Padrão Implicit Flow
        let params = new URLSearchParams(window.location.hash.substring(1));
        let accessToken = params.get('access_token');
        let refreshToken = params.get('refresh_token');
        let errorMsg = params.get('error_description') || params.get('error');

        // 2. Se não encontrar no Hash, tenta na Query String (?) - Padrão PKCE ou erros
        if (!accessToken && !errorMsg) {
          params = new URLSearchParams(window.location.search);
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
          errorMsg = params.get('error_description') || params.get('error');
        }

        // Se houver erro na URL
        if (errorMsg) {
          console.error('Erro retornado pelo provedor:', errorMsg);
          setError(decodeURIComponent(errorMsg));
          setTimeout(() => router.push('/index'), 4000); // Redireciona para login
          return;
        }

        // Se não houver token
        if (!accessToken) {
          // Verificação adicional: Se a URL tiver apenas "code=", é fluxo PKCE.
          // O front precisaria trocar o código pelo token (avançado).
          // Por enquanto, assumimos que o erro é token não encontrado.
          if (params.get('code')) {
             setError('Código de autorização recebido, mas troca de token não implementada no front.');
          } else {
             setError('Token de acesso não encontrado na URL.');
          }
          setTimeout(() => router.push('/index'), 4000);
          return;
        }

        // === SUCESSO ===
        
        // 3. IMPORTANTE: Guardar o Token!
        // Sem isso, o usuário "desloga" assim que muda de página.
        if (typeof window !== 'undefined') {
            localStorage.setItem('supabase_token', accessToken);
            if (refreshToken) localStorage.setItem('supabase_refresh_token', refreshToken);
        }

        setStatus('Autenticação bem-sucedida! A entrar...');
        
        // Limpar dados temporários
        sessionStorage.removeItem('oauth_provider');
        
        // 4. Redirecionamento forçado
        // Usamos window.location.href como fallback se o router falhar
        setTimeout(() => {
          router.push('/home').catch(() => {
            window.location.href = '/home';
          });
        }, 1500);
        
      } catch (err) {
        console.error('Erro crítico no callback:', err);
        setError('Falha interna ao processar login.');
        setTimeout(() => router.push('/index'), 4000);
      }
    };

    handleCallback();
  }, [router.isReady]); // Executa apenas quando o router estiver pronto

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Certifique-se que a imagem existe em public/logotipo.png */}
        <img src="/logotipo.png" alt="JabutiLar" style={styles.logo} onError={(e) => e.target.style.display = 'none'} />
        
        {error ? (
          <>
            <div style={styles.icon}>⚠️</div>
            <h2 style={{...styles.title, color: '#ef4444'}}>Erro na Autenticação</h2>
            <p style={styles.message}>{error}</p>
            <p style={styles.subMessage}>A redirecionar para o início...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>{status}</h2>
            <p style={styles.message}>Estamos a preparar a tua casa...</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
    maxWidth: '90%',
    width: '400px',
  },
  logo: {
    width: '60px',
    height: 'auto',
    marginBottom: '24px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#111827',
  },
  message: {
    fontSize: '15px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  subMessage: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '16px',
  }
};

// Adicionar keyframes para o spinner no CSS global ou via style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}