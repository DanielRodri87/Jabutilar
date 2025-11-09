from fastapi import FastAPI
from app.api import router as api_router
from app.webhooks import router as webhooks_router

app = FastAPI()

app.include_router(api_router)
app.include_router(webhooks_router)