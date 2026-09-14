"""
Seed script to populate 60 Faculty Profiles.
First 20 are from the provided CSV dataset.
Next 40 are generated with realistic Indian names and data.
"""
import os
import sys
import django
import random
from datetime import date
from decimal import Decimal

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from users.models import User
from academics.models import Department, FacultyProfile


# ──────────────────────────────────────────────────────────────
#  CSV DATA — 20 Faculty (exact from user's dataset)
# ──────────────────────────────────────────────────────────────
CSV_FACULTY = [
    {
        "faculty_id": "F001", "name": "Mr. Vikram Pillai", "gender": "Male", "dob": "1994-01-03",
        "department": "Electronics & Communication", "designation": "Assistant Professor",
        "admin_role": "None", "qualification": "M.E. in Embedded Systems", "alma_mater": "IISc Bangalore",
        "specialization": "Embedded Systems", "experience": 5, "joining": "2019-02-22",
        "employment": "Permanent", "status": "Active", "email": "vikram.pillai@univ.edu",
        "phone": "9642621108", "office": "ELE-408",
        "courses": "Data Structures", "publications": 9,
        "venues": "Taylor & Francis; Springer; ACM", "grants": 0, "grant_amount": 500000,
        "awards": "Best Paper Award (International Conference)",
        "orcid": "0000-0002-1106-3615", "linkedin": "linkedin.com/in/vikrampillai90",
        "rating": 4.0, "leaves": 8, "project": "AI-based Attendance System",
    },
    {
        "faculty_id": "F002", "name": "Dr. Anil Krishnan", "gender": "Male", "dob": "1985-07-03",
        "department": "Computer Science", "designation": "Associate Professor",
        "admin_role": "Placement Coordinator", "qualification": "Ph.D. in Machine Learning", "alma_mater": "BITS Pilani",
        "specialization": "Machine Learning", "experience": 13, "joining": "2011-06-28",
        "employment": "Permanent", "status": "Active", "email": "anil.krishnan@univ.edu",
        "phone": "9990566476", "office": "COM-416",
        "courses": "Engineering Mechanics; Numerical Methods; Thermodynamics", "publications": 16,
        "venues": "Taylor & Francis; Springer; IEEE", "grants": 0, "grant_amount": 2000000,
        "awards": "Outstanding Researcher Award",
        "orcid": "0000-0002-2307-4814", "linkedin": "linkedin.com/in/anilkrishnan13",
        "rating": 3.9, "leaves": 14, "project": "Industry Collaboration Cell",
    },
    {
        "faculty_id": "F003", "name": "Dr. Sneha Tiwari", "gender": "Female", "dob": "1970-07-09",
        "department": "Mathematics", "designation": "Professor",
        "admin_role": "None", "qualification": "Ph.D. in Discrete Mathematics", "alma_mater": "VIT Vellore",
        "specialization": "Discrete Mathematics", "experience": 22, "joining": "2002-12-22",
        "employment": "Permanent", "status": "Active", "email": "sneha.tiwari@univ.edu",
        "phone": "9835098955", "office": "MAT-266",
        "courses": "Numerical Methods; Control Systems", "publications": 37,
        "venues": "IEEE; Springer; Wiley", "grants": 1, "grant_amount": 500000,
        "awards": "",
        "orcid": "0000-0002-2084-4456", "linkedin": "linkedin.com/in/snehatiwari73",
        "rating": 4.8, "leaves": 10, "project": "AI-based Attendance System",
    },
    {
        "faculty_id": "F004", "name": "Ms. Anjali Narayan", "gender": "Female", "dob": "1989-04-05",
        "department": "Electronics & Communication", "designation": "Assistant Professor",
        "admin_role": "None", "qualification": "M.Tech in Signal Processing", "alma_mater": "BITS Pilani",
        "specialization": "Signal Processing", "experience": 5, "joining": "2019-12-18",
        "employment": "Contract", "status": "Active", "email": "anjali.narayan@univ.edu",
        "phone": "9197613238", "office": "ELE-124",
        "courses": "Numerical Methods; Operating Systems; Database Management; Software Engineering", "publications": 7,
        "venues": "Springer; ACM; IEEE", "grants": 1, "grant_amount": 500000,
        "awards": "Best Paper Award (International Conference)",
        "orcid": "0000-0002-9669-5119", "linkedin": "linkedin.com/in/anjalinarayan71",
        "rating": 4.7, "leaves": 0, "project": "Industry Collaboration Cell",
    },
    {
        "faculty_id": "F005", "name": "Dr. Rajesh Bhatt", "gender": "Male", "dob": "1972-09-04",
        "department": "Chemistry", "designation": "Professor",
        "admin_role": "Head of Department", "qualification": "Ph.D. in Physical Chemistry", "alma_mater": "VIT Vellore",
        "specialization": "Physical Chemistry", "experience": 25, "joining": "1999-02-10",
        "employment": "Permanent", "status": "Active", "email": "rajesh.bhatt@univ.edu",
        "phone": "9786066793", "office": "CHE-359",
        "courses": "Organic Chemistry Lab; Machine Learning; Database Management; Thermodynamics", "publications": 35,
        "venues": "Springer; Taylor & Francis; IEEE", "grants": 2, "grant_amount": 250000,
        "awards": "Excellence in Academics",
        "orcid": "0000-0001-2832-6947", "linkedin": "linkedin.com/in/rajeshbhatt40",
        "rating": 3.6, "leaves": 7, "project": "Curriculum Redesign Committee",
    },
    {
        "faculty_id": "F006", "name": "Dr. Rahul Joshi", "gender": "Male", "dob": "1968-04-18",
        "department": "Chemistry", "designation": "Professor",
        "admin_role": "Exam Controller", "qualification": "Ph.D. in Organic Chemistry", "alma_mater": "ICFAI University",
        "specialization": "Organic Chemistry", "experience": 25, "joining": "1999-03-22",
        "employment": "Permanent", "status": "Active", "email": "rahul.joshi@univ.edu",
        "phone": "9865523129", "office": "CHE-259",
        "courses": "Structural Design; Software Engineering", "publications": 36,
        "venues": "Wiley; Elsevier; ACM", "grants": 2, "grant_amount": 500000,
        "awards": "Best Teacher Award",
        "orcid": "0000-0001-4681-2049", "linkedin": "linkedin.com/in/rahuljoshi44",
        "rating": 3.2, "leaves": 7, "project": "Curriculum Redesign Committee",
    },
    {
        "faculty_id": "F007", "name": "Mr. Vikram Menon", "gender": "Male", "dob": "1993-11-16",
        "department": "Physics", "designation": "Assistant Professor",
        "admin_role": "None", "qualification": "M.Tech in Condensed Matter Physics", "alma_mater": "IISc Bangalore",
        "specialization": "Condensed Matter Physics", "experience": 2, "joining": "2022-02-02",
        "employment": "Permanent", "status": "Active", "email": "vikram.menon@univ.edu",
        "phone": "9876693898", "office": "PHY-392",
        "courses": "Organic Chemistry Lab", "publications": 4,
        "venues": "ACM; Springer; Wiley", "grants": 1, "grant_amount": 0,
        "awards": "",
        "orcid": "0000-0001-2588-8062", "linkedin": "linkedin.com/in/vikrammenon46",
        "rating": 4.0, "leaves": 14, "project": "NAAC Accreditation Prep",
    },
    {
        "faculty_id": "F008", "name": "Dr. Rajesh Verma", "gender": "Male", "dob": "1971-08-08",
        "department": "Computer Science", "designation": "Professor",
        "admin_role": "Warden", "qualification": "Ph.D. in Cloud Computing", "alma_mater": "IIT Bombay",
        "specialization": "Cloud Computing", "experience": 24, "joining": "2000-02-08",
        "employment": "Contract", "status": "Active", "email": "rajesh.verma@univ.edu",
        "phone": "9967607278", "office": "COM-381",
        "courses": "Operating Systems; Data Structures; Software Engineering; Quantum Physics", "publications": 25,
        "venues": "IEEE; Wiley; Springer", "grants": 0, "grant_amount": 500000,
        "awards": "",
        "orcid": "0000-0002-8886-4502", "linkedin": "linkedin.com/in/rajeshverma52",
        "rating": 4.8, "leaves": 5, "project": "Renewable Energy Research",
    },
    {
        "faculty_id": "F009", "name": "Dr. Rohan Pillai", "gender": "Male", "dob": "1986-01-19",
        "department": "Chemistry", "designation": "Associate Professor",
        "admin_role": "None", "qualification": "Ph.D. in Physical Chemistry", "alma_mater": "ICFAI University",
        "specialization": "Physical Chemistry", "experience": 10, "joining": "2014-12-24",
        "employment": "Permanent", "status": "Active", "email": "rohan.pillai@univ.edu",
        "phone": "9903132646", "office": "CHE-260",
        "courses": "Data Structures; Engineering Mechanics; Organic Chemistry Lab; Digital Signal Processing", "publications": 21,
        "venues": "Taylor & Francis; Wiley; Springer", "grants": 0, "grant_amount": 1200000,
        "awards": "",
        "orcid": "0000-0001-4044-2122", "linkedin": "linkedin.com/in/rohanpillai77",
        "rating": 3.3, "leaves": 7, "project": "Renewable Energy Research",
    },
    {
        "faculty_id": "F010", "name": "Dr. Vivek Agarwal", "gender": "Male", "dob": "1974-04-09",
        "department": "Electronics & Communication", "designation": "Professor",
        "admin_role": "None", "qualification": "Ph.D. in VLSI Design", "alma_mater": "JNTU Hyderabad",
        "specialization": "VLSI Design", "experience": 20, "joining": "2004-07-22",
        "employment": "Permanent", "status": "Active", "email": "vivek.agarwal@univ.edu",
        "phone": "9821221887", "office": "ELE-253",
        "courses": "Digital Signal Processing; Thermodynamics; Control Systems", "publications": 32,
        "venues": "IEEE; Wiley; ACM", "grants": 2, "grant_amount": 1200000,
        "awards": "Best Teacher Award; Innovation in Teaching Award",
        "orcid": "0000-0003-4492-9288", "linkedin": "linkedin.com/in/vivekagarwal34",
        "rating": 3.4, "leaves": 11, "project": "",
    },
    {
        "faculty_id": "F011", "name": "Dr. Manoj Raman", "gender": "Male", "dob": "1971-03-09",
        "department": "Electronics & Communication", "designation": "Professor",
        "admin_role": "Head of Department", "qualification": "Ph.D. in Communication Systems", "alma_mater": "IIT Bombay",
        "specialization": "Communication Systems", "experience": 27, "joining": "1997-10-26",
        "employment": "Permanent", "status": "Active", "email": "manoj.raman@univ.edu",
        "phone": "9897163846", "office": "ELE-383",
        "courses": "Database Management", "publications": 46,
        "venues": "Elsevier; Wiley; Springer", "grants": 1, "grant_amount": 0,
        "awards": "Innovation in Teaching Award; Young Scientist Award",
        "orcid": "0000-0003-9004-5114", "linkedin": "linkedin.com/in/manojraman7",
        "rating": 3.4, "leaves": 13, "project": "NAAC Accreditation Prep",
    },
    {
        "faculty_id": "F012", "name": "Dr. Ananya Rao", "gender": "Female", "dob": "1977-12-05",
        "department": "Mathematics", "designation": "Professor",
        "admin_role": "None", "qualification": "Ph.D. in Discrete Mathematics", "alma_mater": "BITS Pilani",
        "specialization": "Discrete Mathematics", "experience": 21, "joining": "2003-03-24",
        "employment": "Permanent", "status": "Active", "email": "ananya.rao@univ.edu",
        "phone": "9996139578", "office": "MAT-289",
        "courses": "Organic Chemistry Lab; Quantum Physics; Database Management; Structural Design", "publications": 29,
        "venues": "Springer; IEEE; Elsevier", "grants": 1, "grant_amount": 0,
        "awards": "",
        "orcid": "0000-0002-4441-5088", "linkedin": "linkedin.com/in/ananyarao86",
        "rating": 3.4, "leaves": 13, "project": "Curriculum Redesign Committee",
    },
    {
        "faculty_id": "F013", "name": "Dr. Vivek Kumar", "gender": "Male", "dob": "1971-12-04",
        "department": "Chemistry", "designation": "Professor",
        "admin_role": "None", "qualification": "Ph.D. in Organic Chemistry", "alma_mater": "JNTU Hyderabad",
        "specialization": "Organic Chemistry", "experience": 26, "joining": "1998-07-01",
        "employment": "Permanent", "status": "Active", "email": "vivek.kumar@univ.edu",
        "phone": "9605399561", "office": "CHE-213",
        "courses": "Machine Learning; Numerical Methods; Digital Signal Processing", "publications": 27,
        "venues": "Elsevier; Wiley; Springer", "grants": 0, "grant_amount": 0,
        "awards": "",
        "orcid": "0000-0003-4164-7528", "linkedin": "linkedin.com/in/vivekkumar43",
        "rating": 3.7, "leaves": 2, "project": "NAAC Accreditation Prep",
    },
    {
        "faculty_id": "F014", "name": "Ms. Divya Chatterjee", "gender": "Female", "dob": "1989-07-12",
        "department": "Mechanical Engineering", "designation": "Assistant Professor",
        "admin_role": "None", "qualification": "M.Tech in Manufacturing", "alma_mater": "ICFAI University",
        "specialization": "Manufacturing", "experience": 1, "joining": "2023-05-06",
        "employment": "Permanent", "status": "Active", "email": "divya.chatterjee@univ.edu",
        "phone": "9568574364", "office": "MEC-410",
        "courses": "Quantum Physics; Operating Systems; Structural Design", "publications": 1,
        "venues": "Taylor & Francis; Springer; Elsevier", "grants": 0, "grant_amount": 2000000,
        "awards": "",
        "orcid": "0000-0002-1027-9518", "linkedin": "linkedin.com/in/divyachatterjee69",
        "rating": 4.4, "leaves": 6, "project": "Smart Campus IoT",
    },
    {
        "faculty_id": "F015", "name": "Dr. Priya Krishnan", "gender": "Female", "dob": "1973-09-05",
        "department": "Civil Engineering", "designation": "Professor",
        "admin_role": "Warden", "qualification": "Ph.D. in Geotechnical Engineering", "alma_mater": "IISc Bangalore",
        "specialization": "Geotechnical Engineering", "experience": 22, "joining": "2002-12-10",
        "employment": "Contract", "status": "Active", "email": "priya.krishnan@univ.edu",
        "phone": "9813962536", "office": "CIV-294",
        "courses": "Software Engineering; Computer Networks; Database Management; Organic Chemistry Lab", "publications": 33,
        "venues": "Taylor & Francis; Elsevier; ACM", "grants": 2, "grant_amount": 0,
        "awards": "Young Scientist Award; Innovation in Teaching Award",
        "orcid": "0000-0001-8043-6279", "linkedin": "linkedin.com/in/priyakrishnan60",
        "rating": 4.0, "leaves": 6, "project": "Curriculum Redesign Committee",
    },
    {
        "faculty_id": "F016", "name": "Dr. Sunita Nair", "gender": "Female", "dob": "1987-01-02",
        "department": "Physics", "designation": "Associate Professor",
        "admin_role": "None", "qualification": "Ph.D. in Quantum Mechanics", "alma_mater": "IISc Bangalore",
        "specialization": "Quantum Mechanics", "experience": 10, "joining": "2014-02-27",
        "employment": "Contract", "status": "Active", "email": "sunita.nair@univ.edu",
        "phone": "9756350429", "office": "PHY-137",
        "courses": "Digital Signal Processing; Structural Design", "publications": 21,
        "venues": "Wiley; Taylor & Francis; Springer", "grants": 1, "grant_amount": 500000,
        "awards": "",
        "orcid": "0000-0002-4997-3417", "linkedin": "linkedin.com/in/sunitanair84",
        "rating": 4.4, "leaves": 3, "project": "NAAC Accreditation Prep",
    },
    {
        "faculty_id": "F017", "name": "Dr. Kavya Nair", "gender": "Female", "dob": "1972-09-18",
        "department": "Chemistry", "designation": "Professor",
        "admin_role": "None", "qualification": "Ph.D. in Inorganic Chemistry", "alma_mater": "NIT Warangal",
        "specialization": "Inorganic Chemistry", "experience": 17, "joining": "2007-01-18",
        "employment": "Permanent", "status": "Active", "email": "kavya.nair@univ.edu",
        "phone": "9910943524", "office": "CHE-326",
        "courses": "Organic Chemistry Lab", "publications": 19,
        "venues": "Wiley; Taylor & Francis; ACM", "grants": 2, "grant_amount": 500000,
        "awards": "Outstanding Researcher Award",
        "orcid": "0000-0003-8777-8373", "linkedin": "linkedin.com/in/kavyanair34",
        "rating": 4.6, "leaves": 8, "project": "NAAC Accreditation Prep",
    },
    {
        "faculty_id": "F018", "name": "Ms. Ritu Kumar", "gender": "Female", "dob": "1994-03-08",
        "department": "Mathematics", "designation": "Assistant Professor",
        "admin_role": "None", "qualification": "M.E. in Operations Research", "alma_mater": "JNTU Hyderabad",
        "specialization": "Operations Research", "experience": 3, "joining": "2021-05-08",
        "employment": "Permanent", "status": "Active", "email": "ritu.kumar@univ.edu",
        "phone": "9858511779", "office": "MAT-209",
        "courses": "Operating Systems; Structural Design; Numerical Methods", "publications": 3,
        "venues": "Elsevier; Taylor & Francis; ACM", "grants": 1, "grant_amount": 0,
        "awards": "",
        "orcid": "0000-0001-7883-7381", "linkedin": "linkedin.com/in/ritukumar99",
        "rating": 4.3, "leaves": 0, "project": "NAAC Accreditation Prep",
    },
    {
        "faculty_id": "F019", "name": "Dr. Lakshmi Rao", "gender": "Female", "dob": "1968-08-01",
        "department": "Mathematics", "designation": "Professor",
        "admin_role": "None", "qualification": "Ph.D. in Numerical Analysis", "alma_mater": "JNTU Hyderabad",
        "specialization": "Numerical Analysis", "experience": 25, "joining": "1999-07-18",
        "employment": "Permanent", "status": "Active", "email": "lakshmi.rao@univ.edu",
        "phone": "9818197581", "office": "MAT-307",
        "courses": "Computer Networks; Database Management", "publications": 46,
        "venues": "ACM; Springer; IEEE", "grants": 1, "grant_amount": 1200000,
        "awards": "",
        "orcid": "0000-0003-1444-2375", "linkedin": "linkedin.com/in/lakshmirao83",
        "rating": 4.0, "leaves": 14, "project": "AI-based Attendance System",
    },
    {
        "faculty_id": "F020", "name": "Dr. Karthik Gupta", "gender": "Male", "dob": "1977-01-24",
        "department": "Mathematics", "designation": "Professor",
        "admin_role": "Head of Department", "qualification": "Ph.D. in Discrete Mathematics", "alma_mater": "BITS Pilani",
        "specialization": "Discrete Mathematics", "experience": 15, "joining": "2009-06-25",
        "employment": "Permanent", "status": "Active", "email": "karthik.gupta@univ.edu",
        "phone": "9475767056", "office": "MAT-214",
        "courses": "Software Engineering; Operating Systems; Control Systems", "publications": 30,
        "venues": "Wiley; IEEE; Taylor & Francis", "grants": 0, "grant_amount": 0,
        "awards": "",
        "orcid": "0000-0001-3496-4908", "linkedin": "linkedin.com/in/karthikgupta17",
        "rating": 4.1, "leaves": 3, "project": "Curriculum Redesign Committee",
    },
]

# ──────────────────────────────────────────────────────────────
#  GENERATED DATA — 40 more Faculty
# ──────────────────────────────────────────────────────────────

MALE_FIRST = [
    "Arjun", "Siddharth", "Arun", "Deepak", "Suresh", "Ramesh", "Nikhil", "Harish",
    "Ganesh", "Sanjay", "Mohan", "Rakesh", "Ashok", "Pankaj", "Ravi", "Gaurav",
    "Varun", "Manish", "Tarun", "Sachin", "Amit", "Naveen", "Krishna", "Sandeep",
]
FEMALE_FIRST = [
    "Meera", "Pooja", "Swati", "Shruti", "Neelam", "Rekha", "Geeta", "Nandini",
    "Pallavi", "Jyoti", "Shalini", "Aarti", "Vandana", "Bhavna", "Smita", "Archana",
    "Rashmi", "Deepika", "Preeti", "Sushma",
]
LAST_NAMES = [
    "Sharma", "Singh", "Patel", "Reddy", "Nambiar", "Das", "Bose", "Iyer",
    "Mukherjee", "Saxena", "Chauhan", "Mishra", "Thakur", "Deshpande", "Kulkarni",
    "Hegde", "Shetty", "Kamat", "Pandit", "Malhotra", "Kapoor", "Mehta",
    "Banerjee", "Chakraborty", "Ghosh", "Sen", "Goswami", "Jha", "Dubey", "Pandey",
]

DEPARTMENTS = [
    "Computer Science", "Electronics & Communication", "Mathematics",
    "Chemistry", "Physics", "Civil Engineering", "Mechanical Engineering",
]

DEPARTMENT_SPECIALIZATIONS = {
    "Computer Science": [
        ("Artificial Intelligence", "Ph.D. in Artificial Intelligence"),
        ("Cybersecurity", "Ph.D. in Cybersecurity"),
        ("Data Science", "Ph.D. in Data Science"),
        ("Software Engineering", "M.Tech in Software Engineering"),
        ("Computer Networks", "Ph.D. in Computer Networks"),
        ("Database Systems", "M.Tech in Database Systems"),
    ],
    "Electronics & Communication": [
        ("IoT Systems", "Ph.D. in IoT Systems"),
        ("Antenna Design", "M.Tech in Antenna Design"),
        ("Power Electronics", "Ph.D. in Power Electronics"),
        ("Microprocessors", "M.E. in Microprocessors"),
        ("Wireless Communication", "Ph.D. in Wireless Communication"),
    ],
    "Mathematics": [
        ("Applied Mathematics", "Ph.D. in Applied Mathematics"),
        ("Statistics", "Ph.D. in Statistics"),
        ("Combinatorics", "M.Sc. in Combinatorics"),
        ("Mathematical Modeling", "Ph.D. in Mathematical Modeling"),
    ],
    "Chemistry": [
        ("Analytical Chemistry", "Ph.D. in Analytical Chemistry"),
        ("Polymer Chemistry", "M.Tech in Polymer Chemistry"),
        ("Biochemistry", "Ph.D. in Biochemistry"),
        ("Environmental Chemistry", "Ph.D. in Environmental Chemistry"),
    ],
    "Physics": [
        ("Nuclear Physics", "Ph.D. in Nuclear Physics"),
        ("Optics", "Ph.D. in Optics"),
        ("Astrophysics", "M.Sc. in Astrophysics"),
        ("Thermodynamics", "Ph.D. in Thermodynamics"),
        ("Solid State Physics", "Ph.D. in Solid State Physics"),
    ],
    "Civil Engineering": [
        ("Structural Engineering", "Ph.D. in Structural Engineering"),
        ("Transportation Engineering", "M.Tech in Transportation Engineering"),
        ("Water Resources", "Ph.D. in Water Resources"),
        ("Environmental Engineering", "Ph.D. in Environmental Engineering"),
    ],
    "Mechanical Engineering": [
        ("Thermal Engineering", "Ph.D. in Thermal Engineering"),
        ("Robotics", "Ph.D. in Robotics"),
        ("CAD/CAM", "M.Tech in CAD/CAM"),
        ("Fluid Mechanics", "Ph.D. in Fluid Mechanics"),
        ("Automotive Engineering", "M.E. in Automotive Engineering"),
    ],
}

ALMA_MATERS = [
    "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
    "IISc Bangalore", "NIT Trichy", "NIT Warangal", "NIT Surathkal",
    "BITS Pilani", "VIT Vellore", "Anna University", "JNTU Hyderabad",
    "Delhi University", "Mumbai University", "Pune University", "IIIT Hyderabad",
]

COURSES_POOL = [
    "Data Structures", "Algorithms", "Operating Systems", "Computer Networks",
    "Machine Learning", "Database Management", "Software Engineering",
    "Digital Signal Processing", "Control Systems", "Numerical Methods",
    "Thermodynamics", "Engineering Mechanics", "Quantum Physics",
    "Structural Design", "Organic Chemistry Lab", "Linear Algebra",
    "Probability & Statistics", "Discrete Mathematics", "Compiler Design",
    "Computer Architecture", "Embedded Systems", "VLSI Design",
    "Environmental Science", "Engineering Drawing", "Workshop Practice",
    "Fluid Mechanics", "Heat Transfer", "Strength of Materials",
]

VENUES_POOL = [
    "IEEE", "Springer", "Elsevier", "Wiley", "ACM", "Taylor & Francis",
    "Nature", "Science Direct", "MDPI", "Royal Society of Chemistry",
]

AWARDS_POOL = [
    "Best Paper Award (International Conference)", "Best Teacher Award",
    "Outstanding Researcher Award", "Innovation in Teaching Award",
    "Young Scientist Award", "Excellence in Academics",
    "Distinguished Service Award", "Research Excellence Medal",
    "National Science Award", "Best Mentor Award",
]

PROJECTS_POOL = [
    "AI-based Attendance System", "Smart Campus IoT", "Renewable Energy Research",
    "Industry Collaboration Cell", "Curriculum Redesign Committee",
    "NAAC Accreditation Prep", "Blockchain for Academic Records",
    "Green Chemistry Initiative", "Autonomous Vehicle Research",
    "Digital Twin Laboratory", "Quantum Computing Lab Setup",
    "Student Mental Health AI", "Heritage Structure Analysis",
    "Waste Water Treatment Plant", "5G Testbed Development",
]

OFFICE_PREFIXES = {
    "Computer Science": "COM",
    "Electronics & Communication": "ELE",
    "Mathematics": "MAT",
    "Chemistry": "CHE",
    "Physics": "PHY",
    "Civil Engineering": "CIV",
    "Mechanical Engineering": "MEC",
}


def generate_orcid():
    parts = [f"{random.randint(0,9999):04d}" for _ in range(4)]
    return "-".join(parts)


def generate_phone():
    return f"9{random.randint(100000000, 999999999)}"


def parse_name(full_name):
    """Extract first and last name from 'Mr./Ms./Dr. First Last'"""
    parts = full_name.split()
    # Skip title (Mr., Ms., Dr.)
    if parts[0] in ("Mr.", "Ms.", "Dr."):
        parts = parts[1:]
    first = parts[0]
    last = parts[-1] if len(parts) > 1 else ""
    return first, last


def create_faculty_from_dict(data, dept_map):
    """Create a user and faculty profile from a data dict."""
    first_name, last_name = parse_name(data["name"])
    username = data["email"].split("@")[0]

    dept = dept_map.get(data["department"])
    if not dept:
        print(f"  ⚠ Department '{data['department']}' not found, skipping {data['faculty_id']}")
        return None

    # Create or get user
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": data["email"],
            "first_name": first_name,
            "last_name": last_name,
            "role": "HOD" if data["admin_role"] == "Head of Department" else "FACULTY",
            "is_active": True,
        }
    )
    if created:
        user.set_password("password123")
        user.save()

    # Check if profile already exists
    if FacultyProfile.objects.filter(faculty_id=data["faculty_id"]).exists():
        print(f"  ⊘ {data['faculty_id']} already exists, skipping")
        return None

    if FacultyProfile.objects.filter(user=user).exists():
        print(f"  ⊘ Profile for user {username} already exists, skipping")
        return None

    profile = FacultyProfile.objects.create(
        faculty_id=data["faculty_id"],
        user=user,
        gender=data["gender"],
        date_of_birth=date.fromisoformat(data["dob"]),
        department=dept,
        designation=data["designation"],
        admin_role=data["admin_role"],
        highest_qualification=data["qualification"],
        alma_mater=data["alma_mater"],
        specialization=data["specialization"],
        years_of_experience=data["experience"],
        date_of_joining=date.fromisoformat(data["joining"]),
        employment_type=data["employment"],
        status=data["status"],
        phone=data["phone"],
        office_room=data["office"],
        courses_taught=data["courses"],
        research_publications=data["publications"],
        sample_publication_venues=data["venues"],
        research_grants_received=data["grants"],
        total_grant_amount=Decimal(str(data["grant_amount"])),
        awards=data["awards"],
        orcid_id=data["orcid"],
        linkedin=data["linkedin"],
        student_rating=Decimal(str(data["rating"])),
        leaves_taken_this_year=data["leaves"],
        current_project=data["project"],
    )
    return profile


def generate_extra_faculty(start_index, count, dept_map):
    """Generate 'count' additional faculty with realistic data."""
    generated = []
    used_usernames = set(User.objects.values_list('username', flat=True))

    male_names = list(MALE_FIRST)
    female_names = list(FEMALE_FIRST)
    random.shuffle(male_names)
    random.shuffle(female_names)

    male_idx = 0
    female_idx = 0

    for i in range(count):
        fid = f"F{start_index + i:03d}"
        gender = random.choice(["Male", "Female"])

        if gender == "Male":
            if male_idx >= len(male_names):
                male_idx = 0
            first = male_names[male_idx]
            male_idx += 1
        else:
            if female_idx >= len(female_names):
                female_idx = 0
            first = female_names[female_idx]
            female_idx += 1

        last = random.choice(LAST_NAMES)

        # Make unique username
        base_username = f"{first.lower()}.{last.lower()}"
        username = base_username
        suffix = 1
        while username in used_usernames:
            username = f"{base_username}{suffix}"
            suffix += 1
        used_usernames.add(username)

        dept_name = random.choice(DEPARTMENTS)
        spec_qual = random.choice(DEPARTMENT_SPECIALIZATIONS[dept_name])
        specialization = spec_qual[0]
        qualification = spec_qual[1]

        # Designation weighted by experience
        exp = random.randint(1, 30)
        if exp >= 20:
            designation = "Professor"
        elif exp >= 10:
            designation = random.choice(["Associate Professor", "Professor"])
        elif exp >= 5:
            designation = random.choice(["Assistant Professor", "Associate Professor"])
        else:
            designation = random.choice(["Assistant Professor", "Lecturer"])

        dob_year = 2026 - exp - random.randint(25, 35)
        dob = date(dob_year, random.randint(1, 12), random.randint(1, 28))

        join_year = 2026 - exp
        joining = date(join_year, random.randint(1, 12), random.randint(1, 28))

        employment = random.choices(["Permanent", "Contract", "Visiting"], weights=[70, 20, 10])[0]
        status = random.choices(["Active", "On Leave", "Sabbatical"], weights=[85, 10, 5])[0]

        pubs = max(0, exp * random.randint(1, 3) + random.randint(-3, 5))
        grants = random.randint(0, 3)
        grant_amount = random.choice([0, 250000, 500000, 800000, 1200000, 2000000]) if grants > 0 else 0

        num_courses = random.randint(1, 4)
        courses = "; ".join(random.sample(COURSES_POOL, min(num_courses, len(COURSES_POOL))))

        num_venues = random.randint(2, 4)
        venues = "; ".join(random.sample(VENUES_POOL, min(num_venues, len(VENUES_POOL))))

        num_awards = random.choices([0, 1, 2], weights=[50, 35, 15])[0]
        awards = "; ".join(random.sample(AWARDS_POOL, num_awards)) if num_awards > 0 else ""

        prefix = OFFICE_PREFIXES.get(dept_name, "GEN")
        office = f"{prefix}-{random.randint(100, 499)}"

        email = f"{username}@univ.edu"
        phone = generate_phone()
        orcid = generate_orcid()
        linkedin = f"linkedin.com/in/{username.replace('.', '')}{random.randint(10, 99)}"

        rating = round(random.uniform(3.0, 5.0), 1)
        leaves = random.randint(0, 15)
        project = random.choice(PROJECTS_POOL + [""])

        generated.append({
            "faculty_id": fid,
            "name": f"{'Dr.' if 'Ph.D' in qualification else 'Mr.' if gender == 'Male' else 'Ms.'} {first} {last}",
            "gender": gender,
            "dob": dob.isoformat(),
            "department": dept_name,
            "designation": designation,
            "admin_role": "None",
            "qualification": qualification,
            "alma_mater": random.choice(ALMA_MATERS),
            "specialization": specialization,
            "experience": exp,
            "joining": joining.isoformat(),
            "employment": employment,
            "status": status,
            "email": email,
            "phone": phone,
            "office": office,
            "courses": courses,
            "publications": pubs,
            "venues": venues,
            "grants": grants,
            "grant_amount": grant_amount,
            "awards": awards,
            "orcid": orcid,
            "linkedin": linkedin,
            "rating": rating,
            "leaves": leaves,
            "project": project,
        })

    # Assign special roles to a few generated faculty
    # HoDs for departments that don't already have one
    hod_depts = {"Chemistry", "Electronics & Communication", "Mathematics"}  # already have HoDs from CSV
    for entry in generated:
        if entry["department"] not in hod_depts and entry["designation"] == "Professor":
            entry["admin_role"] = "Head of Department"
            hod_depts.add(entry["department"])

    # Assign Dean to one senior professor
    senior_profs = [e for e in generated if e["designation"] == "Professor" and e["admin_role"] == "None" and e["experience"] >= 20]
    if senior_profs:
        senior_profs[0]["admin_role"] = "Dean"

    # Assign Lab In-charge to a couple
    lab_candidates = [e for e in generated if e["admin_role"] == "None" and e["designation"] in ("Assistant Professor", "Associate Professor")]
    for lc in lab_candidates[:3]:
        lc["admin_role"] = "Lab In-charge"

    return generated


def seed():
    print("=" * 60)
    print("  FACULTY SEED SCRIPT — 60 Faculty Members")
    print("=" * 60)

    # Build department map
    dept_map = {}
    for dept in Department.objects.all():
        dept_map[dept.name] = dept
    print(f"\nFound {len(dept_map)} departments: {list(dept_map.keys())}")

    # Ensure all required departments exist
    print("Ensuring required departments exist...")
    for dept_name in DEPARTMENTS:
        if dept_name not in dept_map:
            code = "".join(w[0] for w in dept_name.split()).upper()
            if len(code) < 2:
                code = dept_name[:3].upper()
            dept, _ = Department.objects.get_or_create(
                name=dept_name,
                defaults={"code": code, "description": f"Department of {dept_name}"}
            )
            dept_map[dept_name] = dept
            print(f"  + Created department: {dept_name} ({code})")

    # Phase 1: Seed CSV data (F001–F020)
    print(f"\n{'─' * 40}")
    print("📋 Phase 1: Seeding 20 CSV Faculty...")
    print(f"{'─' * 40}")
    csv_count = 0
    for data in CSV_FACULTY:
        profile = create_faculty_from_dict(data, dept_map)
        if profile:
            csv_count += 1
            print(f"  ✓ {data['faculty_id']} — {data['name']} ({data['department']}, {data['designation']})")

    # Phase 2: Generate 40 more (F021–F060)
    print(f"\n{'─' * 40}")
    print("🔧 Phase 2: Generating 40 additional faculty...")
    print(f"{'─' * 40}")
    extra_data = generate_extra_faculty(21, 40, dept_map)
    gen_count = 0
    for data in extra_data:
        profile = create_faculty_from_dict(data, dept_map)
        if profile:
            gen_count += 1
            role_tag = f" [{data['admin_role']}]" if data['admin_role'] != 'None' else ""
            print(f"  ✓ {data['faculty_id']} — {data['name']} ({data['department']}, {data['designation']}){role_tag}")

    # Summary
    total = FacultyProfile.objects.count()
    print(f"\n{'=' * 60}")
    print(f"  ✅ Seeding complete!")
    print(f"     CSV faculty created: {csv_count}")
    print(f"     Generated faculty created: {gen_count}")
    print(f"     Total faculty in database: {total}")
    print(f"{'=' * 60}")

    # Print role distribution
    from django.db.models import Count
    roles = FacultyProfile.objects.values('admin_role').annotate(count=Count('id')).order_by('admin_role')
    print(f"\n  📊 Role Distribution:")
    for r in roles:
        print(f"     {r['admin_role']}: {r['count']}")

    depts = FacultyProfile.objects.values('department__name').annotate(count=Count('id')).order_by('department__name')
    print(f"\n  📊 Department Distribution:")
    for d in depts:
        print(f"     {d['department__name']}: {d['count']}")


if __name__ == '__main__':
    seed()
