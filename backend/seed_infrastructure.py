#!/usr/bin/env python
"""
Standalone Django script to seed infrastructure data.
Seeds 20 Library Books, 5 Hostel Blocks, and 100 Room numbers using Faker.
Run: python seed_infrastructure.py
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Set UTF-8 encoding for console output
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')

# Setup Django
django.setup()

from faker import Faker

fake = Faker()


def seed_library_books(count=20):
    """
    Seed dummy library books.
    Assumes LibraryBook model exists with fields: title, author, isbn, publication_year, available_copies
    """
    print(f"\n📚 Seeding {count} Library Books...")
    
    try:
        from library.models import LibraryBook
        
        books_data = []
        for i in range(count):
            books_data.append(
                LibraryBook(
                    title=fake.catch_phrase() + " Handbook",
                    author=fake.name(),
                    isbn=fake.isbn13(),
                    publication_year=fake.random_int(min=1990, max=2024),
                    available_copies=fake.random_int(min=1, max=10)
                )
            )
        
        LibraryBook.objects.bulk_create(books_data, batch_size=100)
        print(f"✅ Created {count} Library Books successfully!")
        
    except ImportError:
        print("⚠️  LibraryBook model not found. Here's the mock SQL:")
        for i in range(count):
            print(f"""
INSERT INTO library_librarybook 
    (title, author, isbn, publication_year, available_copies, created_at, updated_at)
VALUES (
    '{fake.catch_phrase()} Handbook',
    '{fake.name()}',
    '{fake.isbn13()}',
    {fake.random_int(min=1990, max=2024)},
    {fake.random_int(min=1, max=10)},
    '{datetime.now().isoformat()}',
    '{datetime.now().isoformat()}'
);""")


def seed_hostel_blocks(count=5):
    """
    Seed hostel blocks.
    Assumes HostelBlock model exists with fields: block_name, capacity, warden_name, phone_number
    """
    print(f"\n🏢 Seeding {count} Hostel Blocks...")
    
    try:
        from hostel.models import HostelBlock
        
        blocks_data = []
        block_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        
        for i in range(count):
            blocks_data.append(
                HostelBlock(
                    block_name=f"Block {block_names[i]}",
                    capacity=fake.random_int(min=40, max=100),
                    warden_name=fake.name(),
                    phone_number=fake.phone_number()
                )
            )
        
        HostelBlock.objects.bulk_create(blocks_data, batch_size=100)
        print(f"✅ Created {count} Hostel Blocks successfully!")
        
    except ImportError:
        print("⚠️  HostelBlock model not found. Here's the mock SQL:")
        block_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        for i in range(count):
            print(f"""
INSERT INTO hostel_hostelblock 
    (block_name, capacity, warden_name, phone_number, created_at, updated_at)
VALUES (
    'Block {block_names[i]}',
    {fake.random_int(min=40, max=100)},
    '{fake.name()}',
    '{fake.phone_number()}',
    '{datetime.now().isoformat()}',
    '{datetime.now().isoformat()}'
);""")


def seed_room_numbers(count=100):
    """
    Seed room numbers across hostel blocks.
    Assumes Room model exists with fields: room_number, block, floor, capacity, is_occupied
    """
    print(f"\n🚪 Seeding {count} Room Numbers...")
    
    try:
        from hostel.models import HostelBlock, Room
        
        blocks = HostelBlock.objects.all()
        if not blocks.exists():
            print("⚠️  No Hostel Blocks found. Create blocks first!")
            return
        
        rooms_data = []
        blocks_list = list(blocks)
        
        for i in range(count):
            block = blocks_list[i % len(blocks_list)]
            floor = (i % 20) // 5 + 1
            room_num = (i % 5) + 1
            
            rooms_data.append(
                Room(
                    room_number=f"{block.block_name}-{floor}{room_num:02d}",
                    block=block,
                    floor=floor,
                    capacity=fake.random_int(min=1, max=4),
                    is_occupied=fake.boolean(chance_of_getting_true=40)
                )
            )
        
        Room.objects.bulk_create(rooms_data, batch_size=100)
        print(f"✅ Created {count} Room Numbers successfully!")
        
    except ImportError:
        print("⚠️  Room model not found. Here's the mock SQL:")
        for i in range(count):
            block_id = (i % 5) + 1
            floor = (i % 20) // 5 + 1
            room_num = (i % 5) + 1
            print(f"""
INSERT INTO hostel_room 
    (room_number, block_id, floor, capacity, is_occupied, created_at, updated_at)
VALUES (
    'Block-{floor}{room_num:02d}',
    {block_id},
    {floor},
    {fake.random_int(min=1, max=4)},
    {1 if fake.boolean(chance_of_getting_true=40) else 0},
    '{datetime.now().isoformat()}',
    '{datetime.now().isoformat()}'
);""")


def main():
    """Main execution function."""
    print("\n" + "="*60)
    print("🌱 Starting Infrastructure Seeding Script")
    print("="*60)
    
    try:
        # Seed in order: blocks first, then rooms, then books
        seed_hostel_blocks(5)
        seed_room_numbers(100)
        seed_library_books(20)
        
        print("\n" + "="*60)
        print("✨ Seeding Complete!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
