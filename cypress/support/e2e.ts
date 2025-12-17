// ملف الدعم الرئيسي لـ Cypress
// يمكنك إضافة أوامر مخصصة (Custom Commands) هنا

// مثال: منع توقف الاختبار عند حدوث أخطاء غير مؤثرة في التطبيق
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false;
});
