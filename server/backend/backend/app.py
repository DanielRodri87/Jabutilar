from fastapi import FastAPI
from .schemas import CadastroRequest, LoginRequest
from .user import cadastrar_usuario, login_usuario

app = FastAPI()

@app.post("/cadastro")
def cadastro(req: CadastroRequest):
    return cadastrar_usuario(req)

@app.post("/")
def login(req: LoginRequest):
    return login_usuario(req)
