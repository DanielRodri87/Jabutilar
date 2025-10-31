export default function Home() {
  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#111827' }}>
        Bem-vindo ao Jabutilá
      </h1>
      <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>
        Sistema de Cadastro
      </p>
      <a 
        href="/cadastro"
        style={{
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Ir para Cadastro →
      </a>
    </div>
  );
}