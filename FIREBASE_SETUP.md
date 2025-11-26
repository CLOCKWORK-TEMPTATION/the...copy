# Firebase Setup Guide

## ✅ تم التثبيت

### الملفات المُنشأة:

1. **`frontend/src/lib/firebase.ts`** - Firebase initialization
2. **`frontend/src/lib/firebase/auth.ts`** - Authentication helpers
3. **`frontend/src/lib/firebase/firestore.ts`** - Firestore helpers
4. **`frontend/src/lib/firebase/index.ts`** - Exports
5. **`frontend/src/hooks/useAuth.ts`** - Auth hook
6. **`frontend/src/app/(auth)/login/page.tsx`** - Login page
7. **`frontend/src/app/(auth)/register/page.tsx`** - Register page
8. **`frontend/firestore.rules`** - Security rules

## 🚀 الاستخدام

### Authentication

```typescript
import { loginUser, registerUser, logoutUser } from "@/lib/firebase";

// تسجيل دخول
await loginUser("user@example.com", "password");

// إنشاء حساب
await registerUser("user@example.com", "password");

// تسجيل خروج
await logoutUser();
```

### Auth Hook

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome {user.email}</div>;
}
```

### Firestore

```typescript
import { addDocument, getDocument, getDocuments, where, orderBy } from "@/lib/firebase";

// إضافة مستند
await addDocument("projects", { name: "مشروع جديد", userId: user.uid });

// قراءة مستند
const doc = await getDocument("projects", "project-id");

// قراءة مستندات مع فلترة
const docs = await getDocuments("projects", 
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc")
);
```

## 🔒 Security Rules

نشر Security Rules:

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل دخول
firebase login

# تهيئة المشروع
firebase init firestore

# نشر Rules
firebase deploy --only firestore:rules
```

## 📝 الصفحات

- `/login` - تسجيل الدخول
- `/register` - إنشاء حساب

## ⚙️ Environment Variables

تأكد من وجود المتغيرات في `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```
