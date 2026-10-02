import os

conflicted_files = [
    'backend/academics/models/grading.py',
    'backend/academics/models/operations.py',
    'backend/academics/serializers/grading.py',
    'backend/academics/serializers/operations.py',
    'backend/academics/urls.py',
    'backend/academics/views/grading.py',
    'backend/academics/views/operations.py',
    'frontend/src/app/dashboard/faculty/page.tsx',
    'frontend/src/app/dashboard/student/components/StudentSidebar.tsx'
]

for file_path in conflicted_files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace conflict markers: keep HEAD (my changes) AND theirs, concatenated
    # Wait, usually for models, keeping both will duplicate class definitions!
    # Let's just print the conflict markers to see what they are.
    import re
    conflicts = re.findall(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*', content, re.DOTALL)
    print(f"--- {file_path} ---")
    for idx, (mine, theirs) in enumerate(conflicts):
        print(f"CONFLICT {idx+1}")
        print("MINE:")
        print(mine[:200] + "..." if len(mine)>200 else mine)
        print("THEIRS:")
        print(theirs[:200] + "..." if len(theirs)>200 else theirs)
        print("----------------")
