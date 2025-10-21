from fastapi import HTTPException
from .database import supabase
from .schemas import GrupoBase
from datetime import datetime

TABLE_NAME = "group_data"

def criar_grupo(grupo: GrupoBase):
    """Criar um novo grupo"""
    try:
        data = {
            "nome": grupo.nome,
            "descricao": grupo.descricao,
            "cod_convite": grupo.cod_convite,
            "group_owner": grupo.group_owner,
            "created_at": datetime.now().isoformat(),
            "update_at": datetime.now().isoformat()
        }
        
        response = supabase.table(TABLE_NAME).insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao criar grupo")
        
        return {
            "message": "Grupo criado com sucesso",
            "data": response.data[0]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro inesperado ao criar grupo: {str(e)}"
        )

def obter_grupo(grupo_id: int):
    """Obter um grupo pelo ID"""
    try:
        response = supabase.table(TABLE_NAME).select("*").eq("id", grupo_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Grupo com ID {grupo_id} não encontrado")
        
        return {"message": "Grupo encontrado", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")

def atualizar_grupo(grupo_id: int, grupo: GrupoBase):
    """Atualizar um grupo existente"""
    try:
        check = supabase.table(TABLE_NAME).select("*").eq("id", grupo_id).execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail=f"Grupo com ID {grupo_id} não encontrado")
        
        data = {
            "nome": grupo.nome,
            "descricao": grupo.descricao,
            "cod_convite": grupo.cod_convite,
            "group_owner": grupo.group_owner,
            "update_at": datetime.now().isoformat()
        }
        
        response = supabase.table(TABLE_NAME).update(data).eq("id", grupo_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao atualizar grupo")
        
        return {"message": "Grupo atualizado com sucesso", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")

def excluir_grupo(grupo_id: int):
    """Excluir um grupo pelo ID"""
    try:
        check = supabase.table(TABLE_NAME).select("*").eq("id", grupo_id).execute()
        
        if not check.data:
            raise HTTPException(status_code=404, detail=f"Grupo com ID {grupo_id} não encontrado")
        
        response = supabase.table(TABLE_NAME).delete().eq("id", grupo_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao excluir grupo")
        
        return {"message": "Grupo excluído com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")
