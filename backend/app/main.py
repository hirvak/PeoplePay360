from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine
from app.auth.router import router as role_router


app = FastAPI(
    title="PeoplePay360 HR & Payroll API",
    description="Integrated HR and Payroll Operations Platform",
    version="1.0.0"
)

app.include_router(role_router)