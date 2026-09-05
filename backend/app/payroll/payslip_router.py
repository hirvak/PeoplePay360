from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.dependencies import (
    require_role,
    get_current_employee,
)
from app.database.connection import get_db

from app.payroll.payslip_schema import (
    PayslipCreate,
    PayslipResponse,
)

from app.payroll.payslip_service import (
    create_payslip,
    get_payslips,
    get_payslip,
    cancel_payslip,send_payrun_payslips
)

from app.payroll.payslip_pdf_service import generate_payslip_pdf
from app.payroll.payslip_model import Payslip


payslip_router = APIRouter(
    prefix="/payslips",
    tags=["Payslips"]
)


# ============================================================
# GET MY PAYSLIPS
# Employee can see ONLY their own payslips
# ============================================================

@payslip_router.get(
    "/me",
    response_model=list[PayslipResponse]
)
def get_my_payslips(
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    return (
        db.query(Payslip)
        .filter(
            Payslip.employee_id == current_employee.id
        )
        .order_by(
            Payslip.period_start.desc()
        )
        .all()
    )


# ============================================================
# DOWNLOAD MY PAYSLIP PDF
# Employee can download ONLY their own payslip
# ============================================================

@payslip_router.get(
    "/me/{payslip_id}/pdf"
)
def download_my_payslip_pdf(
    payslip_id: int,
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find payslip belonging to logged-in employee
    # --------------------------------------------------------

    payslip = (
        db.query(Payslip)
        .filter(
            Payslip.id == payslip_id,
            Payslip.employee_id == current_employee.id
        )
        .first()
    )

    if not payslip:
        raise HTTPException(
            status_code=404,
            detail="Payslip not found"
        )

    try:
        pdf_file = generate_payslip_pdf(
            db,
            payslip_id
        )

        return StreamingResponse(
            pdf_file,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    f"attachment; filename=payslip_{payslip_id}.pdf"
            }
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# GET ALL PAYSLIPS
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@payslip_router.get(
    "/",
    response_model=list[PayslipResponse]
)
def get_all_payslips(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_payslips(db)


# ============================================================
# GET SINGLE PAYSLIP
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@payslip_router.get(
    "/{payslip_id}",
    response_model=PayslipResponse
)
def get_single_payslip(
    payslip_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payslip = get_payslip(
        db,
        payslip_id
    )

    if not payslip:
        raise HTTPException(
            status_code=404,
            detail="Payslip not found"
        )

    return payslip


# ============================================================
# CREATE PAYSLIP
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@payslip_router.post(
    "/",
    response_model=PayslipResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_payslip(
    payslip_data: PayslipCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        return create_payslip(
            db,
            payslip_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# CANCEL PAYSLIP
# HR Payroll Manager / Admin
# ============================================================

@payslip_router.delete(
    "/{payslip_id}",
    response_model=PayslipResponse
)
def cancel_existing_payslip(
    payslip_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payslip = get_payslip(
        db,
        payslip_id
    )

    if not payslip:
        raise HTTPException(
            status_code=404,
            detail="Payslip not found"
        )

    try:
        return cancel_payslip(
            db,
            payslip
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# DOWNLOAD PAYSLIP PDF
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@payslip_router.get(
    "/{payslip_id}/pdf"
)
def download_payslip_pdf(
    payslip_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        pdf_file = generate_payslip_pdf(
            db,
            payslip_id
        )

        return StreamingResponse(
            pdf_file,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    f"attachment; filename=payslip_{payslip_id}.pdf"
            }
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@payslip_router.post(
    "/payrun/{payrun_id}/send-payslips"
)
def send_payslips(
    payrun_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        results = send_payrun_payslips(
            db,
            payrun_id
        )

        return {
            "payrun_id": payrun_id,
            "total": len(results),
            "sent": sum(
                1 for result in results
                if result["status"] == "sent"
            ),
            "failed": sum(
                1 for result in results
                if result["status"] == "failed"
            ),
            "results": results
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )