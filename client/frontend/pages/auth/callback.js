import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processando autenticação...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obter parâmetros da URL
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          setError(errorDescription || 'Erro na autenticação');
          setTimeout(() => router.push('/cadastro'), 3000);
          return;
        }

        if (!accessToken) {
          setError('Token de acesso não encontrado');
          setTimeout(() => router.push('/cadastro'), 3000);
          return;
        }

        // Recuperar o provider do sessionStorage
        const provider = sessionStorage.getItem('oauth_provider') || 'google';
        
        setStatus('Autenticação bem-sucedida! Redirecionando...');
        
        // Aqui você pode fazer uma chamada adicional ao backend se necessário
        // para sincronizar dados do usuário
        
        // Limpar o sessionStorage
        sessionStorage.removeItem('oauth_provider');
        
        // Redirecionar para a página inicial ou dashboard
        setTimeout(() => {
          router.push('/cadastro_grupo'); // ou outra página apropriada
        }, 2000);
        
      } catch (err) {
        console.error('Erro no callback:', err);
        setError('Erro ao processar autenticação');
        setTimeout(() => router.push('/cadastro'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logotipo.png" alt="Logo" style={styles.logo} />
        
        {error ? (
          <>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorTitle}>Erro na Autenticação</h2>
            <p style={styles.errorMessage}>{error}</p>
            <p style={styles.redirectMessage}>Redirecionando...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>{status}</h2>
            <p style={styles.message}>Aguarde um momento...</p>
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
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
  },
  logo: {
    width: '80px',
    height: '80px',
    marginBottom: '24px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#111827',
  },
  message: {
    fontSize: '16px',
    color: '#6b7280',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#ef4444',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  redirectMessage: {
    fontSize: '14px',
    color: '#9ca3af',
  },
};