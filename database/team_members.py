import sqlite3
import json

# فتح أو إنشاء قاعدة البيانات
conn = sqlite3.connect('../projects.db')
cursor = conn.cursor()

# إنشاء جدول الفريق
cursor.execute('''
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    bio TEXT,
    email TEXT,
    phone TEXT,
    linkedin TEXT,
    image TEXT,
    experience TEXT,
    specialty TEXT,
    achievements TEXT,  -- JSON string
    skills TEXT,        -- JSON string
    isActive INTEGER,
    "order" INTEGER,
    joinDate TEXT
)
''')

# البيانات (منسقة ومطابقة لما أرسلته حرفياً)
team_members = [
  

{
    "id": "1",
    "name": "عبدالله أبوالغيث",
    "position": "مدير التسويق الرقمي والمنصات",
    "department": "التسويق وإدارة المتاجر الإلكترونية",
    "bio": "عبدالله أبوالغيث متخصص في قيادة استراتيجيات النمو الرقمي والتسويق الإلكتروني للمنصات والمتاجر. بخبرة تزيد عن 6 سنوات، يضمن تحقيق أداء متميز وزيادة الحصة السوقية عبر إدارة الحملات، تحسين الأداء، وتحليل النتائج بفعالية.",
    "email": "abdullah@example.com",
    "phone": "+966500000000",
    "linkedin": "https://www.linkedin.com/in/abdullah-abualgheith",
    "image": "/uploads/1.jpg",
    "experience": "6 سنوات",
    "specialty": "استراتيجيات التسويق الرقمي، إدارة الحملات والمنصات، التحول الرقمي للعلامات التجارية",
    "skills": [
      "تصميم وتنفيذ استراتيجيات تسويق رقمي متكاملة",
      "تحليل بيانات الحملات وتحويلها لخطط تحسين فعّالة",
      "إدارة فرق العمل ومنصات الإعلانات بكفاءة"
    ],
    "achievements": [
      "إطلاق حملات رقمية ناجحة رفعت معدلات التفاعل بشكل ملحوظ",
      "بناء وإدارة متاجر إلكترونية حققت نموًا مستدامًا",
      "زيادة الحضور الرقمي وتحقيق نتائج ملموسة للعلامات التجارية"
    ],
    "isActive": True,
    "order": 1,
    "joinDate": "2023-01-01"
  },
  {
    "id": "2",
    "name": "أحمد العُمري",
    "position": "مهندس حلول الأنظمة المتكاملة",
    "department": "تطوير المواقع والأنظمة المتكاملة",
    "bio": "أحمد العُمري مهندس حلول الأنظمة المتكاملة بخبرة 5 سنوات، متخصص في تحويل العمليات المعقدة إلى أنظمة متكاملة تعمل بسلاسة. يضمن تطوير حلول تقنية مبتكرة وتحسين سير العمل وإدارة فرق التطوير بكفاءة عالية لتلبية جميع احتياجات المنصة والعملاء.",
    "email": "ahmedhamoodaliqayed@gmail.com",
    "phone": "+966562428504",
    "linkedin": "https://www.linkedin.com/in/ahmed-alomari",
    "github": "https://github.com/coderAhmedHamood",
    "image": "/uploads/3.jpeg",
    "experience": "5 سنوات",
    "specialty": "تطوير أنظمة متكاملة، أتمتة العمليات، إدارة فرق التطوير، تقديم حلول تقنية مبتكرة",
    "achievements": [
      "تصميم وتطوير أنظمة متكاملة تلبي احتياجات العملاء",
      "تحسين سير العمل وزيادة كفاءة العمليات",
      "الربط والتكامل بسلاسة مع الأنظمة والخدمات الخارجية"
    ],
    "skills": [
      "تصميم وتطوير أنظمة متكاملة",
      "إدارة فرق التطوير والمشاريع التقنية",
      "تحليل المتطلبات وتحويلها إلى حلول عملية"
    ],
    "isActive": True,
    "order": 2,
    "joinDate": "2021-01-01"
  },
  {
    "id": "3",
    "name": "أصيل الجهلاني",
    "position": "مهندس برمجيات  ",
    "department": "تطوير أنظمة ERP وحلول SaaS والتجارة الإلكترونية",
    "bio": "أصيل الجهلاني مهندس برمجيات بخبرة واسعة في تطوير أنظمة ERP وحلول SaaS والتجارة الإلكترونية، متخصص في بناء منصات متكاملة وسلسة التشغيل. يركز على تحسين تجربة المستخدم، أتمتة العمليات، وإدارة فرق التطوير لضمان تقديم حلول برمجية عالية الجودة ومتوافقة مع احتياجات العملاء.",
    "phone": "+967715811982",
    "linkedin": "https://www.linkedin.com/in/aseel-al-gahlani",
    "github": "https://github.com/Aseel-Al-Gahlani",
    "email": "aseelalgahlani982@gmail.com",
    "image": "/uploads/assil.jpg",
    "experience": "6 سنوات",
    "specialty": "تطوير أنظمة ERP وحلول SaaS، تصميم قواعد البيانات، إدارة فرق التطوير، الربط والتكامل مع الأنظمة والخدمات الخارجية",
    "achievements": [
      "تطوير أنظمة ERP وربطها بالمنصات الإلكترونية وأتمتة العمليات",
      "إنشاء أنظمة SaaS لإدارة المتاجر الإلكترونية والعملاء والمدفوعات والشحن",
      "تطوير تطبيقات ذكية متكاملة",
      "الربط والتكامل مع الأنظمة والخدمات الخارجية بسلاسة"
    ],
    "skills": [
      "تحليل الأنظمة وتصميم قواعد البيانات",
      "هندسة البرمجيات وتطوير الأنظمة المتكاملة",
      "تكامل الأنظمة مع خدمات الطرف الثالث",
      "القيادة وإدارة فرق التطوير"
    ],
    "isActive": True,
    "order": 3,
    "joinDate": ""
  }


 
]


# إدخال البيانات إلى الجدول
for member in team_members:
    cursor.execute('''
    INSERT OR REPLACE INTO team_members (
        id, name, position, department, bio, email, phone, linkedin,
        image, experience, specialty, achievements, skills,
        isActive, "order", joinDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        member['id'],
        member['name'],
        member['position'],
        member['department'],
        member['bio'],
        member['email'],
        member['phone'],
        member['linkedin'],
        member['image'],
        member['experience'],
        member['specialty'],
        json.dumps(member['achievements'], ensure_ascii=False),
        json.dumps(member['skills'], ensure_ascii=False),
        int(member['isActive']),
        member['order'],
        member['joinDate']
    ))

conn.commit()
conn.close()

print("✅ تم إنشاء جدول الفريق وإدخال البيانات بنجاح.")
