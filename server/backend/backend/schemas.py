from pydantic import BaseModel

class CadastroRequest(BaseModel):
    email: str
    senha: str
    nome: str
    username: str
    data_nascimento: str  # formato: "YYYY-MM-DD"

class LoginRequest(BaseModel):
    email: str
    senha: str
