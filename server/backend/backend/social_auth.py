from fastapi import HTTPException
from .database import supabase
from .schemas import SocialAuthRequest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
            redirect_uri = "http://localhost:3000/auth/callback"
        
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