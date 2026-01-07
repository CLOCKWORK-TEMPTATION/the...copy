#!/bin/bash

# سكريبت تحليل الملفات غير المستخدمة
# Unused Code Analysis Script

echo "🔍 بدء تحليل الكود غير المستخدم..."
echo "========================================"

# الانتقال إلى المجلد الرئيسي
cd "$(dirname "$0")/../.."

# التحقق من تثبيت الأدوات
echo ""
echo "📦 التحقق من الأدوات المطلوبة..."

check_tool() {
    if pnpm list "$1" --depth=0 2>/dev/null | grep -q "$1"; then
        echo "  ✅ $1 مثبت"
        return 0
    else
        echo "  ❌ $1 غير مثبت"
        return 1
    fi
}

TOOLS_INSTALLED=true

cd frontend
check_tool "knip" || TOOLS_INSTALLED=false
check_tool "dependency-cruiser" || TOOLS_INSTALLED=false
check_tool "depcheck" || TOOLS_INSTALLED=false
cd ..

if [ "$TOOLS_INSTALLED" = false ]; then
    echo ""
    echo "⚠️ بعض الأدوات غير مثبتة. جاري التثبيت..."
    cd frontend && pnpm add -D knip dependency-cruiser depcheck ts-prune && cd ..
fi

echo ""
echo "========================================"
echo "🔍 تشغيل التحليل..."
echo "========================================"

# تشغيل knip على frontend
echo ""
echo "📦 تحليل Frontend بـ Knip..."
cd frontend
pnpm knip || true
cd ..

# تشغيل knip على backend
echo ""
echo "📦 تحليل Backend بـ Knip..."
cd backend
pnpm knip || true
cd ..

# تشغيل dependency-cruiser
echo ""
echo "🔗 تحليل الاعتماديات بـ dependency-cruiser..."
npx depcruise --config .dependency-cruiser.json --output-type err \
    frontend/src backend/src 2>&1 | head -50 || true

# تشغيل depcheck على frontend
echo ""
echo "📦 تحليل اعتماديات Frontend بـ depcheck..."
cd frontend
pnpm depcheck || true
cd ..

# تشغيل depcheck على backend
echo ""
echo "📦 تحليل اعتماديات Backend بـ depcheck..."
cd backend
pnpm depcheck || true
cd ..

echo ""
echo "========================================"
echo "✅ انتهى التحليل!"
echo "========================================"
