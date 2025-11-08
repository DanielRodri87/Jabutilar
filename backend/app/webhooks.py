from fastapi import APIRouter, Request, HTTPException, Query
import os
import hashlib
import hmac

router = APIRouter()

FACEBOOK_VERIFY_TOKEN = "jbt_fb_webhook_9x7k2m4n8q1w5e3r6t9y"
FACEBOOK_APP_SECRET = "f40741e129b95c2501d9034f6c220079"

@router.get("/webhooks/facebook")
async def verify_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_challenge: str = Query(alias="hub.challenge"), 
    hub_verify_token: str = Query(alias="hub.verify_token")
):
    """Verificação do webhook do Facebook"""
    
    if hub_mode == "subscribe" and hub_verify_token == FACEBOOK_VERIFY_TOKEN:
        print("Webhook do Facebook verificado com sucesso!")
        return int(hub_challenge)
    else:
        print(f"Falha na verificação do webhook. Token recebido: {hub_verify_token}")
        raise HTTPException(status_code=403, detail="Token de verificação inválido")

@router.post("/webhooks/facebook")
async def handle_webhook(request: Request):
    """Processar eventos do webhook do Facebook"""
    
    body = await request.body()
    signature = request.headers.get('X-Hub-Signature-256', '')
    
    # Verificar assinatura
    if not verify_signature(body, signature):
        raise HTTPException(status_code=403, detail="Assinatura inválida")
    
    # Processar dados do webhook
    data = await request.json()
    print(f"Webhook recebido: {data}")
    
    return {"status": "success"}

def verify_signature(payload: bytes, signature: str) -> bool:
    """Verificar assinatura do webhook"""
    if not signature:
        return False
        
    try:
        sha_name, signature = signature.split('=', 1)
        if sha_name != 'sha256':
            return False
            
        mac = hmac.new(
            FACEBOOK_APP_SECRET.encode(),
            payload,
            hashlib.sha256
        )
        
        return hmac.compare_digest(mac.hexdigest(), signature)
    except Exception:
        return False
