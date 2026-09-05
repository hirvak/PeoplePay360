from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine
from app.auth.router import role_router, auth_router
from app.departments.router import department_router
from app.employees.router import employee_router
app = FastAPI(
    title="PeoplePay360 HR & Payroll API",
    description="Integrated HR and Payroll Operations Platform",
    version="1.0.0"
)

app.include_router(role_router)
app.include_router(auth_router)
app.include_router(department_router)
app.include_router(employee_router)
@app.get("/")
def root():
    return {
        "message": "PeoplePay360 API is running"
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }