from fastapi import FastAPI
from sqlalchemy import text
from app.database.connection import engine
from app.auth.router import role_router, auth_router
from app.departments.router import department_router
from app.employees.router import employee_router
from app.contracts.router import contract_router
from app.schedules.router import schedule_router
from app.attendance.router import attendance_router
from app.leave.router import leave_router
from app.salary.structure_router import salary_structure_router
from app.salary.rule_router import salary_rule_router
from app.payroll.payrun_router import payrun_router
from app.payroll.payslip_router import payslip_router
from app.auth.model import Role, User
from app.departments.model import Department
from app.employees.model import Employee
from app.schedules.model import Schedule, ScheduleDay
from app.contracts.model import Contract
from app.attendance.model import Attendance
from app.leave.model import TimeOffType,LeaveAllocation,LeaveRequest
from app.salary.structure_model import SalaryStructure
from app.salary.rule_model import SalaryRule
from app.payroll.payrun_model import Payrun
from app.payroll.payslip_model import Payslip
from app.payroll.payslip_line_model import PayslipLine
from app.dashboard.router import dashboard_router
from fastapi.middleware.cors import CORSMiddleware
from app.admin.router import admin_router

app = FastAPI(
    title="PeoplePay360 HR & Payroll API",
    description="Integrated HR and Payroll Operations Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(role_router)
app.include_router(auth_router)
app.include_router(department_router)
app.include_router(employee_router)
app.include_router(contract_router)
app.include_router(schedule_router)
app.include_router(attendance_router)
app.include_router(leave_router)
app.include_router(salary_structure_router)
app.include_router(salary_rule_router)
app.include_router(payrun_router)
app.include_router(payslip_router)
app.include_router(dashboard_router)
app.include_router(admin_router)

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