import sqlite3
import os

db_path = 'db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    tables_to_drop = ['academics_internshipwindow', 'academics_disciplinarycase', 'academics_internalassessment']
    for table in tables_to_drop:
        try:
            c.execute(f"DROP TABLE {table}")
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Error dropping {table}: {e}")
    conn.commit()
