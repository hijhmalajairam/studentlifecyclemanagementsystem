# Veritas Grove University ERP (Student Lifecycle Management System)

A comprehensive, full-stack ERP system built for Veritas Grove University to manage the entire student lifecycle, from prospective admission to alumni tracking.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management & Data Fetching:** React Query (@tanstack/react-query)
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend
- **Framework:** Django 5.0
- **API:** Django REST Framework (DRF)
- **Database:** SQLite (development) / PostgreSQL (production)
- **Authentication:** JWT (Simple JWT)
- **Task Queue:** Celery + Redis

## ✨ Key Modules & Features

### 1. Admissions & Prospective Students
- Applicant tracking system (ATS) for student enrollment.
- Offline and online application creation.
- Document upload and verification workflows.
- Interview pooling and scheduling.
- Fee payment integration.

### 2. Academics & Student Portal
- **Dashboard:** Highly professional, widget-based dashboard.
- **Course Registration:** View assigned courses and current semesters.
- **Attendance Tracking:** Real-time visibility into attendance records and aggregated statistics.
- **Results & Grading:** SGPA/CGPA tracking with visual breakdown charts (Bar, Radar, Pie).
- **Timetable:** Interactive weekly timetable visualization.
- **Leave Management:** Apply for and track student leaves.

### 3. Faculty & Administration
- **Faculty Portal:** Course management, grading, and attendance marking.
- **Admin Dashboard:** Centralized view for HODs and administrators.
- **Disciplinary Tracking:** Manage and log student cases.

### 4. Profiles & Security
- **Unified Profile System:** Role-based profile settings and rendering.
- **Security:** Modern JWT authentication, role-based access control (RBAC), and 2FA placeholders.

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+ (Node 20+ recommended)
- npm or yarn

### 1. Backend Setup
```bash
# Clone the repository and cd into it
# Create and activate a virtual environment
python -m venv venv
source venv/Scripts/activate # On Windows: .\venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Run database migrations
cd backend
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Open a new terminal window
cd frontend

# Install Node dependencies
npm install

# Start the Next.js development server
npm run dev
```

### 3. Access the Application
- The frontend will be running at [http://localhost:3000](http://localhost:3000)
- The backend API will be running at [http://localhost:8000](http://localhost:8000)

## 🏗️ Architecture Notes
- The project implements a robust API wrapper (`fetchAPI`) to handle global error intercepting and request formatting.
- Designed with high scalability in mind, using Celery for background tasks and caching strategies.

## 📄 License
Internal University Use Only - Veritas Grove University.
