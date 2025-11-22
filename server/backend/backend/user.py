from fastapi import HTTPException
from .database import supabase
from .schemas import CadastroRequest, LoginRequest
from supabase_auth.errors import AuthApiError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def cadastrar_usuario(req: CadastroRequest):
    try:
        # 1. Criar usuário no Auth
        logger.info(f"Criando usuário Auth: {req.email}")
        auth_response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.senha
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Erro ao criar usuário no Auth")
            
        user_id = auth_response.user.id

        # 2. Inserir infos na tabela user_data
        # OBS: O frontend envia 'profile_image', mas no banco a coluna é 'image'
        logger.info(f"Inserindo dados no user_data para ID: {user_id}")
        
        dados_usuario = {
            "name": req.nome,
            "username": req.username,
            "date_birth": req.data_nascimento,
            "id_auth": user_id,          # <--- CORREÇÃO CRÍTICA: Vínculo com o login
            "image": req.profile_image   # <--- Mapeia do schema (profile_image) para a coluna do banco (image)
        }

        data_response = supabase.table("user_data").insert(dados_usuario).execute()

        return {
            "message": "Usuário cadastrado com sucesso",
            "user_id": user_id,
            "extra_data": data_response.data
        }

    except AuthApiError as e:
        logger.error(f"Erro AuthApi: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro de registro: {e.message}")
    except Exception as e:
        logger.error(f"Erro geral cadastro: {str(e)}")
        # Verifica se é erro de duplicidade (ex: username já existe)
        if "duplicate key" in str(e):
            raise HTTPException(status_code=400, detail="Nome de usuário ou email já existente.")
        raise HTTPException(status_code=500, detail=str(e))


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
    except Exception as e:
        logger.error(f"Erro interno login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )