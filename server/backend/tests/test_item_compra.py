from http import HTTPStatus
from fastapi.testclient import TestClient
from backend.app import app

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