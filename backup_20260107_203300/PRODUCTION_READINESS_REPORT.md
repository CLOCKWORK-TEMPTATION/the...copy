أنت خبير في تقييم جاهزية التطبيقات للإنتاج. ستقوم بكتابة تقرير جاهزية الإنتاج (تقرير جاهزية الإنتاج) لتطبيق ويب تفاعلي. هذا التقرير يجب أن يكون مكتوباً بالكامل باللغة العربية ويجب أن يقيّم ما إذا كان التطبيق جاهزاً للنشر في بيئة إنتاجية.

معلومات التطبيق:

التطبيق هو مستودع GitHub:
- المالك: ${owner}
- اسم المستودع: ${repo}
- اللغات: ${analysisData.languages.join(', ') || 'غير محددة'}
- يحتوي على package.json: ${analysisData.hasPackageJson ? 'نعم' : 'لا'}
- يحتوي على requirements.txt: ${analysisData.hasRequirementsTxt ? 'نعم' : 'لا'}
- يحتوي على pyproject.toml: ${analysisData.hasPyprojectToml ? 'نعم' : 'لا'}
- يحتوي على Dockerfile: ${analysisData.hasDockerfile ? 'نعم' : 'لا'}
- يحتوي على اختبارات: ${analysisData.hasTests ? 'نعم' : 'لا'}
- يحتوي على CI/CD: ${analysisData.hasCI ? 'نعم' : 'لا'}
- يحتوي على README: ${analysisData.hasReadme ? 'نعم' : 'لا'}
- يحتوي على .gitignore: ${analysisData.hasGitignore ? 'نعم' : 'لا'}
- الملفات الموجودة: ${analysisData.fileStructure.join(', ')}

${analysisData.packageJsonContent ? `محتوى package.json:\n${analysisData.packageJsonContent.substring(0, 2000)}` : ''}
${analysisData.readmeContent ? `محتوى README:\n${analysisData.readmeContent.substring(0, 2000)}` : ''}
${analysisData.requirementsContent ? `محتوى requirements.txt:\n${analysisData.requirementsContent.substring(0, 1000)}` : ''}

تقرير جاهزية الإنتاج الشامل يجب أن يقيّم المجالات الرئيسية التالية:

1. **الوظائف الأساسية (Core Functionality)**: هل جميع الميزات الأساسية تعمل كما هو متوقع؟
2. **الأداء (Performance)**: هل يلبي التطبيق متطلبات الأداء (أوقات التحميل، أوقات الاستجابة، قابلية التوسع)؟
3. **الأمان (Security)**: هل تم تطبيق أفضل الممارسات الأمنية (المصادقة، التفويض، حماية البيانات، اختبار الثغرات)؟
4. **البنية التحتية (Infrastructure)**: هل بيئة الاستضافة مهيأة بشكل صحيح وموثوقة؟
5. **المراقبة والسجلات (Monitoring & Logging)**: هل أنظمة المراقبة والتسجيل موجودة؟
6. **النسخ الاحتياطي والاستعادة (Backup & Recovery)**: هل إجراءات النسخ الاحتياطي والاستعادة من الكوارث محددة؟
7. **التوثيق (Documentation)**: هل التوثيق التقني وتوثيق المستخدم مكتمل؟
8. **الاختبار (Testing)**: هل تم إكمال جميع الاختبارات الضرورية (اختبارات الوحدة، اختبارات التكامل، اختبارات قبول المستخدم، اختبارات الحمل)؟
9. **التوافق (Compatibility)**: هل يعمل التطبيق عبر المتصفحات والأجهزة المطلوبة؟
10. **الامتثال (Compliance)**: هل يلبي التطبيق المتطلبات التنظيمية والقانونية ذات الصلة؟

قبل كتابة تقريرك، استخدم قسم التحليل الأولي لـ:
- تحليل تفاصيل التطبيق المقدمة
- تحديد المعلومات المتوفرة وما قد يكون مفقوداً
- ملاحظة أي نقاط قوة أو مخاوف في كل مجال تقييم
- تحديد تقييم الجاهزية الإجمالي

ثم، اكتب تقرير جاهزية الإنتاج باللغة العربية مع الهيكل التالي:

- **العنوان (Title)**: تقرير جاهزية الإنتاج
- **نظرة عامة (Overview)**: ملخص موجز للتطبيق والغرض من التقرير
- **تقييم المجالات الرئيسية (Assessment of Key Areas)**: قيّم كل مجال ذي صلة مذكور أعلاه، مع ملاحظة الحالة ونقاط القوة والمخاوف
- **المشاكل والمخاطر (Issues & Risks)**: اذكر أي مشاكل حرجة أو مخاطر تحتاج إلى معالجة
- **التوصيات (Recommendations)**: قدم توصيات محددة لمعالجة أي فجوات
- **الخلاصة (Conclusion)**: تقييم الجاهزية الإجمالي مع توصية واضحة (جاهز للإنتاج / جاهز بشروط / غير جاهز)

تقريرك يجب أن يكون محترفاً، شاملاً، وقابلاً للتنفيذ. إذا لم يتم توفير معلومات معينة في تفاصيل التطبيق، لاحظ المعلومات الإضافية التي ستكون مطلوبة لتقييم كامل.

يجب أن يكون الرد بصيغة JSON التالية بالضبط (يجب أن يكون كل النص باللغة العربية):
{
  "summary": "نظرة عامة: ملخص موجز للتطبيق والغرض من التقرير",
  "overallStatus": "ready أو conditional أو not-ready",
  "domains": [
    {
      "title": "الوظائف الأساسية",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2", "ملاحظة 3"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "الأداء",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "الأمان",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "البنية التحتية",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "المراقبة والسجلات",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "النسخ الاحتياطي والاستعادة",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "التوثيق",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "الاختبار",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "التوافق",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    },
    {
      "title": "الامتثال",
      "status": "ready أو conditional أو not-ready أو unknown",
      "description": "تقييم للحالة مع ذكر نقاط القوة والمخاوف",
      "findings": ["ملاحظة 1", "ملاحظة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    }
  ],
  "criticalIssues": ["مشكلة حرجة 1 تحتاج إلى معالجة", "مشكلة حرجة 2"],
  "recommendations": ["توصية عامة محددة 1 لمعالجة الفجوات", "توصية عامة 2"],
  "conclusion": "الخلاصة: تقييم الجاهزية الإجمالي مع توصية واضحة (جاهز للإنتاج / جاهز بشروط / غير جاهز) مع تبرير مفصل"
}

ملاحظة مهمة: يجب أن يتضمن الـ domains جميع المجالات العشرة المذكورة أعلاه بنفس الترتيب.`