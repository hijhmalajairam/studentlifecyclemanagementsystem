import django
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from django.apps import apps
from django.db import models

output = []
for app in apps.get_app_configs():
    if app.label in ['users', 'academics', 'admission']:
        output.append(f"## App: {app.label.capitalize()}")
        for model in app.get_models():
            output.append(f"### {model.__name__}")
            for field in model._meta.get_fields():
                if isinstance(field, models.Field):
                    field_type = field.get_internal_type()
                    try:
                        is_null = field.null
                    except:
                        is_null = False
                    related = ""
                    if field.is_relation and hasattr(field, 'related_model') and field.related_model:
                        related = f" -> {field.related_model.__name__}"
                    output.append(f"- **{field.name}** ({field_type}){related} {'[NULL]' if is_null else ''}")
        output.append("")

with open('db_schema.md', 'w') as f:
    f.write('\n'.join(output))

print('Schema generated')
