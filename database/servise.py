import sqlite3
import json

# الاتصال أو إنشاء قاعدة البيانات
conn = sqlite3.connect("projects.db")
cursor = conn.cursor()

# حذف الجدول إذا كان موجودًا مسبقًا (اختياري لإعادة التشغيل)
cursor.execute("DROP TABLE IF EXISTS services")

# إنشاء جدول الخدمات
cursor.execute('''
    CREATE TABLE services (
        id INTEGER PRIMARY KEY,
        title TEXT,
        description TEXT,
        short_description TEXT,
        icon TEXT,
        image TEXT,
        features TEXT,
        benefits TEXT,
        category TEXT,
        is_active BOOLEAN,
        display_order INTEGER
    )
''')

# بيانات الإدخال
services = [
    {
        'id': 1,
        'title': 'البناء التجارى',
        'description': 'نقدم خدمات البناء التجاري الشاملة من التصميم إلى التسليم، بما في ذلك مباني المكاتب ومراكز التسوق والفنادق والمطاعم.',
        'shortDescription': 'مباني تجارية حديثة ومتطورة',
        'icon': 'Building',
        'image': 'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=800',
        'features': ['مباني المكاتب', 'مراكز التسوق', 'الفنادق والمطاعم', 'التطويرات متعددة الاستخدامات'],
        'benefits': ['تصميم عصري', 'جودة عالية', 'تسليم في الوقت المحدد', 'كفاءة في التكلفة'],
        'category': 'construction',
        'isActive': True,
        'order': 1
    },
    {
        'id': 2,
        'title': 'المشاريع السكنية',
        'description': 'تطوير مشاريع سكنية متنوعة تشمل الفلل الفاخرة والمجمعات السكنية والمجتمعات المسورة مع التركيز على الراحة والأناقة.',
        'shortDescription': 'حلول سكنية فاخرة ومريحة',
        'icon': 'Home',
        'image': 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
        'features': ['الفلل الفاخرة', 'المجمعات السكنية', 'المجتمعات المسورة', 'المنازل الذكية'],
        'benefits': ['تصميم مخصص', 'مواد عالية الجودة', 'تقنيات حديثة', 'خدمات ما بعد البيع'],
        'category': 'construction',
        'isActive': True,
        'order': 2
    },
    {
        'id': 3,
        'title': 'البناء الصناعي',
        'description': 'إنشاء مرافق صناعية متطورة تشمل المصانع والمستودعات ومراكز التوزيع مع التركيز على الكفاءة والأمان.',
        'shortDescription': 'مرافق صناعية متطورة وآمنة',
        'icon': 'Factory',
        'image': 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=800',
        'features': ['مصانع التصنيع', 'المستودعات', 'مراكز التوزيع', 'المراكز اللوجستية'],
        'benefits': ['معايير أمان عالية', 'كفاءة تشغيلية', 'تقنيات متقدمة', 'صيانة مستمرة'],
        'category': 'construction',
        'isActive': True,
        'order': 3
    }
    ,
    {
        'id': 4,
        'title': 'البناء الصناعي',
        'description': 'إنشاء مرافق صناعية متطورة تشمل المصانع والمستودعات ومراكز التوزيع مع التركيز على الكفاءة والأمان.',
        'shortDescription': 'مرافق صناعية متطورة وآمنة',
        'icon': 'Factory',
        'image': 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=800',
        'features': ['مصانع التصنيع', 'المستودعات', 'مراكز التوزيع', 'المراكز اللوجستية'],
        'benefits': ['معايير أمان عالية', 'كفاءة تشغيلية', 'تقنيات متقدمة', 'صيانة مستمرة'],
        'category': 'construction',
        'isActive': True,
        'order': 4
    }
    ,
    {
        'id': 5,
        'title': 'البناء الصناعي',
        'description': 'إنشاء مرافق صناعية متطورة تشمل المصانع والمستودعات ومراكز التوزيع مع التركيز على الكفاءة والأمان.',
        'shortDescription': 'مرافق صناعية متطورة وآمنة',
        'icon': 'Factory',
        'image': 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=800',
        'features': ['مصانع التصنيع', 'المستودعات', 'مراكز التوزيع', 'المراكز اللوجستية'],
        'benefits': ['معايير أمان عالية', 'كفاءة تشغيلية', 'تقنيات متقدمة', 'صيانة مستمرة'],
        'category': 'construction',
        'isActive': True,
        'order': 5
    }
]

# إدخال البيانات
for service in services:
    cursor.execute('''
        INSERT INTO services (
            id, title, description, short_description, icon, image, features, benefits, category, is_active, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        service['id'],
        service['title'],
        service['description'],
        service['shortDescription'],
        service['icon'],
        service['image'],
        json.dumps(service['features'], ensure_ascii=False),
        json.dumps(service['benefits'], ensure_ascii=False),
        service['category'],
        int(service['isActive']),
        service['order']
    ))

conn.commit()
conn.close()

print("✅ تم إنشاء جدول الخدمات وإدخال البيانات بنجاح.")
