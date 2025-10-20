from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schemas de Autenticação (já existentes)
class CadastroRequest(BaseModel):
    email: str
    senha: str
    nome: str
    username: str
    data_nascimento: str  # formato: "YYYY-MM-DD"

class LoginRequest(BaseModel):
    email: str
    senha: str

# Schemas para ItemCompras (NOVOS - adicionar abaixo dos existentes)
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

class TarefasBase(BaseModel):
    titulo: str
    descricao: str
    datavencimento: str # formato: "YYYY-MM-DD"
    prioridade: int
    status: Optional[bool]
    recorrente: Optional[bool]
    responsavel: int
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None