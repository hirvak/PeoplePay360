from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.salary.structure_model import SalaryStructure
from app.salary.rule_model import SalaryRule