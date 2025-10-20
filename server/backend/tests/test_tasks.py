from http import HTTPStatus
from fastapi.testclient import TestClient
from backend.app import app
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

client = TestClient(app)

# Variável para armazenar o ID da tarefa criada nos testes
tarefa_id_teste = None

def test_criar_tarefa():
    """Teste para criar uma nova tarefa"""
    global tarefa_id_teste
    
    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]  # Formato YYYY-MM-DD
    
    nova_tarefa = {
        "titulo": "Limpar a casa",
        "descricao": "Limpar todos os cômodos",
        "datavencimento": data_vencimento,  # Usa a data calculada corretamente
        "prioridade": 4,
        "status": True,
        "recorrente": False,
        "responsavel": 2
    }
    
    response = client.post("/tarefa", json=nova_tarefa)
    
    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()
    assert response.json()["data"]["titulo"] == "Limpar a casa"
    
    # Armazenar o ID para os próximos testes
    tarefa_id_teste = response.json()["data"]["id"]

def test_listar_tarefas():
    """Teste para listar todas as tarefas"""
    response = client.get("/tarefa")
    
    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()
    assert isinstance(response.json()["data"], list)

def test_obter_tarefa():
    """Teste para obter uma tarefa específica"""
    global tarefa_id_teste
    
    if tarefa_id_teste:
        response = client.get(f"/tarefa/{tarefa_id_teste}")
        
        assert response.status_code == HTTPStatus.OK
        assert "data" in response.json()
        assert response.json()["data"]["id"] == tarefa_id_teste

def test_atualizar_tarefa():
    """Teste para atualizar uma tarefa"""
    global tarefa_id_teste
    
    if tarefa_id_teste:
        data_vencimento = (datetime.now() + timedelta(days=10)).isoformat().split('T')[0]  # Formato YYYY-MM-DD
        
        dados_atualizacao = {
            "titulo": "Limpar a casa - Atualizado",
            "descricao": "Limpar todos os cômodos e organizar",
            "prioridade": 2,
            "status": False,
            "datavencimento": data_vencimento,  # Formato correto
            "recorrente": True,
            "responsavel": 2
        }
        
        response = client.put(f"/tarefa/{tarefa_id_teste}", json=dados_atualizacao)
        
        assert response.status_code == HTTPStatus.OK
        assert response.json()["data"]["titulo"] == "Limpar a casa - Atualizado"
        assert response.json()["data"]["status"] == False  # Verificar status booleano

def test_deletar_tarefa():
    """Teste para deletar uma tarefa"""
    global tarefa_id_teste
    
    if tarefa_id_teste:
        response = client.delete(f"/tarefa/{tarefa_id_teste}")
        
        assert response.status_code == HTTPStatus.OK
        assert "message" in response.json()
        assert "Tarefa excluída com sucesso" in response.json()["message"]

def test_obter_tarefa_inexistente():
    """Teste para verificar erro ao buscar tarefa inexistente"""
    response = client.get("/tarefa/999999")
    
    assert response.status_code == HTTPStatus.NOT_FOUND

def test_atualizar_tarefa_inexistente():
    """Teste para verificar erro ao atualizar tarefa inexistente"""
    data_vencimento = (datetime.now() + timedelta(days=5)).isoformat().split('T')[0]  # Formato YYYY-MM-DD
    
    dados_atualizacao = {
        "titulo": "Tarefa Inexistente",
        "descricao": "Esta tarefa não existe",
        "datavencimento": data_vencimento,  # Formato correto
        "prioridade": 2,
        "status": False,
        "recorrente": False,
        "responsavel": 4
    }
    
    response = client.put("/tarefa/999999", json=dados_atualizacao)
    
    assert response.status_code == HTTPStatus.NOT_FOUND

def test_deletar_tarefa_inexistente():
    """Teste para verificar erro ao deletar tarefa inexistente"""
    response = client.delete("/tarefa/999999")
    
    assert response.status_code == HTTPStatus.NOT_FOUND

# Testes com mock para simular falhas e erros

def test_criar_tarefa_falha_supabase(mock_tarefa_module):
    """Teste para cobrir 'if not response.data' em criar_tarefa."""
    mock_tarefa_module.table.return_value.insert.return_value.execute.return_value.data = []
    
    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]  # Formato YYYY-MM-DD
    
    nova_tarefa = {
        "titulo": "Teste Falha",
        "descricao": "Descrição de teste",
        "datavencimento": data_vencimento,  # Formato correto
        "prioridade": 1,
        "status": False,
        "recorrente": False,
        "responsavel": 64
    }
    
    response = client.post("/tarefa", json=nova_tarefa)
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao criar tarefa"

def test_criar_tarefa_excecao(mock_tarefa_module):
    """Teste para cobrir o 'except Exception' genérico em criar_tarefa."""
    mock_tarefa_module.table.return_value.insert.side_effect = Exception("Falha de rede simulada")
    
    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]  # Formato YYYY-MM-DD
    
    nova_tarefa = {
        "titulo": "Teste Exceção",
        "descricao": "Descrição de teste",
        "datavencimento": data_vencimento,  # Formato correto
        "prioridade": 1,
        "status": False,
        "recorrente": False,
        "responsavel": 32
    }
    
    response = client.post("/tarefa", json=nova_tarefa)
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de rede simulada" in response.json()["detail"]

def test_listar_tarefas_excecao(mock_tarefa_module):
    """Teste para cobrir o 'except Exception' genérico em listar_tarefas."""
    mock_tarefa_module.table.return_value.select.side_effect = Exception("Falha de DB simulada")
    
    response = client.get("/tarefa")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de DB simulada" in response.json()["detail"]

def test_obter_tarefa_excecao(mock_tarefa_module):
    """Teste para cobrir o 'except Exception' genérico em obter_tarefa."""
    mock_tarefa_module.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("Erro de leitura")
    
    response = client.get("/tarefa/1")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Erro de leitura" in response.json()["detail"]

def test_atualizar_tarefa_falha_supabase(mock_tarefa_module):
    """Teste para cobrir 'if not response.data' em atualizar_tarefa."""
    # Simula que a tarefa existe (passa no check)
    mock_tarefa_module.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": 1}]
    # Simula falha na atualização
    mock_tarefa_module.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
    
    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]  # Formato YYYY-MM-DD
    
    dados_atualizacao = {
        "titulo": "Teste Falha Update",
        "descricao": "Descrição de teste",
        "datavencimento": data_vencimento,  # Formato correto
        "prioridade": 3,
        "status": False,
        "recorrente": False,
        "responsavel": 21
    }
    
    response = client.put("/tarefa/1", json=dados_atualizacao)
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao atualizar tarefa"

def test_atualizar_tarefa_excecao(mock_tarefa_module):
    """Teste para cobrir o 'except Exception' genérico em atualizar_tarefa."""
    mock_tarefa_module.table.return_value.select.side_effect = Exception("Falha de atualização")
    
    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]  # Formato YYYY-MM-DD
    
    dados_atualizacao = {
        "titulo": "Teste Exceção Update",
        "descricao": "Descrição de teste",
        "datavencimento": data_vencimento,  # Formato correto
        "prioridade": 5,
        "status": True,
        "recorrente": False,
        "responsavel": 2  # Alterado para um inteiro, já que o campo responsavel é int
    }
    
    response = client.put("/tarefa/1", json=dados_atualizacao)
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de atualização" in response.json()["detail"]

def test_excluir_tarefa_falha_supabase(mock_tarefa_module):
    """Teste para cobrir 'if not response.data' em excluir_tarefa."""
    # Simula que a tarefa existe (passa no check)
    mock_tarefa_module.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": 1}]
    # Simula falha na exclusão
    mock_tarefa_module.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = []
    
    response = client.delete("/tarefa/1")
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao excluir tarefa"

def test_excluir_tarefa_excecao(mock_tarefa_module):
    """Teste para cobrir o 'except Exception' genérico em excluir_tarefa."""
    mock_tarefa_module.table.return_value.select.side_effect = Exception("Falha de exclusão")
    
    response = client.delete("/tarefa/1")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de exclusão" in response.json()["detail"]
