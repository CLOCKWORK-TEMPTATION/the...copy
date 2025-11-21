# قائمة التحقق من أمان قاعدة البيانات الإنتاجية
# Production Database Security Checklist

## 📋 قبل النشر في الإنتاج / Pre-Production Deployment

### 1️⃣ إعداد مستخدم قاعدة البيانات (Least Privilege)

**لا تستخدم أبداً حساب superuser في الإنتاج!**

#### إنشاء مستخدم مخصص للتطبيق:

```sql
-- Create dedicated application user
CREATE USER the_copy_app WITH PASSWORD 'STRONG-RANDOM-PASSWORD-HERE';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE your_database_name TO the_copy_app;

-- Grant table permissions (SELECT, INSERT, UPDATE, DELETE only)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO the_copy_app;

-- Grant sequence permissions (required for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO the_copy_app;

-- Grant permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO the_copy_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO the_copy_app;

-- DO NOT GRANT: CREATE, DROP, TRUNCATE, ALTER, or SUPERUSER privileges
```

### 2️⃣ أمان الشبكة / Network Security

#### ✅ إعدادات جدار الحماية (Firewall):
- السماح فقط لعناوين IP الخاصة بخوادم التطبيق
- رفض جميع الوصول الآخر
- استخدام VPC/شبكة خاصة عندما يكون ممكناً

#### ✅ تشفير SSL/TLS:
```bash
# Ensure DATABASE_URL uses SSL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

#### ✅ مستويات SSL المدعومة:
- **Production**: `sslmode=require` أو `sslmode=verify-full`
- **Staging**: `sslmode=require`
- **Development**: `sslmode=prefer` (مقبول للتطوير المحلي فقط)

### 3️⃣ إعدادات Connection Pool

الإعدادات الحالية في `backend/src/db/index.ts`:

```typescript
const poolConfig = {
  max: 20,                      // Maximum connections
  idleTimeoutMillis: 30000,     // 30 seconds
  connectionTimeoutMillis: 10000 // 10 seconds
};
```

#### توصيات حسب حجم التطبيق:

| حجم التطبيق | Max Connections | Idle Timeout | Connection Timeout |
|-------------|-----------------|--------------|-------------------|
| صغير (< 1000 مستخدم/يوم) | 10-20 | 30s | 10s |
| متوسط (1000-10000 مستخدم/يوم) | 20-50 | 60s | 15s |
| كبير (> 10000 مستخدم/يوم) | 50-100 | 120s | 20s |

### 4️⃣ النسخ الاحتياطي والاستعادة / Backup & Recovery

#### ✅ النسخ الاحتياطي الآلي:
```bash
# Enable automated daily backups (example for PostgreSQL)
# Configure in your database provider dashboard or cron job

# Backup command (if self-hosted):
pg_dump -U the_copy_app -h localhost -d your_database > backup_$(date +%Y%m%d).sql

# Restore command:
psql -U the_copy_app -h localhost -d your_database < backup_20250106.sql
```

#### ✅ Point-in-Time Recovery (PITR):
- تفعيل WAL archiving
- الاحتفاظ بـ WAL logs لمدة 7-30 يوماً
- اختبار الاستعادة شهرياً

### 5️⃣ المراقبة والتنبيهات / Monitoring & Alerts

#### ✅ مؤشرات يجب مراقبتها:

1. **Connection Pool Metrics**:
   - عدد الاتصالات النشطة
   - عدد الاتصالات الخاملة
   - الاتصالات المنتظرة

2. **Query Performance**:
   - الاستعلامات البطيئة (> 1 ثانية)
   - الاستعلامات المحظورة (blocked queries)
   - معدل الاستعلامات في الثانية

3. **Database Size**:
   - حجم قاعدة البيانات
   - حجم الجداول الكبيرة
   - معدل النمو

4. **Error Tracking**:
   - أخطاء الاتصال
   - أخطاء الاستعلامات
   - انتهاكات القيود (constraint violations)

#### ✅ إعداد التنبيهات:
```javascript
// Example alert thresholds
{
  "active_connections": 80,      // Alert if > 80% of max connections
  "slow_query_time": 1000,       // Alert if query > 1 second
  "connection_errors": 10,       // Alert if > 10 errors in 5 minutes
  "disk_usage": 85               // Alert if disk > 85% full
}
```

### 6️⃣ أمان البيانات / Data Security

#### ✅ تشفير البيانات الحساسة:
```typescript
// Example: Encrypt sensitive fields before storing
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}
```

#### ✅ حماية من SQL Injection:
- ✅ استخدام Drizzle ORM (يمنع SQL Injection تلقائياً)
- ✅ عدم استخدام raw queries إلا عند الضرورة القصوى
- ✅ استخدام prepared statements دائماً

### 7️⃣ الصيانة الدورية / Regular Maintenance

#### ✅ مهام أسبوعية:
- [ ] مراجعة استعلامات بطيئة
- [ ] فحص استخدام Connection Pool
- [ ] مراجعة سجلات الأخطاء

#### ✅ مهام شهرية:
- [ ] اختبار استعادة النسخ الاحتياطية
- [ ] تحليل أداء الاستعلامات
- [ ] تحديث إحصائيات قاعدة البيانات (ANALYZE)

#### ✅ مهام ربع سنوية:
- [ ] مراجعة صلاحيات المستخدمين
- [ ] تدقيق سجلات الوصول
- [ ] اختبار خطة الاستعادة من الكوارث

## 🔒 قائمة التحقق النهائية / Final Checklist

قبل النشر في الإنتاج، تأكد من:

- [ ] ✅ DATABASE_URL مضبوط في متغيرات البيئة
- [ ] ✅ استخدام مستخدم قاعدة بيانات مخصص (ليس superuser)
- [ ] ✅ تفعيل SSL/TLS للاتصالات
- [ ] ✅ تكوين جدار الحماية لقبول IP محددة فقط
- [ ] ✅ تفعيل النسخ الاحتياطي الآلي
- [ ] ✅ إعداد المراقبة والتنبيهات
- [ ] ✅ اختبار استعادة النسخ الاحتياطية
- [ ] ✅ مراجعة Connection Pool settings
- [ ] ✅ تفعيل query logging للاستعلامات البطيئة

## 📚 موارد إضافية / Additional Resources

- [Drizzle ORM Security Best Practices](https://orm.drizzle.team/docs/security)
- [PostgreSQL Security Checklist](https://www.postgresql.org/docs/current/security.html)
- [OWASP Database Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html)

---

**آخر تحديث / Last Updated**: 2025-01-06
**المسؤول / Maintainer**: The Copy Team
