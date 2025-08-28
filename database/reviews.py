import sqlite3

# الاتصال أو إنشاء قاعدة البيانات
conn = sqlite3.connect('projects.db')
cursor = conn.cursor()

# حذف الجدول إذا كان موجودًا مسبقًا (اختياري لإعادة التشغيل)
cursor.execute("DROP TABLE IF EXISTS reviews")


# إنشاء الجدول
cursor.execute('''
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    name TEXT,
    position TEXT,
    department TEXT,
    bio TEXT,
    email TEXT,
    phone TEXT,
    linkedin TEXT,
    image TEXT,
    experience TEXT,
    specialty TEXT,
    achievements TEXT,
    skills TEXT,
    isActive INTEGER,
    ordering INTEGER,
    joinDate TEXT
)
''')

# البيانات المضافة مع النصوص الكاملة في حقل bio
reviews_data = [
    {
        'id': '1',
        'name': 'د. عبدالله المحمود',
        'position': 'الرئيس التنفيذى',
        'department': 'مجموعة التطوير الملكي',
        'bio': 'تجاوزت شركة أوج الدولية توقعاتنا في كل جانب من جوانب مشروع برج الرياض التجاري. اهتمامهم بالتفاصيل والتسليم في الوقت المحدد والجودة الاستثنائية جعلتهم شريكنا المفضل في البناء. تم إنجاز المشروع قبل الموعد المحدد بأسبوعين!',
        'email': 'a.almahmoud@royaldev.sa',
        'phone': '+966112345678',
        'linkedin': 'https://linkedin.com/in/abdullah-almahmoud',
        'image': 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
        'experience': '36 شهراً',
        'specialty': 'برج الرياض التجاري (85 مليون دولار)',
        'achievements': 'إنجاز المشروع قبل الموعد المحدد بأسبوعين, قاد مشروع برج الرياض التجاري',
        'skills': 'القيادة الاستراتيجية, إدارة المشاريع الكبرى, التطوير العقاري',
        'isActive': 1,
        'ordering': 1,
        'joinDate': '2024-02-13'
    },
    {
        'id': '2',
        'name': 'م. فاطمة الزهراء',
        'position': 'مديرة المشاريع',
        'department': 'شركة النور العقارية',
        'bio': 'أظهر فريق شركة أوج الدولية مهنية وخبرة لا مثيل لها طوال مشروع مجمعنا السكني. حلولهم المبتكرة والتزامهم بالاستدامة يتماشى تماماً مع رؤيتنا للمعيشة الحديثة في المملكة العربية السعودية.',
        'email': 'f.alzahraa@alnoor.sa',
        'phone': '+966118765432',
        'linkedin': 'https://linkedin.com/in/fatima-alzahraa',
        'image': 'https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&cs=tinysrgb&w=400',
        'experience': '24 شهراً',
        'specialty': 'مجمع النور السكني (45 مليون دولار)',
        'achievements': 'إدارة مشروع مجمع النور السكني, تطبيق حلول مبتكرة ومستدامة',
        'skills': 'إدارة المشاريع, الاستدامة, التطوير السكني',
        'isActive': 1,
        'ordering': 2,
        'joinDate': '2023-11-28'
    },
    {
        'id': '3',
        'name': 'محمد الراشد',
        'position': 'مدير العمليات',
        'department': 'التنمية الصناعية السعودية',
        'bio': 'خبرة شركة أوج الدولية في البناء الصناعي رائعة. نجحوا في تسليم مرفق التصنيع الخاص بنا مع بنية تحتية متطورة تدعم أهداف رؤية 2030.',
        'email': 'm.alrashed@sid.sa',
        'phone': '+966119876543',
        'linkedin': 'https://linkedin.com/in/mohammed-alrashed',
        'image': 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
        'experience': '18 شهراً',
        'specialty': 'المدينة الصناعية - المرحلة الأولى (120 مليون دولار)',
        'achievements': 'تسليم مرفق تصنيع ببنية تحتية متطورة, دعم أهداف رؤية 2030',
        'skills': 'إدارة العمليات, البناء الصناعي, إدارة المشاريع التقنية',
        'isActive': 1,
        'ordering': 3,
        'joinDate': '2023-12-10'
    },
    {
        'id': '4',
        'name': 'سارة المنصوري',
        'position': 'مديرة التطوير',
        'department': 'تطوير الوادي الأخضر',
        'bio': 'العمل مع شركة أوج الدولية في مول الوادي الأخضر كان تجربة استثنائية. إبداع فريقهم وخبرتهم التقنية والتزامهم بالجودة أدى إلى وجهة تسوق عالمية المستوى تجاوزت كل توقعاتنا.',
        'email': 's.almansouri@greenvalley.sa',
        'phone': '+966115432198',
        'linkedin': 'https://linkedin.com/in/sara-almansouri',
        'image': 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400',
        'experience': '30 شهراً',
        'specialty': 'مول الوادي الأخضر (65 مليون دولار)',
        'achievements': 'تطوير وجهة تسوق عالمية المستوى, تحقيق جودة عالية وتجاوز التوقعات',
        'skills': 'التطوير التجاري, إدارة المشاريع العقارية, الإبداع والابتكار',
        'isActive': 1,
        'ordering': 4,
        'joinDate': '2023-10-20'
    }
]

# إدخال البيانات في الجدول
for item in reviews_data:
    cursor.execute('''
    INSERT OR IGNORE INTO reviews (
        id, name, position, department, bio, email, phone,
        linkedin, image, experience, specialty, achievements,
        skills, isActive, ordering, joinDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        item['id'], item['name'], item['position'], item['department'],
        item['bio'], item['email'], item['phone'], item['linkedin'],
        item['image'], item['experience'], item['specialty'],
        item['achievements'], item['skills'], item['isActive'],
        item['ordering'], item['joinDate']
    ))

print("✅ تمت إضافة جميع البيانات بنجاح.")
conn.commit()
conn.close()
