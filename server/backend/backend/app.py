from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PORT = int(os.getenv("PORT", 8000))

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL ou SUPABASE_KEY não foram carregados")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()


# Schemas
class CadastroRequest(BaseModel):
    email: str
    senha: str
    nome: str
    username: str
    data_nascimento: str  # formato: "YYYY-MM-DD"


class LoginRequest(BaseModel):
    email: str
    senha: str


# Rota para cadastro
@app.post("/cadastro")
def cadastro(req: CadastroRequest):
    # 1. Criar usuário no Auth
    auth_response = supabase.auth.sign_up({
        "email": req.email,
        "password": req.senha
    })

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Erro ao criar usuário")

    # 2. Inserir infos na tabela user_data
    data_response = supabase.table("user_data").insert({
        "name": req.nome,
        "username": req.username,
        "date_birth": req.data_nascimento
    }).execute()

    return {
        "message": "Usuário cadastrado com sucesso",
        "user_id": auth_response.user.id,
        "extra_data": data_response.data
    }


# Rota de login (será o '/')
@app.post("/")
def login(req: LoginRequest):
    login_response = supabase.auth.sign_in_with_password({
        "email": req.email,
        "password": req.senha
    })

    if not login_response.session:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    return {
        "message": "Login realizado com sucesso",
        "access_token": login_response.session.access_token,
        "refresh_token": login_response.session.refresh_token
    }
