from http import HTTPStatus
from fastapi.testclient import TestClient
from backend.app import app

from unittest.mock import MagicMock, patch

client = TestClient(app)

# Variável para armazenar o ID do item criado nos testes
item_id_teste = None

def test_criar_item_compra():
    """Teste para criar um novo item de compra"""
    global item_id_teste
    
    novo_item = {
        "nome": "Arroz",
        "quantidade": 2,
        "preco": 15.99,
        "categoria": "Alimentos",
        "comprado": False,
        "id_list": 1
    }
    
    response = client.post("/itens-compra", json=novo_item)
    
    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()
    assert response.json()["data"]["nome"] == "Arroz"
    
    # Armazenar o ID para os próximos testes
    item_id_teste = response.json()["data"]["id"]

def test_listar_itens_compra():
    """Teste para listar todos os itens de compra"""
    response = client.get("/itens-compra")
    
    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()
    assert isinstance(response.json()["data"], list)

def test_listar_itens_por_lista():
    """Teste para listar itens filtrados por id_list"""
    response = client.get("/itens-compra?id_list=1")
    
    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()

def test_obter_item_compra():
    """Teste para obter um item específico"""
    global item_id_teste
    
    if item_id_teste:
        response = client.get(f"/itens-compra/{item_id_teste}")
        
        assert response.status_code == HTTPStatus.OK
        assert "data" in response.json()
        assert response.json()["data"]["id"] == item_id_teste

def test_atualizar_item_compra():
    """Teste para atualizar um item de compra"""
    global item_id_teste
    
    if item_id_teste:
        dados_atualizacao = {
            "nome": "Arroz Integral",
            "quantidade": 3,
            "preco": 18.99
        }
        
        response = client.put(f"/itens-compra/{item_id_teste}", json=dados_atualizacao)
        
        assert response.status_code == HTTPStatus.OK
        assert response.json()["data"]["nome"] == "Arroz Integral"
        assert response.json()["data"]["quantidade"] == 3

def test_marcar_como_comprado():
    """Teste para marcar item como comprado"""
    global item_id_teste
    
    if item_id_teste:
        response = client.patch(f"/itens-compra/{item_id_teste}/comprado?comprado=true")
        
        assert response.status_code == HTTPStatus.OK
        assert response.json()["data"]["comprado"] == True

def test_desmarcar_como_comprado():
    """Teste para desmarcar item como comprado"""
    global item_id_teste
    
    if item_id_teste:
        response = client.patch(f"/itens-compra/{item_id_teste}/comprado?comprado=false")
        
        assert response.status_code == HTTPStatus.OK
        assert response.json()["data"]["comprado"] == False

def test_deletar_item_compra():
    """Teste para deletar um item de compra"""
    global item_id_teste
    
    if item_id_teste:
        response = client.delete(f"/itens-compra/{item_id_teste}")
        
        assert response.status_code == HTTPStatus.OK
        assert "message" in response.json()

def test_obter_item_inexistente():
    """Teste para verificar erro ao buscar item inexistente"""
    response = client.get("/itens-compra/999999")
    
    assert response.status_code == HTTPStatus.NOT_FOUND

def test_atualizar_item_inexistente():
    """Teste para verificar erro ao atualizar item inexistente"""
    dados_atualizacao = {
        "nome": "Teste"
    }
    
    response = client.put("/itens-compra/999999", json=dados_atualizacao)
    
    assert response.status_code == HTTPStatus.NOT_FOUND

def test_deletar_item_inexistente():
    """Teste para verificar erro ao deletar item inexistente"""
    response = client.delete("/itens-compra/999999")
    
    assert response.status_code == HTTPStatus.NOT_FOUND

def test_criar_item_sem_campos_opcionais():
    """Teste para criar item apenas com campos obrigatórios"""
    novo_item = {
        "nome": "Feijão"
    }
    
    response = client.post("/itens-compra", json=novo_item)
    
    assert response.status_code == HTTPStatus.OK
    assert response.json()["data"]["nome"] == "Feijão"
    assert response.json()["data"]["comprado"] == False
    
    # Limpar item criado
    item_id = response.json()["data"]["id"]
    client.delete(f"/itens-compra/{item_id}")

def test_criar_item_compra_falha_supbase(mock_item_compra_module):
    """Teste para cobrir 'if not response.data' em criar_item_compra."""
    mock_item_compra_module.table.return_value.insert.return_value.execute.return_value.data = []
    
    novo_item = {"nome": "Teste Falha"}
    response = client.post("/itens-compra", json=novo_item)
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao criar item de compra"

def test_criar_item_compra_excecao(mock_item_compra_module):
    """Teste para cobrir o 'except Exception' genérico em criar_item_compra."""
    mock_item_compra_module.table.return_value.insert.side_effect = Exception("Falha de rede simulada")
    
    novo_item = {"nome": "Teste Excecao"}
    response = client.post("/itens-compra", json=novo_item)
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de rede simulada" in response.json()["detail"]

def test_listar_itens_compra_excecao(mock_item_compra_module):
    """Teste para cobrir o 'except Exception' genérico em listar_itens_compra."""
    mock_item_compra_module.table.return_value.select.side_effect = Exception("Falha de DB simulada")
    
    response = client.get("/itens-compra")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de DB simulada" in response.json()["detail"]

def test_obter_item_compra_excecao(mock_item_compra_module):
    """Teste para cobrir o 'except Exception' genérico em obter_item_compra."""
    
    # Faz com que a chamada final .execute() dispare a exceção
    mock_item_compra_module.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("Erro de leitura") 
    
    response = client.get("/itens-compra/999")
    
    # Agora a rota deveria capturar a exceção e retornar 500
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Erro de leitura" in response.json()["detail"]

def test_atualizar_item_compra_falha_supabase(mock_item_compra_module):
    """Teste para cobrir 'if not response.data' em atualizar_item_compra (erro 400)."""
    # 1. Simula que o item existe (passa no check)
    # 2. Simula que a atualização falhou (retorna data vazia)
    mock_item_compra_module.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": 999}]
    mock_item_compra_module.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
    
    response = client.put("/itens-compra/999", json={"nome": "Teste"})
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao atualizar item de compra"

def test_atualizar_item_compra_excecao(mock_item_compra_module):
    """Teste para cobrir o 'except Exception' genérico em atualizar_item_compra."""
    mock_item_compra_module.table.return_value.select.side_effect = Exception("Falha de escrita")
    
    response = client.put("/itens-compra/999", json={"nome": "Teste"})
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de escrita" in response.json()["detail"]

def test_deletar_item_compra_excecao(mock_item_compra_module):
    """Teste para cobrir o 'except Exception' genérico em deletar_item_compra."""
    mock_item_compra_module.table.return_value.select.side_effect = Exception("Falha de exclusão")
    
    response = client.delete("/itens-compra/999")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de exclusão" in response.json()["detail"]

def test_marcar_como_comprado_falha_supabase(mock_item_compra_module):
    """Teste para cobrir 'if not response.data' em marcar_como_comprado (erro 400)."""
    # 1. Simula que o item existe (passa no check)
    # 2. Simula que a atualização falhou (retorna data vazia)
    mock_item_compra_module.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": 999}]
    mock_item_compra_module.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
    
    response = client.patch("/itens-compra/999/comprado?comprado=true")
    
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao atualizar status do item"

def test_marcar_como_comprado_excecao(mock_item_compra_module):
    """Teste para cobrir o 'except Exception' genérico em marcar_como_comprado."""
    mock_item_compra_module.table.return_value.select.side_effect = Exception("Falha de atualização de status")
    
    response = client.patch("/itens-compra/999/comprado?comprado=true")
    
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de atualização de status" in response.json()["detail"]