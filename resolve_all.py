import os, re

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
    
    # Replace conflict markers with BOTH contents
    def repl(m):
        mine = m.group(1).strip('\n')
        theirs = m.group(2).strip('\n')
        return mine + "\n\n" + theirs

    new_content = re.sub(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*', repl, content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
print("Resolved conflicts by concatenating both sides.")
