from fastapi import FastAPI, Query
from .schemas import (
    CadastroRequest, 
    LoginRequest, 
    ItemCompraCreate, 
    ItemCompraUpdate,
    ItemCompraResponse
)
from .user import cadastrar_usuario, login_usuario
from .item_compra import (
    criar_item_compra,
    listar_itens_compra,
    obter_item_compra,
    atualizar_item_compra,
    deletar_item_compra,
    marcar_como_comprado
)
from typing import List, Optional

app = FastAPI(
    title="API Backend",
    description="API para gerenciamento de usuários e itens de compra",
    version="0.1.0"
)

# ==================== Rotas de Autenticação ====================
@app.post("/cadastro", tags=["Autenticação"])
def cadastro(req: CadastroRequest):
    """Cadastrar um novo usuário"""
    return cadastrar_usuario(req)

@app.post("/", tags=["Autenticação"])
def login(req: LoginRequest):
    """Realizar login de usuário"""
    return login_usuario(req)

# ==================== Rotas de Itens de Compra (CRUD) ====================
@app.post("/itens-compra", response_model=dict, tags=["Itens de Compra"])
def criar_item(item: ItemCompraCreate):
    """Criar um novo item de compra"""
    return criar_item_compra(item)

@app.get("/itens-compra", response_model=dict, tags=["Itens de Compra"])
def listar_itens(id_list: Optional[int] = Query(None, description="Filtrar por ID da lista")):
    """Listar todos os itens de compra ou filtrar por id_list"""
    return listar_itens_compra(id_list)

@app.get("/itens-compra/{item_id}", response_model=dict, tags=["Itens de Compra"])
def obter_item(item_id: int):
    """Obter um item de compra específico por ID"""
    return obter_item_compra(item_id)

@app.put("/itens-compra/{item_id}", response_model=dict, tags=["Itens de Compra"])
def atualizar_item(item_id: int, item: ItemCompraUpdate):
    """Atualizar um item de compra existente"""
    return atualizar_item_compra(item_id, item)

@app.delete("/itens-compra/{item_id}", response_model=dict, tags=["Itens de Compra"])
def deletar_item(item_id: int):
    """Deletar um item de compra"""
    return deletar_item_compra(item_id)

@app.patch("/itens-compra/{item_id}/comprado", response_model=dict, tags=["Itens de Compra"])
def marcar_item_comprado(item_id: int, comprado: bool = Query(True, description="Marcar como comprado (true) ou não comprado (false)")):
    """Marcar ou desmarcar um item como comprado"""
    return marcar_como_comprado(item_id, comprado)