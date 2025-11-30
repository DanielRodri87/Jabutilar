from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# ==================== AUTENTICAÇÃO ====================
class CadastroRequest(BaseModel):
    email: str
    senha: str
    nome: str
    username: str
    data_nascimento: str
    profile_image: Optional[str] = "/fotodeperfil.png"
    id_group: Optional[int] = None

class AvatarUpdate(BaseModel):
    image: str

class LoginRequest(BaseModel):
    email: str
    senha: str

class SocialAuthRequest(BaseModel):
    """Schema para requisições de autenticação social"""
    provider: str  # google, facebook, apple
    access_token: str
    id_token: Optional[str] = None
    email: Optional[str] = None
    nome: Optional[str] = None
    username: Optional[str] = None

# ==================== CONTATO ====================
class ContatoRequest(BaseModel):
    primeiro_nome: str
    segundo_nome: str
    celular: str
    email: str

# ==================== ITENS DE COMPRA ====================
class ItemCompraBase(BaseModel):
    nome: str
    quantidade: Optional[int] = None
    preco: Optional[float] = None
    categoria: Optional[str] = None
    comprado: Optional[bool] = False
    id_list: Optional[int] = None

class ItemCompraCreate(ItemCompraBase):
    pass

class ItemCompraUpdate(BaseModel):
    nome: Optional[str] = None
    quantidade: Optional[int] = None
    preco: Optional[float] = None
    categoria: Optional[str] = None
    comprado: Optional[bool] = None
    id_list: Optional[int] = None

class ItemCompraResponse(ItemCompraBase):
    id: int
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==================== TAREFAS ====================
class TarefasBase(BaseModel):
    titulo: str
    descricao: str
    datavencimento: str  # formato: "YYYY-MM-DD"
    prioridade: int
    status: Optional[bool]
    recorrente: Optional[bool]
    responsavel: int
    grupo_id: int                    # << novo campo para vincular ao grupo
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

# ==================== GRUPOS ====================
class GrupoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    # código numérico inteiro de 8 dígitos; opcional na criação/edição
    cod_convite: Optional[int] = None
    group_owner: str
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

# ==================== CONTAS ====================
class ContasBase(BaseModel):
    descricao: str
    valor: float
    datavencimento: str # formato: "YYYY-MM-DD"
    status: Optional[bool]
    categoria: str
    recorrente: Optional[bool]
    resp: int
    grupo_id: int
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

# ==================== Notificacoes ====================
class NotificacaoBase(BaseModel):
    grupo_id: int
    mensagem: str
    tipo: str  # 'tarefa', 'compra', 'conta'

class NotificacaoCreate(NotificacaoBase):
    pass

class NotificacaoResponse(NotificacaoBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True