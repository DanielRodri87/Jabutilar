from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Carrega variáveis do .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL ou SUPABASE_KEY não foram carregados")

# Cria o cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
