import sqlite3
import json

# الاتصال أو إنشاء قاعدة البيانات
conn = sqlite3.connect("../projects.db")
cursor = conn.cursor()

# حذف الجدول إذا كان موجود مسبقاً
cursor.execute("DROP TABLE IF EXISTS packages_server")

# إنشاء جدول الباقات مع حقل لتخزين الكود الكامل للأيقونة
cursor.execute('''
    CREATE TABLE packages_server (
        id INTEGER PRIMARY KEY,
        title TEXT,
        description TEXT,
        price REAL,
        delivery_time TEXT,
        features TEXT,
        category TEXT,
        is_active BOOLEAN,
        display_order INTEGER,
        icon_html TEXT
    )
''')

# بيانات الباقات مع أيقونات HTML جاهزة للعرض
packages_server = [
    {
        'id': 1,
        'title': 'تصميم المواقع',
        'description': 'تصاميم فريدة وعصرية تعكس هوية علامتك التجارية وتجذب عملاءك بأسلوب احترافي مميز',
        'price': None,
        'delivery_time': '5-7 أيام',
        'features': ['تصميم مخصص','واجهة سهلة الاستخدام','ألوان متناسقة','رسوميات احترافية','تصميم متجاوب'],
        'category': 'design',
        'is_active': True,
        'order': 1,
        'icon_html': '''
<div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
    <Wrench className="w-7 h-7 text-white" />
</div>
'''
    },
    {
        'id': 2,
        'title': 'التسويق الرقمي',
        'description': 'استراتيجيات تسويقية متكاملة لزيادة الوعي بالعلامة التجارية وجلب العملاء وتحسين التحويلات عبر القنوات الرقمية',
        'price': None,
        'delivery_time': 'بدء التنفيذ: خلال 3 أيام',
        'features': ['إدارة الحملات الإعلانية','إنشاء وإدارة المحتوى','تحسين محركات البحث (SEO)','تصميم مواد دعائية','تحليلات وتقارير أداء'],
        'category': 'marketing',
        'is_active': True,
        'order': 2,
        'icon_html': '''
<div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-6">
    <Activity className="w-7 h-7 text-white" />
</div>
'''
    },
    {
        'id': 3,
        'title': 'إدارة المتاجر الإلكترونية',
        'description': 'تشغيل وإدارة متجرك الإلكتروني باحترافية لضمان تجربة شراء رائعة ونمو مستدام في المبيعات',
        'price': None,
        'delivery_time': 'بدء التنفيذ: خلال 2 يوم',
        'features': ['إدارة المنتجات والمخزون','إدارة الطلبات والشحن','إدارة العروض والكوبونات','تكامل بوابات الدفع والدعم','تقارير ومؤشرات أداء'],
        'category': 'ecommerce',
        'is_active': True,
        'order': 3,
        'icon_html': '''
<div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6">
    <Smartphone className="w-7 h-7 text-white" />
</div>
'''
    },
    {
        'id': 4,
        'title': 'تطوير المواقع',
        'description': 'مواقع سريعة وآمنة مطورة بأحدث التقنيات لضمان الأداء الأمثل والموثوقية العالية',
        'price': None,
        'delivery_time': '10-14 يوم',
        'features': ['كود نظيف ومنظم','أداء فائق السرعة','حماية عالية المستوى','تحسين محركات البحث','نظام إدارة محتوى'],
        'category': 'web_dev',
        'is_active': True,
        'order': 4,
        'icon_html': '''
<div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6">
    <Code className="w-7 h-7 text-white" />
</div>
'''
    },
    {
        'id': 5,
        'title': 'التصميم التجاوبي',
        'description': 'مواقع تعمل بشكل مثالي على جميع الأجهزة من الجوال إلى الحاسوب المكتبي مع تجربة موحدة',
        'price': None,
        'delivery_time': '3-5 أيام',
        'features': ['متوافق مع الجوال','تجربة موحدة','سرعة تحميل عالية','سهولة التنقل','تحسين للشاشات المختلفة'],
        'category': 'design',
        'is_active': True,
        'order': 5,
        'icon_html': '''
<div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6">
    <Smartphone className="w-7 h-7 text-white" />
</div>
'''
    },
    {
        'id': 6,
        'title': 'تحسين الأداء',
        'description': 'تحسين سرعة الموقع وأدائه لضمان تجربة مستخدم ممتازة ومعدلات تحويل أعلى',
        'price': None,
        'delivery_time': '2-3 أيام',
        'features': ['ضغط الصور والملفات','تحسين الكود','ذاكرة التخزين المؤقت','تحليل الأداء المفصل','تقارير شهرية'],
        'category': 'optimization',
        'is_active': True,
        'order': 6,
        'icon_html': '''
<div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
    <Wrench className="w-7 h-7 text-white" />
</div>
'''
    },
    {
        'id': 7,
        'title': 'الدعم والصيانة',
        'description': 'دعم فني مستمر وصيانة دورية لضمان عمل موقعك بأفضل حالاته على مدار الساعة',
        'price': None,
        'delivery_time': 'فوري',
        'features': ['دعم فني 24/7','تحديثات دورية','إصلاح الأخطاء فوراً','تحسينات مستمرة','تقارير شهرية'],
        'category': 'support',
        'is_active': True,
        'order': 7,
        'icon_html': '''
<div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-6">
    <Activity className="w-7 h-7 text-white" />
</div>
'''
    }
]

# إدخال البيانات في قاعدة البيانات
for pkg in packages_server:
    cursor.execute('''
        INSERT INTO packages_server (
            id, title, description, price, delivery_time, features, category, is_active, display_order, icon_html
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        pkg['id'],
        pkg['title'],
        pkg['description'],
        pkg['price'],
        pkg['delivery_time'],
        json.dumps(pkg['features'], ensure_ascii=False),
        pkg['category'],
        int(pkg['is_active']),
        pkg['order'],
        pkg['icon_html']
    ))

conn.commit()
conn.close()

print("✅ تم إنشاء جدول الباقات وإدخال البيانات بنجاح.")
