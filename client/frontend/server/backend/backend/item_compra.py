from fastapi import HTTPException
from .database import supabase
from .schemas import ItemCompraCreate, ItemCompraUpdate
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def criar_item_compra(item: ItemCompraCreate):
    """Criar um novo item de compra"""
    try:
        data = {
            "nome": item.nome,
            "quantidade": item.quantidade,
            "preco": item.preco,
            "categoria": item.categoria,
            "comprado": item.comprado if item.comprado is not None else False,
            "id_list": item.id_list,
            "created_at": datetime.now().isoformat(),
            "update_at": datetime.now().isoformat()
        }
        
        response = supabase.table("itemCompras_data").insert(data).execute()
        
        if not response.data:
            # Erro de negócio (esperado no teste de falha 400)
            raise HTTPException(status_code=400, detail="Erro ao criar item de compra")
        
        return {
            "message": "Item de compra criado com sucesso",
            "data": response.data[0]
        }
    except HTTPException:
        # Propaga a HTTPException (400)
        raise
    except Exception as e:
        # Captura erros inesperados (rede, DB, etc.) e os trata como 500
        logger.error(f"Erro ao criar item de compra: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao criar item de compra: {str(e)}"
        )

def listar_itens_compra(id_list: int = None):
    """Listar todos os itens de compra ou filtrar por id_list"""
    try:
        query = supabase.table("itemCompras_data").select("*")
        
        if id_list is not None:
            query = query.eq("id_list", id_list)
        
        response = query.execute()
        
        return {
            "message": "Itens de compra recuperados com sucesso",
            "data": response.data
        }
    except HTTPException:
        # Propaga HTTPException (se alguma for levantada por Query params inválidos, embora improvável aqui)
        raise
    except Exception as e:
        # Captura erros inesperados
        logger.error(f"Erro ao listar itens de compra: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao listar itens de compra: {str(e)}"
        )

def obter_item_compra(item_id: int):
    """Obter um item de compra específico por ID"""
    try:
        response = supabase.table("itemCompras_data").select("*").eq("id", item_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Item de compra não encontrado")
        
        return {
            "message": "Item de compra recuperado com sucesso",
            "data": response.data[0]
        }
    except HTTPException:
        # Propaga a HTTPException (404)
        raise
    except Exception as e:
        # Captura erros inesperados
        logger.error(f"Erro ao obter item de compra: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao obter item de compra: {str(e)}"
        )

def atualizar_item_compra(item_id: int, item: ItemCompraUpdate):
    """Atualizar um item de compra existente"""
    try:
        # Verificar se o item existe
        check = supabase.table("itemCompras_data").select("id").eq("id", item_id).execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail="Item de compra não encontrado")
        
        # Preparar dados para atualização (apenas campos não nulos)
        data = {}
        if item.nome is not None:
            data["nome"] = item.nome
        if item.quantidade is not None:
            data["quantidade"] = item.quantidade
        if item.preco is not None:
            data["preco"] = item.preco
        if item.categoria is not None:
            data["categoria"] = item.categoria
        if item.comprado is not None:
            data["comprado"] = item.comprado
        if item.id_list is not None:
            data["id_list"] = item.id_list
        
        data["update_at"] = datetime.now().isoformat()
        
        response = supabase.table("itemCompras_data").update(data).eq("id", item_id).execute()
        
        if not response.data:
            # Erro de negócio (esperado no teste de falha 400)
            raise HTTPException(status_code=400, detail="Erro ao atualizar item de compra")
        
        return {
            "message": "Item de compra atualizado com sucesso",
            "data": response.data[0]
        }
    except HTTPException:
        # Propaga a HTTPException (404 ou 400)
        raise
    except Exception as e:
        # Captura erros inesperados
        logger.error(f"Erro ao atualizar item de compra: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao atualizar item de compra: {str(e)}"
        )

def deletar_item_compra(item_id: int):
    """Deletar um item de compra"""
    try:
        # Verificar se o item existe
        check = supabase.table("itemCompras_data").select("id").eq("id", item_id).execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail="Item de compra não encontrado")
        
        response = supabase.table("itemCompras_data").delete().eq("id", item_id).execute()
        
        return {
            "message": "Item de compra deletado com sucesso",
            "data": response.data
        }
    except HTTPException:
        # Propaga a HTTPException (404)
        raise
    except Exception as e:
        # Captura erros inesperados
        logger.error(f"Erro ao deletar item de compra: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao deletar item de compra: {str(e)}"
        )

def marcar_como_comprado(item_id: int, comprado: bool = True):
    """Marcar ou desmarcar um item como comprado"""
    try:
        check = supabase.table("itemCompras_data").select("id").eq("id", item_id).execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail="Item de compra não encontrado")
        
        data = {
            "comprado": comprado,
            "update_at": datetime.now().isoformat()
        }
        
        response = supabase.table("itemCompras_data").update(data).eq("id", item_id).execute()
        
        if not response.data:
            # Erro de negócio (esperado no teste de falha 400)
            raise HTTPException(status_code=400, detail="Erro ao atualizar status do item")
        
        return {
            "message": f"Item {'marcado' if comprado else 'desmarcado'} como comprado com sucesso",
            "data": response.data[0]
        }
    except HTTPException:
        # Propaga a HTTPException (404 ou 400)
        raise
    except Exception as e:
        # Captura erros inesperados
        logger.error(f"Erro ao atualizar status do item: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao atualizar status do item: {str(e)}"
        )