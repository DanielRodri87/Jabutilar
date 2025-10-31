import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/cadastro.module.css';
import RegisterHeader from '../components/RegisterHeader';
import RegisterForm from '../components/RegisterForm';
import SocialLogin from '../components/SocialLogin';
import Footer from '../components/Footer';

export default function CadastroPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Função para lidar com submissão do formulário
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Coloque aqui a lógica para enviar os dados do formulário
      console.log('Dados enviados:', formData);
    } catch (err) {
      setError('Ocorreu um erro ao enviar o formulário');
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com login social
  const handleSocialLogin = (provider) => {
    console.log(`Login com ${provider}`);
    // Aqui você pode chamar sua API ou lógica de login social
  };

  // ✅ Return deve estar no corpo do componente
  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>Entre e organize sua vida caótica</title>
        <meta name="description" content="Página de cadastro do Jabutilar" />
      </Head>

      <RegisterHeader />

      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Entre e organize sua vida caótica</h1>
          <p className={styles.subtitle}>
            Preencha os campos abaixo e deixe o público te achar com o dedo
          </p>

          <RegisterForm 
            onSubmit={handleSubmit}
            error={error}
            loading={loading}
          />

          <SocialLogin onSocialLogin={handleSocialLogin} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
