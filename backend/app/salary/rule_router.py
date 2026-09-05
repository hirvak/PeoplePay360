from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db

from app.salary.rule_schema import (
    SalaryRuleCreate,
    SalaryRuleResponse,
    SalaryRuleUpdate,
)

from app.salary.service import (
    create_salary_rule,
    get_salary_rules,
    get_salary_rule,
    update_salary_rule,
    delete_salary_rule,
)


salary_rule_router = APIRouter(
    prefix="/salary-rules",
    tags=["Salary Rules"]
)


# ============================================================
# GET ALL SALARY RULES
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@salary_rule_router.get(
    "/",
    response_model=list[SalaryRuleResponse]
)
def get_all_salary_rules(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_salary_rules(db)


# ============================================================
# GET SINGLE SALARY RULE
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@salary_rule_router.get(
    "/{rule_id}",
    response_model=SalaryRuleResponse
)
def get_single_salary_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    salary_rule = get_salary_rule(
        db,
        rule_id
    )

    if not salary_rule:
        raise HTTPException(
            status_code=404,
            detail="Salary Rule not found"
        )

    return salary_rule


# ============================================================
# CREATE SALARY RULE
# HR Payroll Manager / Admin
# ============================================================

@salary_rule_router.post(
    "/",
    response_model=SalaryRuleResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_salary_rule(
    rule_data: SalaryRuleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        return create_salary_rule(
            db,
            rule_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# UPDATE SALARY RULE
# HR Payroll Manager / Admin
# ============================================================

@salary_rule_router.put(
    "/{rule_id}",
    response_model=SalaryRuleResponse
)
def update_existing_salary_rule(
    rule_id: int,
    rule_data: SalaryRuleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    salary_rule = get_salary_rule(
        db,
        rule_id
    )

    if not salary_rule:
        raise HTTPException(
            status_code=404,
            detail="Salary Rule not found"
        )

    try:
        return update_salary_rule(
            db,
            salary_rule,
            rule_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# DELETE SALARY RULE
# HR Payroll Manager / Admin
# ============================================================

@salary_rule_router.delete(
    "/{rule_id}",
    response_model=SalaryRuleResponse
)
def delete_existing_salary_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    salary_rule = get_salary_rule(
        db,
        rule_id
    )

    if not salary_rule:
        raise HTTPException(
            status_code=404,
            detail="Salary Rule not found"
        )

    return delete_salary_rule(
        db,
        salary_rule
    )