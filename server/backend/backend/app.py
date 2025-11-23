from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .social_auth import process_social_callback

from .schemas import (
    CadastroRequest, 
    LoginRequest, 
    ItemCompraCreate, 
    ItemCompraUpdate,
    ItemCompraResponse,
    TarefasBase,
    GrupoBase,
    ContasBase,
    SocialAuthRequest,
    AvatarUpdate
)
from .user import cadastrar_usuario, login_usuario, editar_usuario, atualizar_grupo_usuario, obter_usuario, atualizar_avatar_usuario
from .social_auth import get_oauth_url, login_social 

from .item_compra import (
    criar_item_compra,
    listar_itens_compra,
    obter_item_compra,
    atualizar_item_compra,
    deletar_item_compra,
    marcar_como_comprado
)

from .tarefas import (
    criar_tarefa, 
    listar_tarefas, 
    excluir_tarefa,
    obter_tarefa, 
    atualizar_tarefa
)

from .grupo import (
    criar_grupo,
    obter_grupo,
    atualizar_grupo,
    excluir_grupo,
    obter_grupo_por_codigo,
)

from .contas import (
    criar_conta,
    atualizar_conta,
    listar_contas,
    obter_conta,
    deletar_conta
)

class CallbackRequest(BaseModel):
    code: str

from typing import List, Optional

app = FastAPI(
    title="API Backend",
    description="API para gerenciamento de usuários e itens de compra",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Rotas de Autenticação ====================
@app.post("/cadastro", tags=["Autenticação"])
def cadastro(req: CadastroRequest):
    """Cadastrar um novo usuário"""
    return cadastrar_usuario(req)

@app.patch("/usuario/{id_user}/avatar")
def update_avatar(id_user: str, req: AvatarUpdate):
    return atualizar_avatar_usuario(id_user, req)

@app.post("/", tags=["Autenticação"])
def login(req: LoginRequest):
    """Realizar login de usuário"""
    return login_usuario(req)

@app.post("/auth/callback", tags=["Autenticação Social"])
def callback_social(req: CallbackRequest):
    """
    Processa o código retornado pelo provedor (Facebook/Google)
    """
    from .social_auth import process_social_callback # Importação local para evitar ciclo se necessário
    return process_social_callback(req.code)

@app.get("/usuario/{id_user}", response_model=dict, tags=["Autenticação"])
def obter_dados_usuario(id_user: str):
    """
    Obter dados do usuário na tabela user_data usando id_auth = id_user.
    Usado pelo frontend para saber se o usuário já está vinculado a um grupo (id_group).
    """
    return obter_usuario(id_user)

@app.put("/usuario/{id_user}", response_model=dict, tags=["Autenticação"])
def atualizar_usuario(id_user: str, req: CadastroRequest):
    """Atualizar dados do usuário"""
    return editar_usuario(id_user, req)

@app.patch("/usuario/{id_user}/grupo", response_model=dict, tags=["Autenticação"])
def atualizar_grupo_do_usuario(id_user: str, grupo_id: int | None = Query(None, description="ID do grupo ou None para remover")):
    """
    Atualiza apenas o id_group do usuário na tabela user_data.
    Envie um grupo_id válido para vincular, ou deixe como null/None para remover o vínculo.
    """
    return atualizar_grupo_usuario(id_user, grupo_id)

# ==================== Rotas de Autenticação Social ====================
# Rotas descomentadas e funcionais
@app.get("/auth/{provider}/url", tags=["Autenticação Social"])
def obter_url_oauth(provider: str):
    """
    Obtém a URL para iniciar o fluxo OAuth com o provider especificado
    Providers suportados: google, facebook, apple
    """
    return get_oauth_url(provider)

@app.post("/auth/social", tags=["Autenticação Social"])
def autenticar_social(req: SocialAuthRequest):
    """
    Realiza autenticação usando providers sociais
    O Supabase gerencia automaticamente o fluxo OAuth
    """
    return login_social(req)

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


# Caminhos das Tarefas.

@app.post("/tarefa", response_model=dict, tags=["Tarefa"])
def criar_task(item: TarefasBase):
    """Criar uma nova Tarefa"""
    return criar_tarefa(item)

@app.get("/tarefa", response_model=dict, tags=["Tarefa"])
def listar_itens():
    """Listar todos as Tarefas"""
    return listar_tarefas()

@app.get("/tarefa/{task_id}", response_model=dict, tags=["Tarefa"])
def obter_tarefas(task_id: int):
    """Obter uma Tarefa específica por ID"""
    return obter_tarefa(task_id)

@app.put("/tarefa/{task_id}", response_model=dict, tags=["Tarefa"])
def atualizar_item(task_id: int, task: TarefasBase):
    """Atualizar uma Tarefa existente"""
    return atualizar_tarefa(task_id, task)

@app.delete("/tarefa/{item_id}", response_model=dict, tags=["Tarefa"])
def deletar_item(item_id: int):
    """Deletar uma Tarefa"""
    return excluir_tarefa(item_id)

# CAMINHO GRUPO

@app.post("/grupo", response_model=dict, tags=["Grupo"])
def criar_novo_grupo(grupo: GrupoBase):
    """Criar um novo grupo (gera cod_convite se não for enviado)"""
    return criar_grupo(grupo)

@app.get("/grupo/{grupo_id}", response_model=dict, tags=["Grupo"])
def obter_dados_grupo(grupo_id: int):
    """Obter um grupo pelo ID"""
    return obter_grupo(grupo_id)

@app.get("/grupo/codigo/{cod_convite}", response_model=dict, tags=["Grupo"])
def obter_dados_grupo_por_codigo(cod_convite: int):
    """Obter um grupo pelo código de convite (inteiro de 8 dígitos)"""
    return obter_grupo_por_codigo(cod_convite)

@app.put("/grupo/{grupo_id}", response_model=dict, tags=["Grupo"])
def atualizar_dados_grupo(grupo_id: int, grupo: GrupoBase):
    """Atualizar um grupo existente (mantém ou gera cod_convite)"""
    return atualizar_grupo(grupo_id, grupo)

@app.delete("/grupo/{grupo_id}", response_model=dict, tags=["Grupo"])
def excluir_dados_grupo(grupo_id: int):
    """Excluir um grupo existente"""
    return excluir_grupo(grupo_id)

#Caminhos Contas

@app.post("/conta", response_model=dict, tags=["Conta"])
def criar_nova_conta(conta: ContasBase):
    """Criar uma nova conta"""
    return criar_conta(conta)

@app.get("/conta/{grupo_id}", response_model=dict, tags=["Conta"])
def listar_dados_conta(grupo_id: int):
    """Listar todas as contas de um grupo"""
    return listar_contas(grupo_id)

@app.get("/conta/esp/{conta_id}", response_model=dict, tags=["Conta"])
def obter_dados_conta(conta_id: int):
    """Obter uma conta pelo ID"""
    return obter_conta(conta_id)

@app.put("/conta/{conta_id}", response_model=dict, tags=["Conta"])
def atualizar_dados_conta(conta_id: int, conta: ContasBase):
    """Atualizar uma conta existente"""
    return atualizar_conta(conta_id, conta)

@app.delete("/conta/{conta_id}", response_model=dict, tags=["Conta"])
def excluir_dados_conta(conta_id: int):
    """Excluir uma conta existente"""
    return deletar_conta(conta_id)