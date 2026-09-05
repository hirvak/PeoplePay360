from decimal import Decimal

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_net_salary_paid: Decimal
    payslips_generated: int
    average_salary: Decimal
    approved_time_off: int
    attendance_health: float


class SalaryDepartmentResponse(BaseModel):
    department: str
    salary_cost: Decimal


class MonthlySalaryResponse(BaseModel):
    month: str
    net_salary: Decimal


class DashboardAlert(BaseModel):
    type: str
    severity: str
    title: str
    message: str
    reference_id: int | None = None


class DashboardAlertsResponse(BaseModel):
    alerts: list[DashboardAlert]
    total: int