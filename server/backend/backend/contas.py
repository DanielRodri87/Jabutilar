from fastapi import HTTPException
from .database import supabase
from .schemas import ContasBase
from datetime import datetime
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def criar_conta(conta: ContasBase):
    """Criar um novo item de compra"""
    try:
        data = {
            "descricao": conta.descricao,
            "valor": conta.valor,
            "datavenc": conta.datavencimento,
            "status": conta.status,
            "categoria": conta.categoria,
            "recorrente": conta.recorrente,
            "resp": conta.resp,
            "grupo_id": conta.grupo_id,
            "created_at": datetime.now().isoformat(),
            "update_at": datetime.now().isoformat()
        }
        
        response = supabase.table("pagamento_data").insert(data).execute()
        
        if not response.data:
            # Erro de negócio (esperado no teste de falha 400)
            raise HTTPException(status_code=400, detail="Erro ao criar Conta")
        
        return {
            "message": "Conta criada com sucesso",
            "data": response.data[0]
        }
    except HTTPException:
        # Propaga a HTTPException (400)
        raise
    except Exception as e:
        # Captura erros inesperados (rede, DB, etc.) e os trata como 500
        logger.error(f"Erro ao criar Conta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao criar Conta: {str(e)}"
        )

def listar_contas(grupo_id: Optional[int] = None, status: Optional[str] = None):
    """Listar contas, com filtros opcionais por grupo_id e status."""
    try:
        query = supabase.table("pagamento_data").select("*")
        if grupo_id is not None:
            query = query.eq("grupo_id", grupo_id)
        if status is not None:
            query = query.eq("status", status)

        response = query.execute()

        if response.data is None:
            raise HTTPException(status_code=400, detail="Erro ao listar Contas")

        return {
            "message": "Contas listadas com sucesso",
            "data": response.data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar Contas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao listar Contas: {str(e)}"
        )

def obter_conta(conta_id: int):
    """Obter uma conta por ID."""
    try:
        response = (
            supabase
            .table("pagamento_data")
            .select("*")
            .eq("id", conta_id)
            .execute()
        )

        data = response.data or []
        if len(data) == 0:
            raise HTTPException(status_code=400, detail="Conta não encontrada")

        return {
            "message": "Conta obtida com sucesso",
            "data": data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter Conta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao obter Conta: {str(e)}"
        )

def atualizar_conta(conta_id: int, conta: ContasBase):
    """Atualizar uma conta existente por ID."""
    try:
        update_data = {
            "descricao": conta.descricao,
            "valor": conta.valor,
            "datavenc": conta.datavencimento,
            "status": conta.status,
            "categoria": conta.categoria,
            "recorrente": conta.recorrente,
            "resp": conta.resp,
            "grupo_id": conta.grupo_id,
            "update_at": datetime.now().isoformat()
        }

        response = (
            supabase
            .table("pagamento_data")
            .update(update_data)
            .eq("id", conta_id)
            .execute()
        )

        data = response.data or []
        if len(data) == 0:
            raise HTTPException(status_code=400, detail="Conta não encontrada para atualização")

        return {
            "message": "Conta atualizada com sucesso",
            "data": data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar Conta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao atualizar Conta: {str(e)}"
        )

def deletar_conta(conta_id: int):
    """Deletar uma conta por ID."""
    try:
        response = (
            supabase
            .table("pagamento_data")
            .delete()
            .eq("id", conta_id)
            .execute()
        )

        data = response.data or []
        if len(data) == 0:
            raise HTTPException(status_code=400, detail="Conta não encontrada para exclusão")

        return {
            "message": "Conta deletada com sucesso",
            "data": data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar Conta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao deletar Conta: {str(e)}"
        )