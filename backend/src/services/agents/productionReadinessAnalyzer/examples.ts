/**
 * Example: Using ProductionReadinessAnalyzerAgent
 * 
 * This example demonstrates how to use the Production Readiness Analyzer
 * to generate a comprehensive readiness report in Arabic.
 */

import { productionReadinessAnalyzerAgent } from './ProductionReadinessAnalyzerAgent';

async function exampleBasicUsage() {
  console.log('=== Example 1: Basic Production Readiness Report ===\n');

  const result = await productionReadinessAnalyzerAgent.executeTask({
    input: `
      مصنع الإلكترونيات - تقرير الحالة الشهري:
      
      المعدات والآلات:
      - 12 خط إنتاج آلي حديث (جميعها عاملة)
      - 2 خطوط تحت الصيانة الوقائية
      - معدل توفر المعدات: 85%
      - آخر صيانة شاملة: منذ 3 أسابيع
      
      الموارد البشرية:
      - 150 عامل إنتاج (جميعهم مدربون)
      - 25 فني صيانة
      - 15 مشرف إنتاج
      - نقص في الفنيين المتخصصين: 10 وظائف شاغرة
      - معدل الحضور: 95%
      
      المواد الخام والمخزون:
      - مكونات إلكترونية: مخزون كافٍ لـ 3 أسابيع
      - مواد التعبئة: مخزون شهرين
      - قطع الغيار: متوفرة بكميات جيدة
      - سلسلة التوريد: مستقرة
      
      الجودة والسلامة:
      - معتمد ISO 9001:2015
      - معدل العيوب: 1.5% (أقل من المستهدف 2%)
      - لا حوادث عمل خطيرة خلال الشهر
      - آخر تفتيش سلامة: منذ شهرين (ناجح)
      
      البنية التحتية:
      - المبنى: حديث، بحالة ممتازة
      - الكهرباء: مولدات احتياطية متوفرة
      - نظام التكييف: يعمل بكفاءة
      - شبكة الإنترنت: مستقرة بسرعة 100 ميجابت
    `,
    options: {
      temperature: 0.7,
      maxTokens: 48192,
      enableCaching: true,
      enableLogging: true,
    },
    context: {
      reportDate: '2025-12-29',
      facilityName: 'مصنع الإلكترونيات المتقدمة',
      reportingPeriod: 'ديسمبر 2025',
    },
  });

  console.log('Report Generated Successfully!\n');
  console.log('Confidence Score:', result.confidence);
  console.log('\nReport Preview (first 500 characters):');
  console.log(result.text.substring(0, 500) + '...\n');
  
  if (result.notes && result.notes.length > 0) {
    console.log('Important Notes:');
    result.notes.forEach((note, index) => {
      console.log(`${index + 1}. ${note}`);
    });
  }
  
  console.log('\nMetadata:', JSON.stringify(result.metadata, null, 2));
  console.log('\n' + '='.repeat(60) + '\n');
}

async function exampleMinimalData() {
  console.log('=== Example 2: Report with Minimal Data ===\n');

  const result = await productionReadinessAnalyzerAgent.executeTask({
    input: `
      مصنع صغير للملابس:
      - 5 ماكينات خياطة
      - 20 عامل
      - مواد خام كافية لأسبوع واحد
    `,
    context: {
      reportDate: '2025-12-29',
      facilityName: 'مصنع الأزياء الصغير',
    },
  });

  console.log('Report Generated!\n');
  console.log('Confidence Score:', result.confidence);
  console.log('\nNote: With minimal data, the agent will note missing information.\n');
  console.log('Report Preview (first 300 characters):');
  console.log(result.text.substring(0, 300) + '...\n');
  console.log('\n' + '='.repeat(60) + '\n');
}

async function exampleWithIssues() {
  console.log('=== Example 3: Facility with Issues ===\n');

  const result = await productionReadinessAnalyzerAgent.executeTask({
    input: `
      مصنع الأدوية - تقرير طارئ:
      
      المعدات:
      - 8 خطوط إنتاج: 5 عاملة، 3 متوقفة بسبب أعطال
      - معدات قديمة بحاجة للاستبدال
      - مشاكل تقنية متكررة
      
      الموارد البشرية:
      - نقص حاد في الموظفين (40% من المطلوب فقط)
      - العمالة غير مدربة بشكل كافٍ
      - معدل دوران عالي للموظفين
      
      المواد الخام:
      - مخزون حرج: يكفي لـ 3 أيام فقط
      - تأخيرات في سلسلة التوريد
      - مشاكل في جودة بعض المواد الواردة
      
      الجودة والسلامة:
      - معدل عيوب مرتفع: 8%
      - 3 حوادث عمل خلال الشهر الماضي
      - انتهاء شهادة ISO منذ 6 أشهر
      - تحذيرات من هيئة الدواء
      
      البنية التحتية:
      - انقطاعات متكررة في الكهرباء
      - نظام تكييف معطل
      - تسريبات في المبنى
      - مشاكل في الصرف الصحي
    `,
    context: {
      reportDate: '2025-12-29',
      facilityName: 'مصنع الأدوية القديم',
      reportingPeriod: 'الربع الرابع 2025',
    },
  });

  console.log('Report Generated!\n');
  console.log('Confidence Score:', result.confidence);
  console.log('Expected Assessment: غير جاهز (Not Ready)\n');
  console.log('Report Preview (first 400 characters):');
  console.log(result.text.substring(0, 400) + '...\n');
  
  if (result.notes && result.notes.length > 0) {
    console.log('\nCritical Notes:');
    result.notes.forEach((note, index) => {
      console.log(`${index + 1}. ${note}`);
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

async function runExamples() {
  try {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Production Readiness Analyzer Agent - Examples          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');

    // Run all examples
    await exampleBasicUsage();
    await exampleMinimalData();
    await exampleWithIssues();

    console.log('All examples completed successfully!');
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run the examples:
// runExamples();

export { exampleBasicUsage, exampleMinimalData, exampleWithIssues };
