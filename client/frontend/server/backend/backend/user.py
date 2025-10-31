from fastapi import HTTPException
from .database import supabase
from .schemas import CadastroRequest, LoginRequest
from supabase_auth.errors import AuthApiError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def cadastrar_usuario(req: CadastroRequest):
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


def login_usuario(req: LoginRequest):
    try:
        logger.info(f"Tentando login com email: {req.email}")
        login_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.senha
        })
        return login_response
    except AuthApiError as e:
        logger.error(f"Erro de autenticação: {str(e)}")
        if "Invalid login credentials" in str(e):
            raise HTTPException(
                status_code=401,
                detail="Email ou senha inválidos"
            )
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao realizar login: {str(e)}"
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )
