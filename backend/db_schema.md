## App: Admission
### ApplicantProfile
- **id** (BigAutoField) 
- **user** (OneToOneField) -> User 
- **registration_number** (CharField) 
- **father_name** (CharField) 
- **mother_name** (CharField) 
- **guardian_name** (CharField) 
- **guardian_occupation** (CharField) 
- **family_income** (DecimalField) [NULL]
- **date_of_birth** (DateField) [NULL]
- **gender** (CharField) 
- **category** (CharField) 
- **blood_group** (CharField) 
- **nationality** (CharField) 
- **phone** (CharField) 
- **permanent_address** (TextField) 
- **correspondence_address** (TextField) 
- **city** (CharField) 
- **state** (CharField) 
- **pincode** (CharField) 
### AdmissionApplication
- **id** (BigAutoField) 
- **profile** (ForeignKey) -> ApplicantProfile 
- **program** (ForeignKey) -> Program [NULL]
- **application_number** (CharField) 
- **entry_type** (CharField) 
- **tenth_school_name** (CharField) 
- **tenth_board** (CharField) 
- **tenth_passing_year** (IntegerField) [NULL]
- **tenth_percentage** (DecimalField) [NULL]
- **twelfth_school_name** (CharField) 
- **twelfth_board** (CharField) 
- **twelfth_passing_year** (IntegerField) [NULL]
- **twelfth_percentage** (DecimalField) [NULL]
- **extra_curricular_achievements** (TextField) 
- **any_gap_years** (BooleanField) 
- **scholarship_requested** (BooleanField) 
- **interviewer** (ForeignKey) -> User [NULL]
- **interview_date** (DateTimeField) [NULL]
- **interviewer_notes** (TextField) 
- **status** (CharField) 
- **enrollment_number** (CharField) [NULL]
- **applied_date** (DateTimeField) 
- **updated_date** (DateTimeField) 
### Document
- **id** (BigAutoField) 
- **application** (ForeignKey) -> AdmissionApplication 
- **document_name** (CharField) 
- **file** (FileField) 
- **status** (CharField) 
- **uploaded_at** (DateTimeField) 
### Scholarship
- **id** (BigAutoField) 
- **application** (OneToOneField) -> AdmissionApplication 
- **reason** (TextField) 
- **concession_percentage** (DecimalField) 
- **status** (CharField) 
### SeatAllocation
- **id** (BigAutoField) 
- **application** (OneToOneField) -> AdmissionApplication 
- **allocated_by** (ForeignKey) -> User [NULL]
- **allocated_department** (CharField) 
- **allocated_program** (CharField) 
- **allocated_batch** (CharField) 
- **allocated_at** (DateTimeField) 

## App: Academics
### Department
- **id** (BigAutoField) 
- **name** (CharField) 
- **code** (CharField) 
- **description** (TextField) 
### Program
- **id** (BigAutoField) 
- **department** (ForeignKey) -> Department 
- **name** (CharField) 
- **code** (CharField) 
- **duration_years** (IntegerField) 
- **description** (TextField) 
### Enrollment
- **id** (BigAutoField) 
- **user** (OneToOneField) -> User 
- **enrollment_number** (CharField) 
- **fee_paid** (BooleanField) 
- **enrolled_date** (DateTimeField) 
### Course
- **id** (BigAutoField) 
- **code** (CharField) 
- **name** (CharField) 
- **credits** (IntegerField) 
- **semester** (IntegerField) 
### SemesterRegistration
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **semester** (IntegerField) 
- **registered_at** (DateTimeField) 
- **courses** (ManyToManyField) -> Course 
### Attendance
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **course** (ForeignKey) -> Course 
- **date** (DateField) 
- **status** (CharField) 
### Leave
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **start_date** (DateField) 
- **end_date** (DateField) 
- **reason** (TextField) 
- **status** (CharField) 
- **applied_on** (DateTimeField) 
### Result
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **course** (ForeignKey) -> Course 
- **marks_obtained** (DecimalField) 
- **max_marks** (DecimalField) 
- **grade** (CharField) 
- **is_backlog** (BooleanField) 
- **is_revaluation** (BooleanField) 
### Fee
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **semester** (IntegerField) 
- **amount** (DecimalField) 
- **scholarship_discount** (DecimalField) 
- **status** (CharField) 
- **due_date** (DateField) 
- **paid_date** (DateField) [NULL]
### Timetable
- **id** (BigAutoField) 
- **course** (ForeignKey) -> Course 
- **faculty** (ForeignKey) -> User [NULL]
- **day** (CharField) 
- **start_time** (TimeField) 
- **end_time** (TimeField) 
- **room** (CharField) 
### Notification
- **id** (BigAutoField) 
- **user** (ForeignKey) -> User 
- **title** (CharField) 
- **message** (TextField) 
- **notification_type** (CharField) 
- **is_read** (BooleanField) 
- **created_at** (DateTimeField) 
### RevaluationRequest
- **id** (BigAutoField) 
- **result** (ForeignKey) -> Result 
- **reason** (TextField) 
- **status** (CharField) 
- **requested_at** (DateTimeField) 
- **new_marks** (DecimalField) [NULL]
- **new_grade** (CharField) 
### TransferRequest
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **request_type** (CharField) 
- **reason** (TextField) 
- **status** (CharField) 
- **requested_at** (DateTimeField) 
### NoDues
- **id** (BigAutoField) 
- **enrollment** (OneToOneField) -> Enrollment 
- **library_cleared** (BooleanField) 
- **hostel_cleared** (BooleanField) 
- **fees_cleared** (BooleanField) 
- **department_cleared** (BooleanField) 
- **all_cleared** (BooleanField) 
- **certificate_issued** (BooleanField) 
- **created_at** (DateTimeField) 
### DisciplinaryCase
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **reported_by** (ForeignKey) -> User [NULL]
- **title** (CharField) 
- **description** (TextField) 
- **date_of_incident** (DateField) 
- **status** (CharField) 
- **action_taken** (TextField) [NULL]
- **created_at** (DateTimeField) 
### Internship
- **id** (BigAutoField) 
- **enrollment** (ForeignKey) -> Enrollment 
- **company_name** (CharField) 
- **role** (CharField) 
- **start_date** (DateField) 
- **end_date** (DateField) 
- **stipend** (DecimalField) 
- **supervisor_name** (CharField) 
- **supervisor_email** (CharField) 
- **status** (CharField) 
- **report_file** (FileField) [NULL]
- **created_at** (DateTimeField) 
### FacultyProfile
- **id** (BigAutoField) 
- **faculty_id** (CharField) 
- **user** (OneToOneField) -> User 
- **gender** (CharField) 
- **date_of_birth** (DateField) [NULL]
- **department** (ForeignKey) -> Department [NULL]
- **designation** (CharField) 
- **admin_role** (CharField) 
- **additional_roles** (JSONField) 
- **highest_qualification** (CharField) 
- **alma_mater** (CharField) 
- **specialization** (CharField) 
- **years_of_experience** (IntegerField) 
- **date_of_joining** (DateField) [NULL]
- **employment_type** (CharField) 
- **status** (CharField) 
- **phone** (CharField) 
- **office_room** (CharField) 
- **courses_taught** (TextField) 
- **research_publications** (IntegerField) 
- **sample_publication_venues** (TextField) 
- **research_grants_received** (IntegerField) 
- **total_grant_amount** (DecimalField) 
- **awards** (TextField) 
- **orcid_id** (CharField) 
- **linkedin** (CharField) 
- **student_rating** (DecimalField) 
- **leaves_taken_this_year** (IntegerField) 
- **current_project** (CharField) 

## App: Users
### User
- **id** (BigAutoField) 
- **password** (CharField) 
- **last_login** (DateTimeField) [NULL]
- **is_superuser** (BooleanField) 
- **username** (CharField) 
- **first_name** (CharField) 
- **last_name** (CharField) 
- **email** (CharField) 
- **is_staff** (BooleanField) 
- **is_active** (BooleanField) 
- **date_joined** (DateTimeField) 
- **role** (CharField) 
- **additional_roles** (JSONField) 
- **phone** (CharField) [NULL]
- **student** (ForeignKey) -> User [NULL]
- **groups** (ManyToManyField) -> Group 
- **user_permissions** (ManyToManyField) -> Permission 
