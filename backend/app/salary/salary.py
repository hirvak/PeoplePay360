from sqlalchemy.orm import Session

from app.salary.structure_model import SalaryStructure
from app.salary.structure_schema import (
    SalaryStructureCreate,
    SalaryStructureUpdate,
)

from app.salary.rule_model import SalaryRule
from app.salary.rule_schema import (
    SalaryRuleCreate,
    SalaryRuleUpdate,
)


# ============================================================
# SALARY STRUCTURE
# ============================================================

def create_salary_structure(
    db: Session,
    structure_data: SalaryStructureCreate
):
    existing_name = db.query(SalaryStructure).filter(
        SalaryStructure.name == structure_data.name
    ).first()

    if existing_name:
        raise ValueError(
            "Salary Structure name already exists"
        )

    existing_code = db.query(SalaryStructure).filter(
        SalaryStructure.code == structure_data.code
    ).first()

    if existing_code:
        raise ValueError(
            "Salary Structure code already exists"
        )

    salary_structure = SalaryStructure(
        name=structure_data.name,
        code=structure_data.code,
        description=structure_data.description,
    )

    db.add(salary_structure)
    db.commit()
    db.refresh(salary_structure)

    return salary_structure


def get_salary_structures(db: Session):
    return (
        db.query(SalaryStructure)
        .order_by(SalaryStructure.id)
        .all()
    )


def get_salary_structure(
    db: Session,
    structure_id: int
):
    return (
        db.query(SalaryStructure)
        .filter(SalaryStructure.id == structure_id)
        .first()
    )


def update_salary_structure(
    db: Session,
    salary_structure: SalaryStructure,
    structure_data: SalaryStructureUpdate
):
    update_data = structure_data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        existing_name = db.query(SalaryStructure).filter(
            SalaryStructure.name == update_data["name"],
            SalaryStructure.id != salary_structure.id
        ).first()

        if existing_name:
            raise ValueError(
                "Salary Structure name already exists"
            )

    if "code" in update_data:
        existing_code = db.query(SalaryStructure).filter(
            SalaryStructure.code == update_data["code"],
            SalaryStructure.id != salary_structure.id
        ).first()

        if existing_code:
            raise ValueError(
                "Salary Structure code already exists"
            )

    for field, value in update_data.items():
        setattr(salary_structure, field, value)

    db.commit()
    db.refresh(salary_structure)

    return salary_structure


def delete_salary_structure(
    db: Session,
    salary_structure: SalaryStructure
):
    salary_structure.is_active = False

    db.commit()
    db.refresh(salary_structure)

    return salary_structure


# ============================================================
# SALARY RULE
# ============================================================

def validate_salary_rule(
    rule_type: str,
    amount,
    percentage,
    formula
):
    if rule_type not in {
        "Fixed",
        "Percentage",
        "Formula"
    }:
        raise ValueError(
            "Rule type must be Fixed, Percentage, or Formula"
        )

    if rule_type == "Fixed":
        if amount is None:
            raise ValueError(
                "Amount is required for Fixed salary rule"
            )

    if rule_type == "Percentage":
        if percentage is None:
            raise ValueError(
                "Percentage is required for Percentage salary rule"
            )

    if rule_type == "Formula":
        if not formula or not formula.strip():
            raise ValueError(
                "Formula is required for Formula salary rule"
            )


def create_salary_rule(
    db: Session,
    rule_data: SalaryRuleCreate
):
    salary_structure = db.query(SalaryStructure).filter(
        SalaryStructure.id == rule_data.salary_structure_id,
        SalaryStructure.is_active.is_(True)
    ).first()

    if not salary_structure:
        raise ValueError(
            "Active Salary Structure not found"
        )

    validate_salary_rule(
        rule_type=rule_data.rule_type,
        amount=rule_data.amount,
        percentage=rule_data.percentage,
        formula=rule_data.formula
    )

    existing_code = db.query(SalaryRule).filter(
        SalaryRule.salary_structure_id
        == rule_data.salary_structure_id,
        SalaryRule.code == rule_data.code
    ).first()

    if existing_code:
        raise ValueError(
            "Salary Rule code already exists in this structure"
        )

    existing_sequence = db.query(SalaryRule).filter(
        SalaryRule.salary_structure_id
        == rule_data.salary_structure_id,
        SalaryRule.sequence == rule_data.sequence,
        SalaryRule.is_active.is_(True)
    ).first()

    if existing_sequence:
        raise ValueError(
            "Salary Rule sequence already exists in this structure"
        )

    salary_rule = SalaryRule(
        salary_structure_id=rule_data.salary_structure_id,
        name=rule_data.name,
        code=rule_data.code,
        sequence=rule_data.sequence,
        rule_type=rule_data.rule_type,
        amount=rule_data.amount,
        percentage=rule_data.percentage,
        formula=rule_data.formula,
    )

    db.add(salary_rule)
    db.commit()
    db.refresh(salary_rule)

    return salary_rule


def get_salary_rules(db: Session):
    return (
        db.query(SalaryRule)
        .order_by(
            SalaryRule.salary_structure_id,
            SalaryRule.sequence
        )
        .all()
    )


def get_salary_rule(
    db: Session,
    rule_id: int
):
    return (
        db.query(SalaryRule)
        .filter(SalaryRule.id == rule_id)
        .first()
    )


def update_salary_rule(
    db: Session,
    salary_rule: SalaryRule,
    rule_data: SalaryRuleUpdate
):
    update_data = rule_data.model_dump(
        exclude_unset=True
    )

    new_rule_type = update_data.get(
        "rule_type",
        salary_rule.rule_type
    )

    new_amount = update_data.get(
        "amount",
        salary_rule.amount
    )

    new_percentage = update_data.get(
        "percentage",
        salary_rule.percentage
    )

    new_formula = update_data.get(
        "formula",
        salary_rule.formula
    )

    validate_salary_rule(
        rule_type=new_rule_type,
        amount=new_amount,
        percentage=new_percentage,
        formula=new_formula
    )

    if "code" in update_data:
        existing_code = db.query(SalaryRule).filter(
            SalaryRule.salary_structure_id
            == salary_rule.salary_structure_id,
            SalaryRule.code == update_data["code"],
            SalaryRule.id != salary_rule.id
        ).first()

        if existing_code:
            raise ValueError(
                "Salary Rule code already exists in this structure"
            )

    if "sequence" in update_data:
        existing_sequence = db.query(SalaryRule).filter(
            SalaryRule.salary_structure_id
            == salary_rule.salary_structure_id,
            SalaryRule.sequence == update_data["sequence"],
            SalaryRule.id != salary_rule.id,
            SalaryRule.is_active.is_(True)
        ).first()

        if existing_sequence:
            raise ValueError(
                "Salary Rule sequence already exists in this structure"
            )

    for field, value in update_data.items():
        setattr(salary_rule, field, value)

    db.commit()
    db.refresh(salary_rule)

    return salary_rule


def delete_salary_rule(
    db: Session,
    salary_rule: SalaryRule
):
    salary_rule.is_active = False

    db.commit()
    db.refresh(salary_rule)

    return salary_rule