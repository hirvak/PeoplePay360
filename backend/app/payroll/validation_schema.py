from pydantic import BaseModel


class PayrunValidationResponse(BaseModel):
    valid: bool
    warnings: list[str]
    errors: list[str]