from fastapi import HTTPException
from .database import supabase
from .schemas import SocialAuthRequest
import logging
import urllib.parse

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
        
        # 2. Extrair dados do provedor
        meta = user.user_metadata or {}
        email = user.email or meta.get('email')
        full_name = meta.get('full_name') or meta.get('name') or (email.split('@')[0] if email else "Usuário")
        
        # 3. Atualizar ou Criar na tabela user_data
        # CORREÇÃO: Usar "id_auth" em vez de "id"
        existing = supabase.table("user_data").select("*").eq("id_auth", user_id).execute()
        
        is_new_user = False
        current_data = {}

        if not existing.data:
            # Novo usuário
            is_new_user = True
            new_data = {
                "id_auth": user_id,       # CORREÇÃO: Campo correto é id_auth
                "name": full_name,
                "username": email,
                "image": "/fotodeperfil.png" # CORREÇÃO: Campo correto é image
            }
            try:
                res = supabase.table("user_data").insert(new_data).execute()
                current_data = res.data[0] if res.data else new_data
            except Exception as db_err:
                logger.error(f"Erro ao inserir usuário no banco: {db_err}")
                current_data = new_data
        else:
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
    Realiza login via SDK do Client (se necessário)
    """
    return {"message": "Use a rota /auth/{provider}/url para iniciar o login"}


def get_oauth_url(provider: str, redirect_uri: str = None):
    """
    Obtém a URL de autenticação OAuth padrão do Supabase
    """
    try:
        provider = provider.lower()
        if provider not in ['google', 'facebook', 'apple']:
            raise HTTPException(status_code=400, detail=f"Provider '{provider}' não suportado")
        
        if not redirect_uri:
            redirect_uri = "http://localhost:3000/auth/facebook/callback"
        
        # Opções Padrão
        options = {
            "redirect_to": redirect_uri,
            "scopes": "public_profile email" 
        }
        
        auth_response = supabase.auth.sign_in_with_oauth({
            "provider": provider,
            "options": options
        })
        
        url_gerada = auth_response.url if hasattr(auth_response, 'url') else None
        
        # --- Hack para garantir compatibilidade com Facebook ---
        if provider == 'facebook' and url_gerada:
             # Se necessário, limpamos scopes duplicados, mas agora com Dev Mode deve funcionar direto
             pass

        logger.info(f"URL GERADA ({provider}): {url_gerada}")

        return {
            "provider": provider,
            "url": url_gerada
        }
        
    except Exception as e:
        logger.error(f"Erro ao gerar URL OAuth: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar URL OAuth: {str(e)}")