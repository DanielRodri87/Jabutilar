# 🐢 Jabutilar

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-green)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

Este repositório contém o código fonte do **Jabutilar**, uma aplicação para gerenciamento doméstico (tarefas, compras, contas).

## 📄 Sobre o projeto

O **Jabutilar** é uma solução completa para organizar a rotina de uma casa. O projeto é dividido em um frontend moderno e responsivo e um backend robusto para gerenciamento de dados.

### 🎯 Funcionalidades principais
- **Gerenciamento de tarefas:** Organização e atribuição de tarefas domésticas.
- **Lista de compras:** Controle de itens a serem comprados.
- **Controle de contas:** Gestão de despesas e contas a pagar.
- **Dashboard financeiro:** Visualização clara das finanças domésticas.

## 🛠️ Tecnologias utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

### Frontend
- **Next.js**: Framework React para produção.
- **React**: Biblioteca para construção de interfaces.
- **React Icons**: Ícones para a interface.

### Backend
- **Python**: Linguagem principal do backend.
- **FastAPI**: Framework moderno e rápido para construção de APIs.
- **Supabase**: Backend-as-a-Service para banco de dados e autenticação.

### DevOps
- **Docker & Docker Compose**: Containerização e orquestração dos serviços.

## 🚀 Como executar

### Pré-requisitos
Certifique-se de ter o **Docker** e o **Docker Compose** instalados em sua máquina. O **Make** também é recomendado para facilitar a execução dos comandos.

### Instalação e execução

1. Clone o repositório:
   ```bash
   git clone https://github.com/DanielRodri87/Jabutilar
   cd Jabutilar
   ```

2. Execute o projeto em modo de desenvolvimento (com hot-reload):
   ```bash
   make run_dev
   ```
   Ou, se preferir usar o Docker Compose diretamente:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

3. Acesse a aplicação:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Outros comandos úteis

- **Executar em modo produção:**
  ```bash
  make run
  ```
- **Parar a execução:**
  ```bash
  make down
  ```

## 📂 Estrutura do repositório

```
📂 Jabutilar/
├── 📂 client/
│   └── 📂 frontend/    # Aplicação Next.js
├── 📂 server/
│   └── 📂 backend/     # API Python FastAPI
├── 📄 docker-compose.yml     # Orquestração de containers (Produção)
├── 📄 docker-compose.dev.yml # Orquestração de containers (Desenvolvimento)
├── 📄 Makefile               # Atalhos para comandos comuns
└── 📄 README.md              # Documentação do projeto
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
