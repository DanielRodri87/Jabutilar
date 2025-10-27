from http import HTTPStatus
from fastapi.testclient import TestClient
from backend.app import app
from datetime import datetime, timedelta

client = TestClient(app)

# Variável para armazenar o ID da conta criada nos testes
conta_id_teste = None

def test_criar_conta():
    """Teste para criar uma nova conta"""
    global conta_id_teste

    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]  # YYYY-MM-DD

    nova_conta = {
        "descricao": "Conta de Luz",
        "valor": 150.75,
        "datavencimento": data_vencimento,
        "status": False,
        "categoria": "utilidade",
        "recorrente": True,
        "resp": 1,
        "grupo_id": 10
    }

    response = client.post("/conta", json=nova_conta)

    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()
    assert response.json()["data"]["descricao"] == "Conta de Luz"

    # Armazenar o ID para os próximos testes
    conta_id_teste = response.json()["data"]["id"]

def test_listar_contas():
    """Teste para listar todas as contas"""
    # Usa o grupo_id utilizado na criação (10)
    response = client.get("/conta/10")
    assert response.status_code == HTTPStatus.OK
    assert "data" in response.json()
    assert isinstance(response.json()["data"], list)

def test_obter_conta():
    """Teste para obter uma conta específica"""
    global conta_id_teste
    if conta_id_teste:
        response = client.get(f"/conta/esp/{conta_id_teste}")
        assert response.status_code == HTTPStatus.OK
        assert "data" in response.json()
        assert response.json()["data"]["id"] == conta_id_teste

def test_atualizar_conta():
    """Teste para atualizar uma conta"""
    global conta_id_teste

    if conta_id_teste:
        data_vencimento = (datetime.now() + timedelta(days=10)).isoformat().split('T')[0]

        dados_atualizacao = {
            "descricao": "Conta de Luz - Atualizada",
            "valor": 180.50,
            "datavencimento": data_vencimento,
            "status": True,
            "categoria": "utilidade",
            "recorrente": True,
            "resp": 1,
            "grupo_id": 10
        }

        response = client.put(f"/conta/{conta_id_teste}", json=dados_atualizacao)

        assert response.status_code == HTTPStatus.OK
        assert response.json()["data"]["descricao"] == "Conta de Luz - Atualizada"
        assert response.json()["data"]["status"] == True

def test_deletar_conta():
    """Teste para deletar uma conta"""
    global conta_id_teste

    if conta_id_teste:
        response = client.delete(f"/conta/{conta_id_teste}")

        assert response.status_code == HTTPStatus.OK
        assert "message" in response.json()
        assert "Conta deletada com sucesso" in response.json()["message"]

def test_obter_conta_inexistente():
    """Teste para verificar erro ao buscar conta inexistente"""
    response = client.get("/conta/esp/999999")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Conta não encontrada"

def test_atualizar_conta_inexistente():
    """Teste para verificar erro ao atualizar conta inexistente"""
    data_vencimento = (datetime.now() + timedelta(days=5)).isoformat().split('T')[0]
    dados_atualizacao = {
        "descricao": "Conta Inexistente",
        "valor": 99.99,
        "datavencimento": data_vencimento,
        "status": False,
        "categoria": "outras",
        "recorrente": False,
        "resp": 2,
        "grupo_id": 10
    }
    response = client.put("/conta/999999", json=dados_atualizacao)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Conta não encontrada para atualização"

def test_deletar_conta_inexistente():
    """Teste para verificar erro ao deletar conta inexistente"""
    response = client.delete("/conta/999999")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Conta não encontrada para exclusão"

# Testes com mock para simular falhas e erros

def test_criar_conta_falha_supabase(mock_contas_module):
    """Teste para cobrir 'if not response.data' em criar_conta."""
    mock_contas_module.table.return_value.insert.return_value.execute.return_value.data = []

    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]

    nova_conta = {
        "descricao": "Teste Falha",
        "valor": 10.0,
        "datavencimento": data_vencimento,
        "status": False,
        "categoria": "teste",
        "recorrente": False,
        "resp": 1,
        "grupo_id": 1
    }

    response = client.post("/conta", json=nova_conta)

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Erro ao criar Conta"

def test_criar_conta_excecao(mock_contas_module):
    """Teste para cobrir o 'except Exception' genérico em criar_conta."""
    mock_contas_module.table.return_value.insert.side_effect = Exception("Falha de rede simulada")

    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]

    nova_conta = {
        "descricao": "Teste Exceção",
        "valor": 20.0,
        "datavencimento": data_vencimento,
        "status": False,
        "categoria": "teste",
        "recorrente": False,
        "resp": 1,
        "grupo_id": 1
    }

    response = client.post("/conta", json=nova_conta)

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de rede simulada" in response.json()["detail"]

def test_listar_contas_excecao(mock_contas_module):
    """Teste para cobrir o 'except Exception' genérico em listar_contas."""
    mock_contas_module.table.return_value.select.side_effect = Exception("Falha de DB simulada")
    response = client.get("/conta/1")
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de DB simulada" in response.json()["detail"]

def test_obter_conta_excecao(mock_contas_module):
    """Teste para cobrir o 'except Exception' genérico em obter_conta."""
    mock_contas_module.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("Erro de leitura")
    response = client.get("/conta/esp/1")
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Erro de leitura" in response.json()["detail"]

def test_atualizar_conta_falha_supabase(mock_contas_module):
    """Teste para cobrir 'if not response.data' em atualizar_conta."""
    # Simula falha na atualização (retorno vazio)
    mock_contas_module.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]
    dados_atualizacao = {
        "descricao": "Teste Falha Update",
        "valor": 33.3,
        "datavencimento": data_vencimento,
        "status": False,
        "categoria": "teste",
        "recorrente": False,
        "resp": 1,
        "grupo_id": 1
    }
    response = client.put("/conta/1", json=dados_atualizacao)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Conta não encontrada para atualização"

def test_atualizar_conta_excecao(mock_contas_module):
    """Teste para cobrir o 'except Exception' genérico em atualizar_conta."""
    mock_contas_module.table.return_value.update.side_effect = Exception("Falha de atualização")
    data_vencimento = (datetime.now() + timedelta(days=7)).isoformat().split('T')[0]
    dados_atualizacao = {
        "descricao": "Teste Exceção Update",
        "valor": 44.4,
        "datavencimento": data_vencimento,
        "status": True,
        "categoria": "teste",
        "recorrente": True,
        "resp": 2,
        "grupo_id": 1
    }
    response = client.put("/conta/1", json=dados_atualizacao)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de atualização" in response.json()["detail"]

def test_excluir_conta_falha_supabase(mock_contas_module):
    """Teste para cobrir 'if not response.data' em excluir_conta."""
    # Simula falha na exclusão (retorno vazio)
    mock_contas_module.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = []
    response = client.delete("/conta/1")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Conta não encontrada para exclusão"

def test_excluir_conta_excecao(mock_contas_module):
    """Teste para cobrir o 'except Exception' genérico em excluir_conta."""
    mock_contas_module.table.return_value.delete.side_effect = Exception("Falha de exclusão")
    response = client.delete("/conta/1")
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Falha de exclusão" in response.json()["detail"]
