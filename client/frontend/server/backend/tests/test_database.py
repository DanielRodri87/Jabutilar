# tests/test_database.py

import pytest
from unittest.mock import patch, MagicMock
from http import HTTPStatus

from unittest.mock import MagicMock, patch


# ==================== TESTES PARA COBERTURA 100% (database.py) ====================

def test_database_runtime_error():
    """Teste para cobrir a exceção RuntimeError em database.py (falta de V.A.)."""
    
    # Mocka os valores de SUPABASE_URL e SUPABASE_KEY para None ou string vazia
    with patch('os.getenv', side_effect=[None, None]):
        # Mocka a função create_client para evitar chamadas reais (mesmo que não deva ser alcançada)
        with patch('backend.database.create_client'):
            # O import dentro do with simula o que acontece no carregamento do módulo database.py
            with pytest.raises(RuntimeError) as excinfo:
                # Importamos o módulo database.py, forçando sua execução
                import importlib
                importlib.reload(importlib.import_module("backend.database"))
            
            assert "SUPABASE_URL ou SUPABASE_KEY não foram carregados" in str(excinfo.value)