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

        # --- NOVO: padroniza resposta para o frontend ---
        user = getattr(login_response, "user", None)
        session = getattr(login_response, "session", None)
        if not user:
            raise HTTPException(
                status_code=500,
                detail="Resposta de autenticação inválida (usuário não encontrado)"
            )

        user_id = user.id
        logger.info(f"Login bem-sucedido. id_auth={user_id}")

        # Busca dados adicionais em user_data, se existirem
        try:
            extra = (
                supabase
                .table("user_data")
                .select("*")
                .eq("id_auth", user_id)
                .single()
                .execute()
            )
            extra_data = extra.data
        except Exception as e:
            logger.warning(f"Não foi possível carregar user_data para {user_id}: {e}")
            extra_data = None

        return {
            "message": "Login realizado com sucesso",
            "user_id": user_id,
            "access_token": getattr(session, "access_token", None),
            "refresh_token": getattr(session, "refresh_token", None),
            "user": {
                "email": getattr(user, "email", None),
                "id": user_id
            },
            "extra_data": extra_data
        }
        # --- FIM NOVO ---

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
    
def editar_usuario(id_user, dados_atualizados: CadastroRequest):
    try:
        logger.info(f"Atualizando dados do usuário ID: {id_user}")
        dados_para_atualizar = {
            "name": dados_atualizados.nome,
            "username": dados_atualizados.username,
            "date_birth": dados_atualizados.data_nascimento,
            "image": dados_atualizados.profile_image,
            "id_group": dados_atualizados.id_group
        }

        response = supabase.table("user_data").update(dados_para_atualizar).eq("id_auth", id_user).execute()

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Erro ao atualizar dados do usuário")

        return {
            "message": "Dados do usuário atualizados com sucesso",
            "updated_data": response.data
        }

    except Exception as e:
        logger.error(f"Erro ao editar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def atualizar_grupo_usuario(id_user: str, grupo_id: int | None):
    """
    Atualiza o campo id_group do usuário na tabela user_data.

    id_user  -> id_auth do usuário (vindo do Supabase Auth)
    grupo_id -> ID do grupo na tabela group_data (ou None para remover vínculo)
    """
    try:
        logger.info(f"Atualizando id_group do usuário ID_AUTH={id_user} para grupo_id={grupo_id}")

        dados_para_atualizar = {
            "id_group": grupo_id
        }

        response = (
            supabase
            .table("user_data")
            .update(dados_para_atualizar)
            .eq("id_auth", id_user)
            .execute()
        )

        # Alguns clients retornam status_code, outros levantam exceção direto.
        # Aqui validamos se veio dado atualizado.
        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao atualizar grupo do usuário ou usuário não encontrado")

        return {
            "message": "Grupo do usuário atualizado com sucesso",
            "updated_data": response.data
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar grupo do usuário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
