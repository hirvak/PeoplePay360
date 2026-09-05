from decimal import Decimal
from sqlalchemy.orm import Session

from app.salary.rule_model import SalaryRule


def calculate_salary_rules(
    db: Session,
    salary_structure_id: int,
    basic_wage: Decimal
):
    """
    Calculate all active Fixed and Percentage salary rules
    for a salary structure.

    Supports:
        - Fixed salary rules
        - Percentage salary rules
        - CONTRACT_WAGE as a calculation base

    Returns:
        {
            "lines": [...],
            "gross": Decimal,
            "deductions": Decimal,
            "net": Decimal
        }
    """
    basic_wage = Decimal(str(basic_wage))
    rules = (
        db.query(SalaryRule)
        .filter(
            SalaryRule.salary_structure_id == salary_structure_id,
            SalaryRule.is_active.is_(True)
        )
        .order_by(
            SalaryRule.sequence
        )
        .all()
    )

    if not rules:
        raise ValueError(
            "No active salary rules found for this salary structure"
        )

    calculated_amounts = {}

    lines = []

    gross = Decimal("0")
    deductions = Decimal("0")

    for rule in rules:

        # --------------------------------
        # Fixed Rule
        # --------------------------------

        if rule.rule_type == "Fixed":

            if rule.base_code == "CONTRACT_WAGE":
                base_amount = basic_wage
                calculated_amount = basic_wage

            else:

                if rule.amount is None:
                    raise ValueError(
                        f"Amount is missing for salary rule {rule.code}"
                    )

                base_amount = Decimal("0")

                calculated_amount = Decimal(
                    rule.amount
                )

            percentage = None

        # --------------------------------
        # Percentage Rule
        # --------------------------------

        elif rule.rule_type == "Percentage":

            if rule.percentage is None:
                raise ValueError(
                    f"Percentage is missing for salary rule {rule.code}"
                )

            if not rule.base_code:
                raise ValueError(
                    f"Base code is missing for salary rule {rule.code}"
                )

            # Percentage can be calculated directly
            # from the employee's contract wage.
            if rule.base_code == "CONTRACT_WAGE":

                base_amount = basic_wage

            # Otherwise use a previously calculated
            # salary rule.
            elif rule.base_code in calculated_amounts:

                base_amount = calculated_amounts[
                    rule.base_code
                ]

            else:

                raise ValueError(
                    f"Base rule '{rule.base_code}' "
                    f"has not been calculated before "
                    f"'{rule.code}'"
                )

            calculated_amount = (
                base_amount
                * Decimal(rule.percentage)
                / Decimal("100")
            )

            percentage = rule.percentage

        # --------------------------------
        # Formula Rule
        # --------------------------------

        elif rule.rule_type == "Formula":

            raise ValueError(
                f"Formula rule '{rule.code}' "
                "is not supported yet"
            )

        # --------------------------------
        # Unsupported Rule Type
        # --------------------------------

        else:

            raise ValueError(
                f"Unsupported salary rule type: "
                f"{rule.rule_type}"
            )

        calculated_amount = calculated_amount.quantize(
            Decimal("0.01")
        )

        # Store calculated amount by rule code
        # so later rules can use it.
        calculated_amounts[
            rule.code
        ] = calculated_amount

        # --------------------------------
        # Category Totals
        # --------------------------------

        if rule.category == "EARNING":

            gross += calculated_amount

        elif rule.category == "DEDUCTION":

            deductions += calculated_amount

        else:

            raise ValueError(
                f"Invalid salary rule category: "
                f"{rule.category}"
            )

        # --------------------------------
        # Payslip Line
        # --------------------------------

        lines.append(
            {
                "salary_rule_id": rule.id,
                "code": rule.code,
                "name": rule.name,
                "category": rule.category,
                "sequence": rule.sequence,
                "base_amount": base_amount,
                "percentage": percentage,
                "amount": calculated_amount,
            }
        )

    # --------------------------------
    # Net Salary
    # --------------------------------

    net = gross - deductions

    return {
        "lines": lines,
        "gross": gross.quantize(
            Decimal("0.01")
        ),
        "deductions": deductions.quantize(
            Decimal("0.01")
        ),
        "net": net.quantize(
            Decimal("0.01")
        ),
    }