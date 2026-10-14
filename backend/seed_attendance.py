import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from users.models import User
from academics.models import (
    Program, Course, Enrollment, SemesterRegistration, Attendance
)

def run():
    print("=== Phase 1: Attendance & Registration Seeding ===")

    # 1. Map programs and courses
    programs = {p.code: p for p in Program.objects.all()}
    courses = {c.code: c for c in Course.objects.all()}

    program_course_map = {
        'BTECH-CSE': ['CS101', 'CS102', 'MA101', 'PY101', 'CY101'],
        'BTECH-ECE': ['EC101', 'EC102', 'MA101', 'PY101', 'CY101'],
        'BTECH-ME': ['ME101', 'ME102', 'MA101', 'PY101', 'CY101'],
        'BTECH-CIVIL': ['CE101', 'CE102', 'MA101', 'PY101', 'CY101'],
        'MBA-GEN': ['MB101', 'MB102'],
        'LLB': ['LW101', 'LW102'],
        'BPHARM': ['PHR101', 'PHR102'],
    }

    enrollments = Enrollment.objects.select_related('user').all()
    print(f"Found {enrollments.count()} enrollments.")

    # 2. Assign programs & create SemesterRegistration
    reg_count = 0
    for enr in enrollments:
        username = enr.user.username.lower() if enr.user else ''
        enr_num = enr.enrollment_number.upper()

        matched_prog_code = None
        for code in program_course_map.keys():
            normalized = code.lower().replace('-', '')
            if normalized in username.replace('-', '') or code in enr_num:
                matched_prog_code = code
                break

        if not matched_prog_code:
            # Default to BTECH-CSE if unassigned (e.g. admin test accounts)
            matched_prog_code = 'BTECH-CSE'

        if matched_prog_code in programs:
            prog_obj = programs[matched_prog_code]
            if enr.program != prog_obj:
                enr.program = prog_obj
                enr.save(update_fields=['program'])

            # Create or update SemesterRegistration for Semester 1
            sem_reg, _ = SemesterRegistration.objects.get_or_create(
                enrollment=enr,
                semester=1
            )
            # Add assigned courses
            assigned_courses = [courses[c_code] for c_code in program_course_map[matched_prog_code] if c_code in courses]
            sem_reg.courses.set(assigned_courses)
            reg_count += 1

    print(f"Successfully ensured {reg_count} SemesterRegistrations with registered courses.")

    # 3. Generate 30 past lecture dates (Monday through Friday)
    lecture_dates = []
    current_date = date(2026, 10, 14)  # Yesterday
    days_back = 0
    while len(lecture_dates) < 30 and days_back < 60:
        d = current_date - timedelta(days=days_back)
        if d.weekday() < 5:  # Monday to Friday
            lecture_dates.append(d)
        days_back += 1
    lecture_dates.sort()
    print(f"Generated {len(lecture_dates)} lecture session dates from {lecture_dates[0]} to {lecture_dates[-1]}.")

    # 4. Generate Attendance records
    Attendance.objects.all().delete()
    print("Cleared existing attendance records.")

    attendance_batch = []
    random.seed(42)  # Deterministic seed for reproducible testing

    for enr in enrollments:
        reg = SemesterRegistration.objects.filter(enrollment=enr, semester=1).first()
        if not reg:
            continue

        enrolled_courses = reg.courses.all()
        username = enr.user.username.lower() if enr.user else ''

        # Determine target attendance profile for this student
        if 'stu0' in username:
            # High achiever: ~88% attendance
            prob_present = 0.88
        elif 'stu1' in username:
            # Shortage / At-risk student: ~68% attendance (<75% warning!)
            prob_present = 0.68
        elif 'stu2' in username:
            # Good student: ~82% attendance
            prob_present = 0.82
        elif 'stu3' in username:
            # Borderline student: ~73% attendance (<75% warning!)
            prob_present = 0.73
        elif 'stu4' in username:
            # Exceptional student: ~94% attendance
            prob_present = 0.94
        else:
            # Other/Admin demo students: ~85% attendance
            prob_present = 0.85

        for course in enrolled_courses:
            # Slight per-course variation (+/- 5%)
            course_prob = max(0.55, min(0.98, prob_present + random.uniform(-0.06, 0.06)))

            # Each course meets ~20 out of the 30 dates based on course code hash
            for day_idx, l_date in enumerate(lecture_dates):
                # Pseudo schedule: e.g. 3 sessions a week per course
                if (day_idx + course.id) % 3 != 0:
                    status = 'PRESENT' if random.random() < course_prob else 'ABSENT'
                    attendance_batch.append(Attendance(
                        enrollment=enr,
                        course=course,
                        date=l_date,
                        status=status
                    ))

    Attendance.objects.bulk_create(attendance_batch)
    print(f"Successfully created {len(attendance_batch)} attendance records!")

    # 5. Verify sample attendance for student 0 and student 1
    print("\n--- Verification: Sample Student Attendance Summaries ---")
    for sample_user in ['btech-cse_stu0', 'btech-cse_stu1']:
        try:
            u = User.objects.get(username=sample_user)
            enr = Enrollment.objects.get(user=u)
            records = Attendance.objects.filter(enrollment=enr).select_related('course')
            course_stats = {}
            for r in records:
                if r.course.code not in course_stats:
                    course_stats[r.course.code] = {'total': 0, 'present': 0}
                course_stats[r.course.code]['total'] += 1
                if r.status == 'PRESENT':
                    course_stats[r.course.code]['present'] += 1

            total_classes = sum(s['total'] for s in course_stats.values())
            total_pres = sum(s['present'] for s in course_stats.values())
            overall_pct = round((total_pres / total_classes) * 100, 1) if total_classes else 0

            print(f"\nStudent: {sample_user} ({enr.enrollment_number}) - Overall: {overall_pct}% ({total_pres}/{total_classes})")
            for c_code, s in course_stats.items():
                pct = round((s['present'] / s['total']) * 100, 1)
                status_flag = "OK" if pct >= 75 else "SHORTAGE (<75%)"
                print(f"  {c_code}: {s['present']}/{s['total']} ({pct}%) -> {status_flag}")
        except Exception as e:
            print(f"Error checking {sample_user}: {e}")

if __name__ == '__main__':
    run()
