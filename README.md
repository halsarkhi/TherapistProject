# Therapist Center — مركز أصحاب الهمم للرعاية النهارية

نظام إدارة مركز رعاية نهارية لأصحاب الهمم. واجهة إدارية + بوابة أخصائيين + بوابة أولياء أمور، مع إدارة طلاب وجدول جلسات ورسائل.

## التقنيات

- **Backend**: .NET 10 · Clean Architecture · CQRS (MediatR) · FluentValidation · EF Core · JWT
- **Frontend**: Angular 21 · Standalone Components · Cairo font · RTL/LTR · 11 themes
- **Database**: SQL Server (Code-First migrations)

## هيكل المشروع

```
Web/
├── src/
│   ├── TherapistCenter.Domain/          # Entities, enums, repository interfaces
│   ├── TherapistCenter.Application/     # CQRS + DTOs + validators
│   ├── TherapistCenter.Infrastructure/  # EF Core + Identity + repos
│   └── TherapistCenter.API/             # Controllers, middleware, Program.cs
├── therapist-center-ui/                 # Angular frontend
└── TherapistCenter.sln
```

## تشغيل محلي

### 1. الباكند

```bash
# انسخ ملف الإعدادات
cp src/TherapistCenter.API/appsettings.Example.json src/TherapistCenter.API/appsettings.json

# عدّل ConnectionString و Jwt.Key في appsettings.json

# شغّل
dotnet run --project src/TherapistCenter.API
# الـ API على http://localhost:5078
```

### 2. الفرونت إند

```bash
cd therapist-center-ui
npm install
npm start
# الواجهة على http://localhost:4200
```

## الحساب الافتراضي

عند أول تشغيل يُنشأ حساب أدمن:

- **البريد**: `admin@therapistcenter.com`
- **كلمة المرور**: `Admin@123` (غيّرها فوراً)

## الميزات

- **3 بورتالات**: Admin · Therapist · Parent
- **إدارة الطلاب والكادر** — CRUD كامل
- **جدول الجلسات** — slot picker (45 دقيقة) مع منع التعارضات تلقائياً (أخصائية/طالب/غرفة)
- **نظام الرسائل** بين الأخصائيين وأولياء الأمور
- **11 ثيم** قابلة للتبديل
- **RTL/LTR** كامل (عربي/إنجليزي)

## الأمان

- JWT + ASP.NET Identity (أدوار Admin / Therapist / Parent)
- `appsettings.json` مُستثنى من Git — استخدم `appsettings.Example.json` كمرجع
