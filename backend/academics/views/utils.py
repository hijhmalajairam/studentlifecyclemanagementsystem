def get_target_user(user):
    if user.role == 'PARENT' and user.student:
        return user.student
    return user

GRADE_POINTS = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
}

def calculate_gpa(results_qs):
    best_results = {}
    for r in results_qs:
        gp = GRADE_POINTS.get(r.grade, 0)
        course_id = r.course_id if hasattr(r, 'course_id') else r.course.id
        credits = r.course.credits
        if course_id not in best_results or gp > best_results[course_id]['gp']:
            best_results[course_id] = {'credits': credits, 'gp': gp}
            
    total_credits = 0
    total_points = 0
    for data in best_results.values():
        total_credits += data['credits']
        total_points += data['credits'] * data['gp']
        
    if total_credits == 0:
        return 0.0
    return round(total_points / total_credits, 2)
