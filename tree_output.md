## 4. Backend Directory Structure
`	ext
backend/
├── academics
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── admission
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── alumni
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   └── views.py
├── create_test_accounts.py
├── db_schema.md
├── erp_core
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── get_schema.py
├── manage.py
├── requirements.txt
├── seed_data.py
├── seed_faculty.py
└── users
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── authentication.py
    ├── backends.py
    ├── models.py
    ├── permissions.py
    ├── serializers.py
    ├── tests.py
    ├── urls.py
    └── views.py
`

## 5. Frontend Directory Structure
`	ext
frontend/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── replace.py
├── src
│   ├── app
│   │   ├── (auth)
│   │   │   └── login
│   │   │       └── page.tsx
│   │   ├── components
│   │   │   ├── AuthGuard.tsx
│   │   │   └── Navbar.tsx
│   │   ├── dashboard
│   │   │   ├── admin
│   │   │   │   ├── admissions
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── components
│   │   │   │   │   ├── AdmissionsTab.tsx
│   │   │   │   │   ├── AdmissionsTab_copy.txt
│   │   │   │   │   ├── AdmissionsTab_temp.txt
│   │   │   │   │   ├── FacultyTab.tsx
│   │   │   │   │   └── FacultyTab_temp.txt
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── faculty
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── interviewer
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── parent
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── profile
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── prospective
│   │   │   │   ├── apply
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── catalog
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── student
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── register
│   │       ├── page.tsx
│   │       └── page_temp.txt
│   └── lib
│       └── api.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo
`
