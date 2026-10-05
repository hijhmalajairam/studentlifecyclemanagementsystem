import re
with open('frontend/src/app/dashboard/student/components/StudentInternshipPortal.tsx', 'r') as f:
    code = f.read()

# Replace the find tab logic
code = re.sub(
    r'hasActiveInternship \?\s*\(\s*<div className=\"bg-slate-50/50.*?</div>\s*\)\s*:\s*\(\s*(<form onSubmit=\{submitFoundInternship\}.*?)\s*\)',
    r'\1',
    code,
    flags=re.DOTALL
)

# Replace the opportunities tab logic
code = re.sub(
    r'hasActiveInternship \?\s*\(\s*<div className=\"text-center py-10.*?</div>\s*\)\s*:\s*\(\s*(<div className=\"space-y-6\">.*?)\s*\)',
    r'\1',
    code,
    flags=re.DOTALL
)

with open('frontend/src/app/dashboard/student/components/StudentInternshipPortal.tsx', 'w') as f:
    f.write(code)
