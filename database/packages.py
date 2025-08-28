import sqlite3
import json

# الاتصال أو إنشاء قاعدة البيانات
conn = sqlite3.connect("../projects.db")
cursor = conn.cursor()

# حذف الجدول إذا كان موجود مسبقاً
cursor.execute("DROP TABLE IF EXISTS packages")

# إنشاء جدول الباقات
cursor.execute('''
    CREATE TABLE packages (
        id INTEGER PRIMARY KEY,
        title TEXT,
        description TEXT,
        price REAL,
        delivery_time TEXT,
        features TEXT,
        category TEXT,
        is_active BOOLEAN,
        display_order INTEGER
    )
''')

# بيانات الباقات
packages = [
    {
        'id': 1,
        'title': 'الباقة الاحترافية',
        'description': 'للشركات الكبيرة والمشاريع المعقدة',
        'price': 4900,
        'delivery_time': '4-6 أسابيع',
        'features': [
            'تطوير متقدم مع ميزات خاصة',
            'تحسين محركات البحث الاحترافي',
            'تكامل مع الأنظمة الخارجية',
            'نظام إدارة متقدم',
            'دعم فني لمدة 6 أشهر',
            'تحليلات متقدمة',
            'نسخ احتياطية يومية',
            'تدريب شامل للفريق',
            'استشارات تسويقية'
        ],
        'category': 'web_dev',
        'is_active': True,
        'order': 1
    },
    {
        'id': 2,
        'title': 'الباقة الأساسية',
        'description': 'مثالية للشركات الناشئة والمشاريع الصغيرة',
        'price': 1400,
        'delivery_time': '2-3 أسابيع',
        'features': [
            'تطوير متجاوب',
            'تحسين محركات البحث الأساسي',
            'شهادة SSL',
            'دعم فني لمدة شهر',
            'تدريب على الاستخدام'
        ],
        'category': 'web_dev',
        'is_active': True,
        'order': 2
    },
    {
        'id': 3,
        'title': 'باقة إنشاء متجر إلكتروني',
        'description': 'باقة متكاملة لإنشاء وتشغيل متجر إلكتروني احترافي تشمل الإعداد على زد أو سلة',
        'price': 3500,
        'delivery_time': 'مدة حسب الاتفاق',
        'features': [
            'إنشاء متجر إلكتروني متكامل على منصة زد',
            'تسجيل دومين مخصص باسم الشركة',
            'تصميم الهوية البصرية للمتجر والشركة',
            'رفع منتجًا مع كتابة الأوصاف وتحسين SEO',
            'ربط وسائل الدفع بالتقسيط (تابي وتمارا)',
            'إنشاء حسابات إعلانية على سناب شات/تيك توك/جوجل/ميتا'
        ],
        'category': 'ecommerce',
        'is_active': True,
        'order': 3
    },
    {
        'id': 4,
        'title': 'الباقة المتقدمة',
        'description': 'الأنسب للشركات المتوسطة والمشاريع التجارية',
        'price': 2900,
        'delivery_time': '3-5 أسابيع',
        'features': [
            'تطوير متقدم مع CMS',
            'تحسين محركات البحث المتقدم',
            'تكامل مع وسائل التواصل',
            'نظام إدارة المحتوى',
            'دعم فني لمدة 3 أشهر',
            'تحليلات وتقارير',
            'نسخ احتياطية أسبوعية'
        ],
        'category': 'web_dev',
        'is_active': True,
        'order': 4
    }
]

# إدخال البيانات
for pkg in packages:
    cursor.execute('''
        INSERT INTO packages (
            id, title, description, price, delivery_time, features, category, is_active, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        pkg['id'],
        pkg['title'],
        pkg['description'],
        pkg['price'],
        pkg['delivery_time'],
        json.dumps(pkg['features'], ensure_ascii=False),
        pkg['category'],
        int(pkg['is_active']),
        pkg['order']
    ))

conn.commit()
conn.close()

print("✅ تم إنشاء جدول الباقات وإدخال البيانات بنجاح.")
