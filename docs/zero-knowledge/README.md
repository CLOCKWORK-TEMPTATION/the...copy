# Zero-Knowledge Platform Implementation - ملخص التنفيذ

## 🎯 الهدف

تحويل منصة **النسخة** إلى منصة كتابة سيناريو **Zero-Knowledge** حيث:
- لا يمكن للسيرفر قراءة المحتوى
- التشفير من طرف إلى طرف
- BYO-API (Bring Your Own API)

---

## ✅ ما تم إنجازه

### 1. مكتبة التشفير الأساسية (Crypto Core)

**الموقع:** `frontend/src/lib/crypto/`

**الملفات:**
- `core.ts` - الدوال الأساسية للتشفير
- `keyManager.ts` - إدارة المفاتيح في الذاكرة
- `byoapi.ts` - خدمة BYO-API
- `index.ts` - التصدير الرئيسي

**الميزات:**
✅ PBKDF2 لاشتقاق المفاتيح (600,000 دورة)  
✅ AES-GCM 256-bit للتشفير  
✅ Key Wrapping/Unwrapping  
✅ AAD للحماية من التلاعب  
✅ توليد Recovery Key  
✅ Base64 encoding/decoding  

### 2. قاعدة البيانات (Database Schema)

**التحديثات:**

**`backend/src/db/schema.ts`** - جدول Users:
```typescript
authVerifierHash: text('auth_verifier_hash')  // للمصادقة ZK
kdfSalt: text('kdf_salt')                     // لاشتقاق المفاتيح
publicKey: text('public_key')                 // للمشاركة (مستقبلاً)
lastLogin: timestamp('last_login')
accountStatus: varchar('account_status')
```

**`backend/src/db/zkSchema.ts`** - جداول جديدة:
- `encrypted_documents` - المستندات المشفرة
- `recovery_artifacts` - مواد الاسترداد
- `shared_keys` - المشاركة (مستقبلاً)

### 3. Backend Controllers & Routes

**Controllers:**
- `backend/src/controllers/zkAuth.controller.ts`
  - zkSignup
  - zkLoginInit
  - zkLoginVerify
  - manageRecoveryArtifact

- `backend/src/controllers/encryptedDocs.controller.ts`
  - createEncryptedDocument
  - getEncryptedDocument
  - updateEncryptedDocument
  - deleteEncryptedDocument
  - listEncryptedDocuments

**Routes في `backend/src/server.ts`:**
```typescript
// ZK Authentication
POST /api/auth/zk-signup
POST /api/auth/zk-login-init
POST /api/auth/zk-login-verify
POST /api/auth/recovery

// Encrypted Documents
POST /api/docs
GET  /api/docs/:id
PUT  /api/docs/:id
DELETE /api/docs/:id
GET  /api/docs
```

### 4. Frontend Components

**`frontend/src/components/auth/`:**
- `ZKSignupForm.tsx` - نموذج التسجيل
- `ZKLoginForm.tsx` - نموذج تسجيل الدخول
- `BYOAPISettings.tsx` - إعدادات BYO-API

**الميزات:**
✅ التسجيل مع توليد Recovery Key  
✅ تسجيل الدخول على مرحلتين  
✅ إدارة مفاتيح API محلياً  
✅ اختبار الاتصال بمزودي API  

### 5. Documentation

**`docs/zero-knowledge/`:**
- `SECURITY_PRIVACY_AR.md` - الأمان والخصوصية (عربي)
- `CONFLICT_OF_INTEREST_AR.md` - سياسة تضارب المصالح (عربي)
- `SUSTAINABILITY_AR.md` - نموذج الاستدامة (عربي)
- `TECHNICAL_ARCHITECTURE.md` - الدليل التقني (إنجليزي)

---

## 🏗️ المعمارية

### تدفق التسجيل (Signup)

```
1. User enters password
   ↓
2. Generate kdfSalt (random)
   ↓
3. Derive authVerifier ──→ Send to server (hashed)
   ↓
4. Derive KEK ──→ Stays in memory (NEVER sent)
   ↓
5. Generate Recovery Key ──→ Show once to user
   ↓
6. Server stores: authVerifierHash, kdfSalt
```

### تدفق الحفظ (Save Document)

```
1. Generate random DEK
   ↓
2. Encrypt content with DEK
   ↓
3. Wrap DEK with KEK
   ↓
4. Send to server:
   - ciphertext (encrypted content)
   - iv
   - wrappedDEK
   - wrappedDEKiv
   ↓
5. Server stores encrypted blob
```

### تدفق التحميل (Load Document)

```
1. Get encrypted bundle from server
   ↓
2. Unwrap DEK with KEK
   ↓
3. Decrypt content with DEK
   ↓
4. Display plaintext (client-side only)
```

---

## 🔐 الأمان

### Algorithms Used

| Component | Algorithm | Parameters |
|-----------|-----------|------------|
| KDF | PBKDF2-SHA256 | 600,000 iterations |
| Encryption | AES-GCM | 256-bit key, 96-bit IV |
| Auth | bcrypt | 10 salt rounds |

### AAD Format

```
userId:docId:version
```

يمنع:
- Document swapping
- Replay attacks
- Cross-user decryption

---

## 📋 الخطوات التالية

### مطلوب للإكمال

1. **دمج المحرر**
   - [ ] تشفير المحتوى قبل الحفظ
   - [ ] فك التشفير عند التحميل
   - [ ] معالجة الأخطاء

2. **البحث المحلي**
   - [ ] بناء فهرس في IndexedDB
   - [ ] تنفيذ البحث client-side فقط

3. **الاختبارات**
   - [ ] Unit tests للتشفير
   - [ ] Integration tests للـ API
   - [ ] E2E tests للتدفقات الكاملة

4. **تحديثات الأمان**
   - [ ] تطبيق CSP صارمة
   - [ ] تحديث سياسات Logging
   - [ ] منع التسريب في Analytics

5. **Migration**
   - [ ] نقل البيانات الحالية
   - [ ] دعم النسخة القديمة مؤقتاً

---

## 🚀 كيفية الاستخدام

### التطوير

```bash
# Frontend
cd frontend
pnpm install
pnpm dev  # Port 5000

# Backend
cd backend
pnpm install
pnpm db:push  # Apply schema
pnpm dev      # Port 3000
```

### البناء

```bash
# Frontend
cd frontend
pnpm build

# Backend
cd backend
pnpm build
```

### الاختبار

```bash
# Crypto tests
cd frontend
pnpm test src/lib/crypto

# Backend tests
cd backend
pnpm test
```

---

## 📚 الوثائق

### للمستخدمين

- [الأمان والخصوصية](./docs/zero-knowledge/SECURITY_PRIVACY_AR.md)
- [سياسة تضارب المصالح](./docs/zero-knowledge/CONFLICT_OF_INTEREST_AR.md)
- [الاستدامة](./docs/zero-knowledge/SUSTAINABILITY_AR.md)

### للمطورين

- [Technical Architecture](./docs/zero-knowledge/TECHNICAL_ARCHITECTURE.md)
- [API Documentation](#api-endpoints)
- [Crypto Core Reference](./frontend/src/lib/crypto/)

---

## ⚠️ ملاحظات مهمة

### للمستخدمين

1. **كلمة المرور حرجة:**  
   فقدانها = فقدان الوصول للبيانات

2. **Recovery Key:**  
   يُعرض مرة واحدة فقط عند التسجيل

3. **لا استرداد:**  
   نحن لا نستطيع مساعدتك إذا فقدت كلمة المرور ومفتاح الاسترداد

### للمطورين

1. **KEK لا يغادر العميل:**  
   أي كود يرسل KEK إلى السيرفر هو خطأ أمني

2. **التحقق من التشفير:**  
   السيرفر يجب أن يرفض أي payload غير مشفر

3. **BYO-API:**  
   لا proxy على الإطلاق - الاتصال مباشر من المتصفح

---

## 🤝 المساهمة

### الأولويات

1. **الأمان أولاً:** أي تعديل يجب أن يحافظ على مبادئ ZK
2. **الاختبارات:** كل ميزة جديدة تحتاج tests
3. **التوثيق:** تحديث الدليل عند أي تغيير

### Code Review

يُفضل مراجعة أي PR يمس:
- مكتبة التشفير
- نظام المصادقة
- تخزين المفاتيح

---

## 📞 الدعم

- **الأسئلة:** افتح Issue في GitHub
- **الأخطاء الأمنية:** أرسل بريد خاص (لا تنشر علناً)
- **المساهمات:** Pull Requests مرحب بها

---

## 📄 الترخيص

[راجع LICENSE في المستودع]

---

<p dir="rtl" style="text-align: center; margin-top: 40px;">
<strong>النسخة</strong> - منصة كتابة سيناريو Zero-Knowledge<br>
خصوصيتك ليست منحة، بل حق مضمون تقنياً.
</p>

---

**آخر تحديث:** 2026-02-13  
**الإصدار:** 1.0.0-zk-alpha
