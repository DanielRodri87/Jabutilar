from .database import supabase
from .schemas import NotificacaoCreate

def criar_notificacao(notif: NotificacaoCreate):
    try:
        # Converte o modelo Pydantic para dicionário (exclui campos None)
        data = notif.dict(exclude_unset=True)
        
        response = supabase.table("notificacoes_data").insert(data).execute()
        
        if response.data:
            return response.data[0]
        return {}
    except Exception as e:
        print(f"Erro ao criar notificação: {e}")
        return {}

def listar_notificacoes(grupo_id: int):
    try:
        # Busca as últimas 50 notificações do grupo
        response = supabase.table("notificacoes_data")\
            .select("*")\
            .eq("grupo_id", grupo_id)\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()
            
        # Garante que retorne uma lista [], nunca None
        return response.data if response.data else []
        
    except Exception as e:
        print(f"Erro ao listar notificações: {e}")
        return []

def deletar_todas_notificacoes(grupo_id: int):
    try:
        # Deleta registros onde grupo_id é igual ao fornecido
        supabase.table("notificacoes_data").delete().eq("grupo_id", grupo_id).execute()
        return {"message": "Notificações limpas com sucesso"}
    except Exception as e:
        print(f"Erro ao limpar notificações: {e}")
        return {"error": str(e)}