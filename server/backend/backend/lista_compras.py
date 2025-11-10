from fastapi import HTTPException
from .database import supabase
from .schemas import ListaCompras
from datetime import datetime
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def criar_lista_compra(lista: ListaCompras):
    """Criar uma nova lista de compras"""
    try:
        data = {
            "descricao": lista.descricao,
            "status": lista.status,
            "created_at": datetime.now().isoformat(),
            "update_at": datetime.now().isoformat(),
            "id_item": lista.id_item,
            "id_group": lista.id_group
        }
        
        response = supabase.table("listaCompras_data").insert(data).execute()
        
        if not response.data:
            # Erro de negócio (esperado no teste de falha 400)
            raise HTTPException(status_code=400, detail="Erro ao criar lista de compras")
        
        return {
            "message": "lista de compra criado com sucesso",
            "data": response.data[0]
        }
    except HTTPException:
        # Propaga a HTTPException (400)
        raise
    except Exception as e:
        # Captura erros inesperados (rede, DB, etc.) e os trata como 500
        logger.error(f"Erro ao criar lista de compra: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao criar lista de compra: {str(e)}"
        )

def listar_listas_compra(id_group: Optional[int] = None, id_item: Optional[int] = None, status: Optional[bool] = None):
    """Listar listas de compras com filtros opcionais."""
    try:
        query = supabase.table("listaCompras_data").select("*")
        if id_group is not None:
            query = query.eq("id_group", id_group)
        if id_item is not None:
            query = query.eq("id_item", id_item)
        if status is not None:
            query = query.eq("status", status)

        response = query.execute()

        if response.data is None:
            raise HTTPException(status_code=400, detail="Erro ao listar listas de compras")

        return {
            "message": "Listas de compras listadas com sucesso",
            "data": response.data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar listas de compras: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao listar listas de compras: {str(e)}"
        )

def obter_lista_compra(lista_id: int):
    """Obter uma lista de compras por ID."""
    try:
        response = (
            supabase
            .table("listaCompras_data")
            .select("*")
            .eq("id", lista_id)
            .execute()
        )
        data = response.data or []
        if not data:
            raise HTTPException(status_code=400, detail="Lista de compras não encontrada")

        return {
            "message": "Lista de compras obtida com sucesso",
            "data": data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter lista de compras: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao obter lista de compras: {str(e)}"
        )

def atualizar_lista_compra(lista_id: int, lista: ListaCompras):
    """Atualizar uma lista de compras por ID."""
    try:
        update_data = {
            "descricao": lista.descricao,
            "status": lista.status,
            "update_at": datetime.now().isoformat(),
            "id_item": lista.id_item,
            "id_group": lista.id_group
        }

        response = (
            supabase
            .table("listaCompras_data")
            .update(update_data)
            .eq("id", lista_id)
            .execute()
        )

        data = response.data or []
        if not data:
            # Falha de negócio (similar aos outros módulos)
            raise HTTPException(status_code=400, detail="Erro ao atualizar lista de compras")

        return {
            "message": "Lista de compras atualizada com sucesso",
            "data": data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar lista de compras: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao atualizar lista de compras: {str(e)}"
        )

def deletar_lista_compra(lista_id: int):
    """Deletar uma lista de compras por ID."""
    try:
        response = (
            supabase
            .table("listaCompras_data")
            .delete()
            .eq("id", lista_id)
            .execute()
        )

        data = response.data or []
        if not data:
            # Falha de negócio (similar aos outros módulos)
            raise HTTPException(status_code=400, detail="Erro ao excluir lista de compras")

        return {
            "message": "Lista de compras excluída com sucesso",
            "data": data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao excluir lista de compras: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao excluir lista de compras: {str(e)}"
        )