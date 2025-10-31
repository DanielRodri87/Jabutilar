# tests/conftest.py

import pytest
from unittest.mock import MagicMock, patch
from backend.app import app
from backend.database import supabase
from supabase_auth.errors import AuthApiError


@pytest.fixture
def mock_supabase():
    """Fixture para mockar o objeto supabase globalmente."""
    with patch('backend.database.supabase') as mock_db:
        yield mock_db

@pytest.fixture
def mock_item_compra_module():
    """Fixture para mockar as funções do módulo item_compra que dependem do supabase."""
    with patch('backend.item_compra.supabase') as mock_db:
        yield mock_db

@pytest.fixture
def mock_user_module():
    """Fixture para mockar as funções do módulo user que dependem do supabase."""
    with patch('backend.user.supabase') as mock_db:
        yield mock_db