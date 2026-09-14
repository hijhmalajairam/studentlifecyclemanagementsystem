from celery import shared_task
from django.utils import timezone
from academics.models import Fee

@shared_task
def generate_fee_receipt_pdf(fee_id):
    """
    Simulated long-running task to generate a PDF receipt for a fee payment.
    In reality, this would use WeasyPrint or ReportLab to generate a PDF,
    save it to AWS S3 / Local Media, and email it to the user.
    """
    import time
    time.sleep(5)  # Simulate expensive PDF generation
    try:
        fee = Fee.objects.get(id=fee_id)
        print(f"Successfully generated PDF receipt for Fee ID {fee.id} for student {fee.enrollment.enrollment_number}")
        # Emailing logic would go here
    except Fee.DoesNotExist:
        print(f"Fee with id {fee_id} does not exist.")
    return f"Receipt generated for fee_id {fee_id}"

@shared_task
def check_overdue_fees():
    """
    Scheduled task (Celery Beat) to check for unpaid fees past their due date
    and send reminder notifications.
    """
    overdue_fees = Fee.objects.filter(status='PENDING', due_date__lt=timezone.now().date())
    for fee in overdue_fees:
        # Create a notification for the student
        from academics.models import Notification
        Notification.objects.create(
            user=fee.enrollment.user,
            title='Overdue Fee Reminder',
            message=f'Your fee for Semester {fee.semester} is overdue. Please pay immediately to avoid late fees.',
            notification_type='WARNING'
        )
    return f"Sent {overdue_fees.count()} overdue fee reminders."
