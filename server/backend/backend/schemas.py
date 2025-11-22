from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ==================== AUTENTICAÇÃO ====================
class CadastroRequest(BaseModel):
    email: str
    senha: str
    nome: str
    username: str
    data_nascimento: str  # formato: "YYYY-MM-DD"
    profile_image: Optional[str] = "client/frontend/public/fotodeperfil.png"

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
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

# ==================== GRUPOS ====================
class GrupoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cod_convite: int
    group_owner: int
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