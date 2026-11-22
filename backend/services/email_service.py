import os
import smtplib
from email.message import EmailMessage


MAIL_SERVER = os.getenv(
    "MAIL_SERVER",
    "smtp.gmail.com"
)

MAIL_PORT = int(
    os.getenv(
        "MAIL_PORT",
        "587"
    )
)

MAIL_USERNAME = os.getenv(
    "MAIL_USERNAME"
)

MAIL_PASSWORD = os.getenv(
    "MAIL_PASSWORD"
)


# ============================================================
# EMAIL VERIFICATION
# ============================================================

def send_verification_email(
    recipient_email,
    recipient_name,
    verification_url
):
    message = EmailMessage()

    message["Subject"] = "Verify your RoadFix account"
    message["From"] = MAIL_USERNAME
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello {recipient_name},

Welcome to RoadFix!

Please verify your email address by clicking the link below:

{verification_url}

This verification link is valid for 24 hours.

If you did not create a RoadFix account, you can safely ignore this email.

Regards,

RoadFix Team

roadfix.support@gmail.com
"""
    )

    with smtplib.SMTP(
        MAIL_SERVER,
        MAIL_PORT
    ) as smtp:

        smtp.starttls()

        smtp.login(
            MAIL_USERNAME,
            MAIL_PASSWORD
        )

        smtp.send_message(message)


# ============================================================
# PASSWORD RESET EMAIL
# ============================================================

def send_password_reset_email(
    recipient_email,
    recipient_name,
    reset_url
):
    message = EmailMessage()

    message["Subject"] = "Reset your RoadFix password"
    message["From"] = MAIL_USERNAME
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello {recipient_name},

We received a request to reset your RoadFix account password.

Click the link below to create a new password:

{reset_url}

This password reset link is valid for 1 hour.

If you did not request a password reset, you can safely ignore this email.

For your security, your password will not be changed unless you use the link above and create a new password.

Regards,

RoadFix Team

roadfix.support@gmail.com
"""
    )

    with smtplib.SMTP(
        MAIL_SERVER,
        MAIL_PORT
    ) as smtp:

        smtp.starttls()

        smtp.login(
            MAIL_USERNAME,
            MAIL_PASSWORD
        )

        smtp.send_message(message)