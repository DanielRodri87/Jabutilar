from fastapi import HTTPException
from .database import supabase
from .schemas import SocialAuthRequest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def process_social_callback(code: str):
    """
    Troca o código de autorização por uma sessão e atualiza/cria o usuário
    """
    try:
        # 1. Trocar o código pela sessão (Supabase Auth)
        auth_response = supabase.auth.exchange_code_for_session({"auth_code": code})
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Não foi possível obter dados do usuário")

        user = auth_response.user
        user_id = user.id
        
        # 2. Extrair dados do provedor (Facebook/Google)
        meta = user.user_metadata or {}
        full_name = meta.get('full_name') or meta.get('name') or meta.get('email', '').split('@')[0]
        # Nota: O avatar vindo do social auth geralmente expira, então preferimos que o usuário escolha um local.
        
        # 3. Atualizar ou Criar na tabela user_data
        existing = supabase.table("user_data").select("*").eq("id", user_id).execute()
        
        is_new_user = False
        current_data = {}

        if not existing.data:
            # Novo usuário
            is_new_user = True
            new_data = {
                "id": user_id, # Importante vincular o ID do Auth
                "name": full_name,
                "username": meta.get('email'), # Fallback
                "profile_image": "/fotodeperfil.png" # Imagem padrão para forçar escolha
            }
            res = supabase.table("user_data").insert(new_data).execute()
            current_data = res.data[0] if res.data else new_data
        else:
            # Usuário existente - Atualiza nome se necessário ou mantém
            # Não sobrescrevemos a imagem se ele já mudou
            current_data = existing.data[0]
        
        return {
            "message": "Login realizado com sucesso",
            "user_id": user_id,
            "user_data": current_data,
            "is_new_user": is_new_user,
            "token": auth_response.session.access_token
        }

    except Exception as e:
        logger.error(f"Erro no callback social: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar login social: {str(e)}")

def login_social(req: SocialAuthRequest):
    """
    Realiza login/cadastro usando autenticação social (Google, Facebook, Apple)
    """
    try:
        provider = req.provider.lower()
        
        # Validar provider
        if provider not in ['google', 'facebook', 'apple']:
            raise HTTPException(
                status_code=400,
                detail=f"Provider '{provider}' não suportado"
            )
        
        logger.info(f"Tentando login social com {provider}")
        
        # Usar o Supabase Auth para login social
        # O Supabase gerencia automaticamente a criação de usuário se não existir
        auth_response = supabase.auth.sign_in_with_oauth({
            "provider": provider,
            "options": {
                "redirect_to": "http://localhost:3000/auth/callback"
            }
        })
        
        if not auth_response:
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao autenticar com {provider}"
            )
        
        # Se temos informações adicionais do usuário, salvar na tabela user_data
        if auth_response.user and req.nome and req.username:
            try:
                # Verificar se já existe registro na user_data
                existing_user = supabase.table("user_data").select("*").eq(
                    "id", auth_response.user.id
                ).execute()
                
                if not existing_user.data:
                    # Criar novo registro
                    supabase.table("user_data").insert({
                        "name": req.nome,
                        "username": req.username,
                        "date_birth": None  # Pode ser preenchido posteriormente
                    }).execute()
            except Exception as e:
                logger.warning(f"Erro ao salvar dados adicionais: {str(e)}")
                # Não falhar o login por causa disso
        
        return {
            "message": f"Login realizado com {provider}",
            "user": auth_response.user,
            "session": auth_response.session
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login social: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao realizar login social: {str(e)}"
        )


def get_oauth_url(provider: str, redirect_uri: str = None):
    """
    Obtém a URL de autenticação OAuth para o provider especificado
    """
    try:
        provider = provider.lower()
        
        if provider not in ['google', 'facebook', 'apple']:
            raise HTTPException(
                status_code=400,
                detail=f"Provider '{provider}' não suportado"
            )
        
        # URL de redirecionamento padrão
        if not redirect_uri:
            redirect_uri = "http://localhost:3000/auth/facebook/callback"
        
        # Gerar URL OAuth
        auth_response = supabase.auth.sign_in_with_oauth({
            "provider": provider,
            "options": {
                "redirect_to": redirect_uri
            }
        })
        
        return {
            "provider": provider,
            "url": auth_response.url if hasattr(auth_response, 'url') else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar URL OAuth: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar URL OAuth: {str(e)}"
        )