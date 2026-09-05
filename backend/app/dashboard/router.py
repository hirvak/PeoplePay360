from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import require_role
from app.dashboard.service import (
    get_dashboard_summary,
    get_salary_by_department,
    get_monthly_net_salary,
)

from app.dashboard.schema import (
    DashboardSummaryResponse,
    SalaryDepartmentResponse,
    MonthlySalaryResponse,
)
dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@dashboard_router.get(
    "/summary",
    response_model=DashboardSummaryResponse
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_dashboard_summary(db)

@dashboard_router.get(
    "/salary-by-department",
    response_model=list[SalaryDepartmentResponse]
)
def salary_by_department(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_salary_by_department(db)


@dashboard_router.get(
    "/monthly-net-salary",
    response_model=list[MonthlySalaryResponse]
)
def monthly_net_salary(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_monthly_net_salary(db)