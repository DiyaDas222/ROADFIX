from sqlalchemy import event, inspect
from sqlalchemy.orm import Session

from models.notification import Notification
from models.user import User
from models.service_request import ServiceRequest
from models.payment import Payment
from models.complaint import Complaint
from models.part_order import PartOrder


def notify(session, user_id, title, message, notification_type):

    if not user_id:
        return

    session.add(Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type
    ))


def notify_admins(session, title, message, notification_type):

    admins = session.query(User).filter_by(
        role="admin",
        is_active=True
    ).all()

    for admin in admins:
        notify(
            session,
            admin.id,
            title,
            message,
            notification_type
        )


@event.listens_for(Session, "before_flush")
def create_automatic_notifications(session, flush_context, instances):

    # NEW RECORDS
    for obj in list(session.new):

        # New mechanic registration
        if isinstance(obj, User) and obj.role == "mechanic":
            notify_admins(
                session,
                "New Mechanic Registration",
                f"{obj.name} has registered as a mechanic.",
                "mechanic_registration"
            )

        # New customer complaint
        elif isinstance(obj, Complaint):
            notify_admins(
                session,
                "New Customer Complaint",
                f"New complaint received: {obj.subject}",
                "complaint"
            )

        # New spare parts order
        elif isinstance(obj, PartOrder):
            notify(
                session,
                obj.customer_id,
                "Order Placed",
                f"Your spare parts order #{obj.id} has been placed.",
                "spare_parts"
            )

    # UPDATED RECORDS
    for obj in list(session.dirty):

        state = inspect(obj)

        # Service request status changes
        if isinstance(obj, ServiceRequest):

            status_history = state.attrs.status.history

            if status_history.has_changes():

                status = obj.status

                messages = {
                    "accepted": (
                        "Mechanic Accepted",
                        "A mechanic has accepted your service request."
                    ),
                    "on_the_way": (
                        "Mechanic On The Way",
                        "Your mechanic is on the way."
                    ),
                    "arrived": (
                        "Mechanic Arrived",
                        "Your mechanic has arrived."
                    ),
                    "in_progress": (
                        "Service Started",
                        "Your vehicle service has started."
                    ),
                    "completed": (
                        "Service Completed",
                        "Your vehicle service has been completed."
                    ),
                    "cancelled": (
                        "Service Cancelled",
                        "Your service request has been cancelled."
                    )
                }

                if status in messages:
                    title, message = messages[status]

                    notify(
                        session,
                        obj.customer_id,
                        title,
                        message,
                        "service"
                    )

        # Successful payment
        elif isinstance(obj, Payment):

            history = state.attrs.status.history

            if history.has_changes() and obj.status == "paid":

                notify(
                    session,
                    obj.customer_id,
                    "Payment Successful",
                    f"Your payment of ₹{obj.amount} was successful.",
                    "payment"
                )

        # Admin replies to complaints
        elif isinstance(obj, Complaint):

            history = state.attrs.admin_reply.history

            if history.has_changes() and obj.admin_reply:

                notify(
                    session,
                    obj.customer_id,
                    "Complaint Updated",
                    "The admin has replied to your complaint.",
                    "complaint"
                )

        # Spare parts order status changes
        elif isinstance(obj, PartOrder):

            history = state.attrs.status.history

            if history.has_changes():

                messages = {
                    "confirmed": "Your spare parts order has been confirmed.",
                    "dispatched": "Your spare parts order has been dispatched.",
                    "delivered": "Your spare parts order has been delivered.",
                    "cancelled": "Your spare parts order has been cancelled."
                }

                message = messages.get(obj.status)

                if message:
                    notify(
                        session,
                        obj.customer_id,
                        "Spare Parts Order Update",
                        message,
                        "spare_parts"
                    )