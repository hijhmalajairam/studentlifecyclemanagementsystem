import re

with open('backend/academics/urls.py', 'r', encoding='utf-8') as f:
    content = f.read()

if 'CourseSectionViewSet' not in content:
    content = content.replace('CourseViewSet, SemesterRegistrationViewSet', 'CourseViewSet, CourseSectionViewSet, SemesterRegistrationViewSet')
    content = content.replace('router.register(r\'courses\', CourseViewSet)', 'router.register(r\'courses\', CourseViewSet)\nrouter.register(r\'course-sections\', CourseSectionViewSet)')

    with open('backend/academics/urls.py', 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated urls.py")
