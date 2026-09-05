import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_email(
    recipient_email: str,
    subject: str,
    body: str,
    attachment_data: bytes | None = None,
    attachment_filename: str | None = None,
):
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        raise ValueError("SMTP credentials are not configured")

    message = EmailMessage()

    message["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
    message["To"] = recipient_email
    message["Subject"] = subject

    message.set_content(body)

    if attachment_data and attachment_filename:
        message.add_attachment(
            attachment_data,
            maintype="application",
            subtype="pdf",
            filename=attachment_filename,
        )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
        )
        smtp.send_message(message)