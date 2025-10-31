import Header from '../components/Header';
import Footer from '../components/Footer';
import GroupForm from '../components/GroupForm';
import styles from '../styles/cadastro_grupo.module.css';

export default function CadastroGrupo() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <GroupForm />
      </main>
      <Footer />
    </>
  );
}