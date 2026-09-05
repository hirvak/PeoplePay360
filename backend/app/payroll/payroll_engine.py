from decimal import Decimal
import ast

from sqlalchemy.orm import Session

from app.salary.rule_model import SalaryRule


# ============================================================
# SAFE FORMULA EVALUATOR
# ============================================================

def evaluate_formula(
    formula: str,
    calculated_amounts: dict,
    basic_wage: Decimal
) -> Decimal:
    """
    Safely evaluate arithmetic salary formulas.

    Supported:
        +  addition
        -  subtraction
        *  multiplication
        /  division
        () parentheses
        salary rule codes
        CONTRACT_WAGE

    Examples:
        CONTRACT_WAGE * 0.10
        BASIC_NEW + HRA_NEW
        (BASIC_NEW + HRA_NEW) * 0.05
    """

    if not formula or not formula.strip():
        raise ValueError(
            "Formula is missing"
        )

    try:
        tree = ast.parse(
            formula,
            mode="eval"
        )
    except SyntaxError:
        raise ValueError(
            f"Invalid formula: {formula}"
        )

    allowed_names = {
        "CONTRACT_WAGE": basic_wage,
        **calculated_amounts,
    }

    def evaluate(node):

        # Number
        if isinstance(
            node,
            ast.Constant
        ):
            if isinstance(
                node.value,
                (int, float)
            ):
                return Decimal(
                    str(node.value)
                )

            raise ValueError(
                "Formula contains an invalid value"
            )

        # Salary rule code / CONTRACT_WAGE
        if isinstance(
            node,
            ast.Name
        ):
            if node.id not in allowed_names:
                raise ValueError(
                    f"Formula references unknown "
                    f"salary rule '{node.id}'"
                )

            return Decimal(
                str(allowed_names[node.id])
            )

        # Addition
        if isinstance(
            node,
            ast.BinOp
        ):

            left = evaluate(node.left)
            right = evaluate(node.right)

            if isinstance(
                node.op,
                ast.Add
            ):
                return left + right

            if isinstance(
                node.op,
                ast.Sub
            ):
                return left - right

            if isinstance(
                node.op,
                ast.Mult
            ):
                return left * right

            if isinstance(
                node.op,
                ast.Div
            ):
                if right == 0:
                    raise ValueError(
                        "Formula cannot divide by zero"
                    )

                return left / right

            raise ValueError(
                "Unsupported operator in formula"
            )

        # Negative numbers
        if isinstance(
            node,
            ast.UnaryOp
        ):

            value = evaluate(
                node.operand
            )

            if isinstance(
                node.op,
                ast.USub
            ):
                return -value

            if isinstance(
                node.op,
                ast.UAdd
            ):
                return value

            raise ValueError(
                "Unsupported unary operator"
            )

        raise ValueError(
            "Formula contains unsupported expression"
        )

    return evaluate(tree.body)


# ============================================================
# SALARY RULE CALCULATION
# ============================================================

def calculate_salary_rules(
    db: Session,
    salary_structure_id: int,
    basic_wage: Decimal
):
    """
    Calculate all active salary rules for a salary structure.

    Supports:
        - Fixed rules
        - Percentage rules
        - Formula rules
        - CONTRACT_WAGE
        - Previously calculated salary rule codes

    Returns:
        {
            "lines": [...],
            "gross": Decimal,
            "deductions": Decimal,
            "net": Decimal
        }
    """

    basic_wage = Decimal(
        str(basic_wage)
    )

    # --------------------------------
    # Get active salary rules
    # --------------------------------

    rules = (
        db.query(SalaryRule)
        .filter(
            SalaryRule.salary_structure_id
            == salary_structure_id,
            SalaryRule.is_active.is_(True)
        )
        .order_by(
            SalaryRule.sequence
        )
        .all()
    )

    if not rules:
        raise ValueError(
            "No active salary rules found "
            "for this salary structure"
        )

    calculated_amounts = {}

    lines = []

    gross = Decimal("0")
    deductions = Decimal("0")

    # --------------------------------
    # Calculate rules in sequence
    # --------------------------------

    for rule in rules:

        base_amount = Decimal("0")
        percentage = None

        # ================================================
        # FIXED RULE
        # ================================================

        if rule.rule_type == "Fixed":

            if rule.base_code == "CONTRACT_WAGE":

                base_amount = basic_wage
                calculated_amount = basic_wage

            else:

                if rule.amount is None:
                    raise ValueError(
                        f"Amount is missing for "
                        f"salary rule {rule.code}"
                    )

                calculated_amount = Decimal(
                    str(rule.amount)
                )

        # ================================================
        # PERCENTAGE RULE
        # ================================================

        elif rule.rule_type == "Percentage":

            if rule.percentage is None:
                raise ValueError(
                    f"Percentage is missing for "
                    f"salary rule {rule.code}"
                )

            if not rule.base_code:
                raise ValueError(
                    f"Base code is missing for "
                    f"salary rule {rule.code}"
                )

            # --------------------------------
            # CONTRACT WAGE
            # --------------------------------

            if rule.base_code == "CONTRACT_WAGE":

                base_amount = basic_wage

            # --------------------------------
            # Previously calculated rule
            # --------------------------------

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
                * Decimal(str(rule.percentage))
                / Decimal("100")
            )

            percentage = Decimal(
                str(rule.percentage)
            )

        # ================================================
        # FORMULA RULE
        # ================================================

        elif rule.rule_type == "Formula":

            if not rule.formula:
                raise ValueError(
                    f"Formula is missing for "
                    f"salary rule {rule.code}"
                )

            calculated_amount = evaluate_formula(
                formula=rule.formula,
                calculated_amounts=calculated_amounts,
                basic_wage=basic_wage,
            )

            # Formula doesn't necessarily have
            # a single base amount.
            base_amount = Decimal("0")

        # ================================================
        # UNSUPPORTED RULE TYPE
        # ================================================

        else:

            raise ValueError(
                f"Unsupported salary rule type: "
                f"{rule.rule_type}"
            )

        # --------------------------------
        # Round calculated amount
        # --------------------------------

        calculated_amount = calculated_amount.quantize(
            Decimal("0.01")
        )

        # --------------------------------
        # Store by rule code
        # --------------------------------

        calculated_amounts[
            rule.code
        ] = calculated_amount

        # --------------------------------
        # Category totals
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
        # Payslip line
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
    # Net salary
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