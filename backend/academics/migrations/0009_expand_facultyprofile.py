from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('academics', '0008_facultyprofile'),
    ]

    operations = [
        # Remove old joining_date field
        migrations.RemoveField(
            model_name='facultyprofile',
            name='joining_date',
        ),
        # Add new fields
        migrations.AddField(
            model_name='facultyprofile',
            name='faculty_id',
            field=models.CharField(default='TEMP', max_length=10, unique=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='gender',
            field=models.CharField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], default='Male', max_length=10),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='admin_role',
            field=models.CharField(choices=[('None', 'None'), ('Head of Department', 'Head of Department'), ('Exam Controller', 'Exam Controller'), ('Warden', 'Warden'), ('Placement Coordinator', 'Placement Coordinator'), ('Dean', 'Dean'), ('Lab In-charge', 'Lab In-charge')], default='None', max_length=50),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='highest_qualification',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='alma_mater',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='specialization',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='years_of_experience',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='date_of_joining',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='employment_type',
            field=models.CharField(choices=[('Permanent', 'Permanent'), ('Contract', 'Contract'), ('Visiting', 'Visiting')], default='Permanent', max_length=20),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='status',
            field=models.CharField(choices=[('Active', 'Active'), ('On Leave', 'On Leave'), ('Sabbatical', 'Sabbatical'), ('Retired', 'Retired')], default='Active', max_length=20),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='phone',
            field=models.CharField(blank=True, default='', max_length=15),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='office_room',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='courses_taught',
            field=models.TextField(blank=True, default='', help_text='Semicolon-separated list of courses'),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='research_publications',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='sample_publication_venues',
            field=models.TextField(blank=True, default='', help_text='Semicolon-separated venues'),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='research_grants_received',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='total_grant_amount',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='awards',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='orcid_id',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='linkedin',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='student_rating',
            field=models.DecimalField(decimal_places=1, default=0.0, max_digits=3),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='leaves_taken_this_year',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='facultyprofile',
            name='current_project',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        # Update designation to use choices
        migrations.AlterField(
            model_name='facultyprofile',
            name='designation',
            field=models.CharField(choices=[('Assistant Professor', 'Assistant Professor'), ('Associate Professor', 'Associate Professor'), ('Professor', 'Professor'), ('Lecturer', 'Lecturer'), ('Senior Lecturer', 'Senior Lecturer')], default='Assistant Professor', max_length=100),
        ),
        # Now make faculty_id unique
        migrations.AlterField(
            model_name='facultyprofile',
            name='faculty_id',
            field=models.CharField(max_length=10, unique=True),
        ),
        # Add ordering meta
        migrations.AlterModelOptions(
            name='facultyprofile',
            options={'ordering': ['faculty_id']},
        ),
    ]
