import sqlite3
import json

# الاتصال أو إنشاء قاعدة البيانات
conn = sqlite3.connect("../projects.db")
cursor = conn.cursor()

# حذف الجدول إذا كان موجود مسبقًا (اختياري)
cursor.execute("DROP TABLE IF EXISTS contact_requests")

# إنشاء جدول اتصل بنا
cursor.execute('''
    CREATE TABLE contact_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reason TEXT NOT NULL,
        other_reason TEXT,  -- إذا السبب "سبب آخر"
        message TEXT,
        phone TEXT,
        email TEXT
    )
''')

conn.commit()
conn.close()

print("✅ تم إنشاء جدول اتصل بنا بنجاح.")
