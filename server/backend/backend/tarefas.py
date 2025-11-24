from fastapi import HTTPException
from .database import supabase
from .schemas import TarefasBase
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def criar_tarefa(task: TarefasBase):
    """Criar um novo item de compra"""
    try:
        data = {
            "titulo": task.titulo,
            "descricao": task.descricao,
            "datavencimento": task.datavencimento,
            "prioridade": task.prioridade,
            "status": task.status,
            "recorrente": task.recorrente,
            "responsavel": task.responsavel,
            "group_id": task.grupo_id,  # usa coluna group_id na tabela
            "created_at": datetime.now().isoformat(),
            "update_at": datetime.now().isoformat()
        }
        
        response = supabase.table("task_data").insert(data).execute()
        
        if not response.data:
            # Erro de negócio (esperado no teste de falha 400)
            raise HTTPException(status_code=400, detail="Erro ao criar tarefa")
        
        return {
            "message": "Tarefa criada com sucesso",
            "data": response.data[0]
        }
    except HTTPException:
        # Propaga a HTTPException (400)
        raise
    except Exception as e:
        logger.error(f"Erro ao criar Tarefa: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao criar Tarefa: {str(e)}"
        )

def listar_tarefas(skip: int = 0, limit: int = 100, filtros: dict = None):
    """Listar todas as tarefas com paginação e filtros opcionais"""
    try:
        query = supabase.table("task_data").select("*")
        
        # Normalizar filtro vindo da rota (?id_group=)
        if filtros:
            # garantir que estamos trabalhando com um dict simples
            filtros_norm = dict(filtros)
            # se vier id_group do endpoint, converte para coluna group_id
            if "id_group" in filtros_norm and filtros_norm["id_group"] is not None:
                try:
                    filtros_norm["group_id"] = int(filtros_norm.pop("id_group"))
                except (ValueError, TypeError):
                    filtros_norm.pop("id_group", None)
            # aplicar todos os filtros normalizados
            for key, value in filtros_norm.items():
                if value is not None:
                    query = query.eq(key, value)
        
        # Aplicar paginação
        query = query.range(skip, skip + limit - 1)
        
        response = query.execute()
        
        if response.data is None:
            return {"message": "Nenhuma tarefa encontrada", "data": []}
        
        return {"message": "Tarefas listadas com sucesso", "data": response.data}
    except Exception as e:
        logger.error(f"Erro ao listar tarefas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao listar tarefas: {str(e)}"
        )

def obter_tarefa(tarefa_id: int):
    """Obter uma tarefa específica pelo ID"""
    try:
        response = supabase.table("task_data").select("*").eq("id", tarefa_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Tarefa com ID {tarefa_id} não encontrada")
        
        return {"message": "Tarefa encontrada", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter tarefa {tarefa_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao obter tarefa: {str(e)}"
        )

def atualizar_tarefa(tarefa_id: int, task: TarefasBase):
    """Atualizar uma tarefa existente"""
    try:
        # Verificar se a tarefa existe
        check = supabase.table("task_data").select("*").eq("id", tarefa_id).execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail=f"Tarefa com ID {tarefa_id} não encontrada")
        
        data = {
            "titulo": task.titulo,
            "descricao": task.descricao,
            "datavencimento": task.datavencimento,
            "prioridade": task.prioridade,
            "status": task.status,
            "recorrente": task.recorrente,
            "responsavel": task.responsavel,
            "group_id": task.grupo_id,  # manter vínculo com group_id
            "update_at": datetime.now().isoformat()
        }
        
        response = supabase.table("task_data").update(data).eq("id", tarefa_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao atualizar tarefa")
        
        return {"message": "Tarefa atualizada com sucesso", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar tarefa {tarefa_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao atualizar tarefa: {str(e)}"
        )

def excluir_tarefa(tarefa_id: int):
    """Excluir uma tarefa pelo ID"""
    try:
        # Verificar se a tarefa existe
        check = supabase.table("task_data").select("*").eq("id", tarefa_id).execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail=f"Tarefa com ID {tarefa_id} não encontrada")
        
        response = supabase.table("task_data").delete().eq("id", tarefa_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao excluir tarefa")
        
        return {"message": "Tarefa excluída com sucesso", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao excluir tarefa {tarefa_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao excluir tarefa: {str(e)}"
        )

