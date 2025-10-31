# Guia de Estilos

Este diretório contém todos os arquivos CSS do projeto, seguindo uma estrutura organizada e padrões consistentes.

## Convenções de Nomenclatura

- Todos os arquivos CSS seguem o padrão kebab-case (exemplo: `register-form.module.css`)
- Arquivos CSS são organizados em categorias: componentes, páginas e utilitários
- Nomes devem ser descritivos e indicar claramente o propósito do arquivo

## Estrutura de Arquivos

### Arquivos Base
- `globals.css` - Estilos globais e variáveis CSS
- `utils.module.css` - Classes utilitárias reutilizáveis

### Arquivos de Componentes
- `header.module.css` - Estilos base de header
- `register-header.module.css` - Estilos específicos do header de registro
- `register-form.module.css` - Estilos do formulário de registro
- `group-form.module.css` - Estilos do formulário de grupo
- `social-login.module.css` - Estilos dos botões sociais
- `footer.module.css` - Estilos do footer

### Arquivos de Páginas
- `cadastro.module.css` - Estilos da página de cadastro
- `cadastro-grupo.module.css` - Estilos da página de cadastro de grupo

## Variáveis CSS

Todas as variáveis CSS estão definidas em `globals.css` e incluem:

### Cores
- `--color-primary`: #4ade80
- `--color-primary-dark`: #22c55e
- `--color-secondary`: #6b7280
- `--color-background`: #f5f5f5
- `--color-surface`: #ffffff
- `--color-text-primary`: #111827
- `--color-text-secondary`: #6b7280
- `--color-text-disabled`: #9ca3af
- `--color-border`: #d1d5db

### Espaçamento
- `--spacing-xs`: 0.25rem
- `--spacing-sm`: 0.5rem
- `--spacing-md`: 1rem
- `--spacing-lg`: 1.5rem
- `--spacing-xl`: 2rem

### Border Radius
- `--radius-sm`: 4px
- `--radius-md`: 6px
- `--radius-lg`: 8px

## Boas Práticas

1. Use as variáveis CSS sempre que possível
2. Mantenha os estilos específicos de componentes em seus próprios módulos
3. Evite estilos inline
4. Use classes utilitárias para estilos comuns e repetitivos
5. Mantenha a especificidade CSS baixa
6. Documente quaisquer desvios desses padrões

## Exemplo de Uso

```javascript
import styles from '../styles/register-form.module.css';

function Component() {
  return (
    <div className={styles.container}>
      {/* ... */}
    </div>
  );
}
```

## Manutenção

- Revise periodicamente os estilos não utilizados
- Mantenha a documentação atualizada
- Atualize as variáveis CSS conforme necessário
- Evite duplicação de estilos