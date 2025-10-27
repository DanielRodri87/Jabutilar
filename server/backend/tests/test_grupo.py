from http import HTTPStatus
from fastapi.testclient import TestClient
from backend.app import app
from unittest.mock import MagicMock
import random
import string

client = TestClient(app)

# Variável para armazenar o ID do grupo criado nos testes
grupo_id_teste = None

# Gera código de convite único para evitar conflitos
unique_suffix = ''.join(random.choices(string.digits, k=6))
COD_CONVITE_TESTE = int(unique_suffix)

def test_criar_grupo():
    """Teste para criar um novo grupo"""
    global grupo_id_teste
    
    novo_grupo = {
        "nome": "Grupo Família",
        "descricao": "Grupo para organizar tarefas familiares",
        "cod_convite": COD_CONVITE_TESTE,
        "group_owner": 1
    }
    
    response = client.post("/grupo", json=novo_grupo)
    
    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()
    assert response.json()["data"]["nome"] == "Grupo Família"
    assert response.json()["message"] == "Grupo criado com sucesso"
    
    # Armazenar o ID para os próximos testes
    grupo_id_teste = response.json()["data"]["id"]

def test_obter_grupo():
    """Teste para obter um grupo específico"""
    global grupo_id_teste
    
    if grupo_id_teste:
        response = client.get(f"/grupo/{grupo_id_teste}")
        
        assert response.status_code == HTTPStatus.OK
        assert "data" in response.json()
        assert response.json()["data"]["id"] == grupo_id_teste
        assert response.json()["message"] == "Grupo encontrado"

def test_atualizar_grupo():
    """Teste para atualizar um grupo"""
    global grupo_id_teste
    
    if grupo_id_teste:
        dados_atualizacao = {
            "nome": "Grupo Família - Atualizado",
            "descricao": "Descrição atualizada do grupo",
            "cod_convite": COD_CONVITE_TESTE,
            "group_owner": 1
        }
        
        response = client.put(f"/grupo/{grupo_id_teste}", json=dados_atualizacao)
        
        assert response.status_code == HTTPStatus.OK
        assert response.json()["data"]["nome"] == "Grupo Família - Atualizado"
        assert response.json()["data"]["descricao"] == "Descrição atualizada do grupo"
        assert response.json()["message"] == "Grupo atualizado com sucesso"

def test_excluir_grupo():
    """Teste para excluir um grupo"""
    global grupo_id_teste
    
    if grupo_id_teste:
        response = client.delete(f"/grupo/{grupo_id_teste}")
        
        assert response.status_code == HTTPStatus.OK
        assert "message" in response.json()
        assert "Grupo excluído com sucesso" in response.json()["message"]

def test_obter_grupo_inexistente():
    """Teste para verificar erro ao buscar grupo inexistente"""
    response = client.get("/grupo/999999")
    
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == "Grupo com ID 999999 não encontrado"

def test_atualizar_grupo_inexistente():
    """Teste para verificar erro ao atualizar grupo inexistente"""
    dados_atualizacao = {
        "nome": "Grupo Inexistente",
        "descricao": "Este grupo não existe",
        "cod_convite": 123456,
        "group_owner": 1
    }
    
    response = client.put("/grupo/999999", json=dados_atualizacao)
    
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == "Grupo com ID 999999 não encontrado"

def test_excluir_grupo_inexistente():
    """Teste para verificar erro ao excluir grupo inexistente"""
    response = client.delete("/grupo/999999")
    
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == "Grupo com ID 999999 não encontrado"

# ==================== Testes com Mock para Cobertura 100% ====================

def test_criar_grupo_falha_supabase(mock_grupo_module):
    """Teste para cobrir 'if not response.data' em criar_grupo."""
    mock_grupo_module.table.return_value.insert.return_value.execute.return_value.data = []
    
    novo_grupo = {
        "nome": "Teste Falha",
        "descricao": "Descrição de teste",
        "cod_convite": 111111,
        "group_owner": 1
    }
    
    response = client.post("/grupo", json=novo_grupo)
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao criar grupo"

def test_criar_grupo_excecao(mock_grupo_module):
    """Teste para cobrir o 'except Exception' genérico em criar_grupo."""
    mock_grupo_module.table.return_value.insert.side_effect = Exception("Falha de rede simulada")
    
    novo_grupo = {
        "nome": "Teste Exceção",
        "descricao": "Descrição de teste",
        "cod_convite": 222222,
        "group_owner": 1
    }
    
    response = client.post("/grupo", json=novo_grupo)
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de rede simulada" in response.json()["detail"]

def test_obter_grupo_excecao(mock_grupo_module):
    """Teste para cobrir o 'except Exception' genérico em obter_grupo."""
    mock_grupo_module.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("Erro de leitura")
    
    response = client.get("/grupo/1")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Erro de leitura" in response.json()["detail"]

def test_atualizar_grupo_falha_supabase(mock_grupo_module):
    """Teste para cobrir 'if not response.data' em atualizar_grupo (erro 400)."""
    # Simula que o grupo existe (passa no check)
    mock_grupo_module.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": 1}]
    # Simula falha na atualização
    mock_grupo_module.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
    
    dados_atualizacao = {
        "nome": "Teste Falha Update",
        "descricao": "Descrição de teste",
        "cod_convite": 333333,
        "group_owner": 1
    }
    
    response = client.put("/grupo/1", json=dados_atualizacao)
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao atualizar grupo"

def test_atualizar_grupo_excecao(mock_grupo_module):
    """Teste para cobrir o 'except Exception' genérico em atualizar_grupo."""
    mock_grupo_module.table.return_value.select.side_effect = Exception("Falha de atualização")
    
    dados_atualizacao = {
        "nome": "Teste Exceção Update",
        "descricao": "Descrição de teste",
        "cod_convite": 444444,
        "group_owner": 1
    }
    
    response = client.put("/grupo/1", json=dados_atualizacao)
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de atualização" in response.json()["detail"]

def test_excluir_grupo_falha_supabase(mock_grupo_module):
    """Teste para cobrir 'if not response.data' em excluir_grupo (erro 400)."""
    # Simula que o grupo existe (passa no check)
    mock_grupo_module.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": 1}]
    # Simula falha na exclusão
    mock_grupo_module.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = []
    
    response = client.delete("/grupo/1")
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao excluir grupo"

def test_excluir_grupo_excecao(mock_grupo_module):
    """Teste para cobrir o 'except Exception' genérico em excluir_grupo."""
    mock_grupo_module.table.return_value.select.side_effect = Exception("Falha de exclusão")
    
    response = client.delete("/grupo/1")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de exclusão" in response.json()["detail"]