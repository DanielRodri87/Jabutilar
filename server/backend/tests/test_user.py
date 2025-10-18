from http import HTTPStatus
from fastapi.testclient import TestClient
from backend.app import app
import random
import string

from unittest.mock import MagicMock, patch


client = TestClient(app)

# =========================================================
# GERAÇÃO DE DADOS DE TESTE ÚNICOS PARA EVITAR CONFLITO COM O SUPABASE
# =========================================================

# Gera uma string aleatória para garantir que o email seja único a cada execução
unique_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

TEST_EMAIL = f"teste_user_{unique_suffix}@teste.com"
TEST_SENHA = "SenhaSegura123"
TEST_NOME = "User Teste"
TEST_USERNAME = f"user_teste_{unique_suffix}"
TEST_DATA_NASCIMENTO = "1990-01-01"


def test_cadastro_usuario():
    """Testa o endpoint POST /cadastro para criar um novo usuário no Auth e na tabela user_data."""
    dados_cadastro = {
        "email": TEST_EMAIL,
        "senha": TEST_SENHA,
        "nome": TEST_NOME,
        "username": TEST_USERNAME,
        "data_nascimento": TEST_DATA_NASCIMENTO
    }
    
    response = client.post("/cadastro", json=dados_cadastro)
    
    # Sucesso no cadastro
    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == "Usuário cadastrado com sucesso"
    assert "user_id" in response.json()
    assert len(response.json()["user_id"]) > 0 


def test_login_usuario_sucesso():
    """Testa o endpoint POST / (login) com as credenciais válidas criadas no teste anterior."""
    dados_login = {
        "email": TEST_EMAIL,
        "senha": TEST_SENHA
    }
    
    response = client.post("/", json=dados_login)
    
    # Sucesso no login
    assert response.status_code == HTTPStatus.OK
    
    # === CORREÇÃO AQUI ===
    # Acessar o token dentro da chave 'session'
    response_data = response.json()
    assert "session" in response_data
    assert "access_token" in response_data["session"] 
    # =====================
    
    # A próxima asserção deve ser ajustada para refletir a nova estrutura
    assert "user" in response_data
    # Podemos verificar o email no objeto 'user' ou dentro de 'session.user'
    assert response_data["user"]["email"] == TEST_EMAIL


def test_login_usuario_falha_senha_invalida():
    """Testa o endpoint POST / (login) com senha incorreta."""
    dados_login = {
        "email": TEST_EMAIL,
        "senha": "SenhaQuebrada"
    }
    
    response = client.post("/", json=dados_login)
    
    # Falha esperada: 401 Unauthorized
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json()["detail"] == "Email ou senha inválidos"


def test_login_usuario_falha_email_inexistente():
    """Testa o endpoint POST / (login) com email que não existe no Supabase Auth."""
    dados_login = {
        "email": "usuario_falso_999@teste.com",
        "senha": TEST_SENHA
    }
    
    response = client.post("/", json=dados_login)
    
    # Falha esperada: 401 Unauthorized
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json()["detail"] == "Email ou senha inválidos"

def test_cadastro_usuario_falha_auth(mock_user_module):
    """Teste para cobrir 'if not auth_response.user' em cadastrar_usuario."""
    mock_auth_response = MagicMock()
    mock_auth_response.user = None # Simula falha na criação do usuário no Auth
    
    mock_user_module.auth.sign_up.return_value = mock_auth_response
    
    dados_cadastro = {
        "email": "fail@teste.com",
        "senha": TEST_SENHA,
        "nome": TEST_NOME,
        "username": "fail_user",
        "data_nascimento": TEST_DATA_NASCIMENTO
    }
    
    response = client.post("/cadastro", json=dados_cadastro)
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao criar usuário"

def test_login_usuario_excecao_generica(mock_user_module):
    """Teste para cobrir o 'except Exception' genérico em login_usuario."""
    # Simula uma exceção que não seja AuthApiError (ex: erro de rede/cliente)
    mock_user_module.auth.sign_in_with_password.side_effect = Exception("Erro de cliente")
    
    dados_login = {
        "email": TEST_EMAIL,
        "senha": TEST_SENHA
    }
    
    response = client.post("/", json=dados_login)
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json()["detail"] == "Erro interno do servidor"