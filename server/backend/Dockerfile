FROM python:3.11-slim

WORKDIR /app

# A CORREÇÃO ANTERIOR: Define PYTHONPATH para incluir o diretório de trabalho (/app).
# Isso garante que o Python encontre o módulo 'backend' para o comando uvicorn.
ENV PYTHONPATH=/app:$PYTHONPATH

# Copia dependências
COPY pyproject.toml poetry.lock ./

# Instala Poetry e dependências
RUN pip install --no-cache-dir poetry \
    && poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

# Copia todo o backend
COPY backend ./backend

# Expõe porta
EXPOSE 8000

# CORREÇÃO FINAL: Executa Uvicorn como um módulo Python (python -m uvicorn)
# Isso é mais robusto para resolver caminhos de importação em ambientes Docker.
CMD ["python", "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
