import sqlite3

# الاتصال أو إنشاء قاعدة البيانات
conn = sqlite3.connect('projects.db')
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS projects")

# إنشاء جدول المشاريع
cursor.execute('''
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT,
    completion INTEGER,
    value TEXT,
    duration TEXT,
    location TEXT,
    client TEXT,
    image TEXT,
    startDate TEXT,
    endDate TEXT
)
''')

# إضافة البيانات
projects = [
    {
        'id': '1',
        'title': 'برج الريaاض التجاري',
        'description': 'برج متعدد الاستخدامات من 40 طابقاً يضم مساحات مكتبية متميزة ومنافذ تجارية فاخرة في قلب الرياض.',
        'category': 'commercial',
        'status': 'completed',
        'completion': 100,
        'value': '85 مليون دولار',
        'duration': '36 شهراً',
        'location': 'الرياض، المملكة العربية السعودية',
        'client': 'شركة التطوير الملكي',
        'image': 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
        'startDate': '2021-01-15',
        'endDate': '2024-01-15'
    },
    {
        'id': '2',
        'title': 'مجمع النور السكني',
        'description': 'مجمع سكني حديث يضم 200 شقة فاخرة ومرافق واسعة تشمل المسابح والحدائق.',
        'category': 'residential',
        'status': 'in-progress',
        'completion': 75,
        'value': '45 مليون دولار',
        'duration': '24 شهراً',
        'location': 'جدة، المملكة العربية السعودية',
        'client': 'شركة النور العقارية',
        'image': 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
        'startDate': '2023-06-01',
        'endDate': '2025-06-01'
    },
    {
        'id': '3',
        'title': 'المدينة الصناعية المرحلة الأولى',
        'description': 'مرفق تصنيع ولوجستيات متطور يدعم أهداف التنمية الصناعية لرؤية 2030.',
        'category': 'industrial',
        'status': 'in-progress',
        'completion': 60,
        'value': '120 مليون دولار',
        'duration': '18 شهراً',
        'location': 'الدمام، المملكة العربية السعودية',
        'client': 'التنمية الصناعية السعودية',
        'image': 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=800',
        'startDate': '2023-01-01',
        'endDate': '2024-07-01'
    },
    {
        'id': '4',
        'title': 'برج الرياض التجاري',
        'description': 'برج متعدد الاستخدامات من 40 طابقاً يضم مساحات مكتبية متميزة ومنافذ تجارية فاخرة في قلب الرياض.',
        'category': 'commercial',
        'status': 'completed',
        'completion': 100,
        'value': '85 مليون دولار',
        'duration': '36 شهراً',
        'location': 'الرياض، المملكة العربية السعودية',
        'client': 'شركة التطوير الملكي',
        'image': 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
        'startDate': '2021-01-15',
        'endDate': '2024-01-15'
    },
    
    {
        'id': '5',
        'title': 'برج الرياض التجاري',
        'description': 'برج متعدد الاستخدامات من 40 طابقاً يضم مساحات مكتبية متميزة ومنافذ تجارية فاخرة في قلب الرياض.',
        'category': 'commercial',
        'status': 'completed',
        'completion': 50,
        'value': '85 مليون دولار',
        'duration': '36 شهراً',
        'location': 'الرياض، المملكة العربية السعودية',
        'client': 'شركة التطوير الملكي',
        'image': 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
        'startDate': '2021-01-15',
        'endDate': '2024-01-15'
    },
    
    {
        'id': '6',
        'title': 'برج الرياض التجاري',
        'description': 'برج متعدد الاستخدامات من 40 طابقاً يضم مساحات مكتبية متميزة ومنافذ تجارية فاخرة في قلب الرياض.',
        'category': 'commercial',
        'status': 'completed',
        'completion': 80,
        'value': '85 مليون دولار',
        'duration': '36 شهراً',
        'location': 'الرياض، المملكة العربية السعودية',
        'client': 'شركة التطوير الملكي',
        'image': 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
        'startDate': '2021-01-15',
        'endDate': '2024-01-15'
    }

]

for p in projects:
    cursor.execute('''
        INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        p['id'], p['title'], p['description'], p['category'], p['status'], p['completion'],
        p['value'], p['duration'], p['location'], p['client'], p['image'], p['startDate'], p['endDate']
    ))

conn.commit()
conn.close()

print("✅ تم إنشاء قاعدة البيانات وإضافة المشاريع.")
