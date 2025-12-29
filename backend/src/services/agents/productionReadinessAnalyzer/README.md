# Production Readiness Analyzer Agent - Usage Examples

## Overview

The Production Readiness Analyzer Agent (`ProductionReadinessAnalyzerAgent`) is a specialized AI agent that generates comprehensive production readiness reports in Arabic. It analyzes production data and provides detailed assessments across multiple dimensions.

## Basic Usage

### 1. Import the Agent

```typescript
import { productionReadinessAnalyzerAgent } from '@/services/agents';
```

### 2. Simple Analysis

```typescript
const result = await productionReadinessAnalyzerAgent.executeTask({
  input: `
    مصنع الإلكترونيات - تقرير الحالة:
    - المعدات: 12 خط إنتاج عاملة، 2 خطوط تحت الصيانة
    - العمالة: 150 موظف، نقص 10 فنيين متخصصين
    - المواد الخام: مخزون كافٍ لـ 3 أسابيع
    - السلامة: آخر تفتيش منذ شهرين، لا حوادث
  `,
  options: {
    temperature: 0.7,
    maxTokens: 48192,
  },
  context: {
    reportDate: '2025-12-29',
    facilityName: 'مصنع الإلكترونيات المتقدمة',
    reportingPeriod: 'الربع الرابع 2025',
  },
});

console.log(result.text); // The full Arabic report
console.log(result.confidence); // Confidence score (0-1)
console.log(result.notes); // Any important notes
```

### 3. With Custom Context

```typescript
const result = await productionReadinessAnalyzerAgent.executeTask({
  input: `
    بيانات الإنتاج:
    - خطوط الإنتاج: 5 خطوط آلية حديثة
    - الموظفون: 80 عامل مدرب + 20 إداري
    - المواد: مخزون استراتيجي لـ 6 أشهر
    - الجودة: ISO 9001 معتمد
    - البنية التحتية: مبنى جديد بمساحة 5000 متر مربع
  `,
  options: {
    enableCaching: true,
    enableLogging: true,
  },
  context: {
    reportDate: '2025-12-29',
    facilityName: 'مصنع الأدوية الحديث',
    reportingPeriod: 'يناير - ديسمبر 2025',
  },
});
```

## Expected Report Structure

The agent generates a structured Arabic report with the following sections:

### 1. معلومات عامة (General Information)
- Report date
- Facility/project name
- Reporting period

### 2. حالة المعدات والآلات (Equipment and Machinery Status)
- Equipment condition and availability
- Maintenance status
- Technical issues
- Equipment availability rate

### 3. الموارد البشرية (Human Resources)
- Staffing levels
- Training status
- Workforce readiness
- Attendance rates

### 4. المواد الخام والمخزون (Raw Materials and Inventory)
- Raw material availability
- Inventory levels
- Supply chain status
- Material quality

### 5. الجودة والسلامة (Quality and Safety)
- Quality control measures
- Safety protocols
- Standards compliance
- Defect rates

### 6. البنية التحتية (Infrastructure)
- Facilities condition
- Utilities status
- Supporting infrastructure

### 7. التحديات والمخاطر (Challenges and Risks)
- Current obstacles
- Operational risks
- Risk assessment levels

### 8. التوصيات (Recommendations)
- Specific recommendations
- Improvement actions
- Priority levels

### 9. التقييم العام (Overall Assessment)
- Readiness rating:
  - جاهز تماماً (Fully Ready)
  - جاهز مع ملاحظات (Ready with Notes)
  - غير جاهز (Not Ready)
- Justification
- Readiness percentage

## Sample Input/Output

### Input:
```typescript
{
  input: `
    مصنع النسيج - الوضع الحالي:
    المعدات:
    - 20 ماكينة نسيج حديثة (جاهزة)
    - 5 ماكينات قديمة (بحاجة استبدال)
    - آخر صيانة: منذ أسبوعين
    
    الموظفون:
    - 100 عامل إنتاج (مدربون)
    - 15 فني صيانة
    - نقص في الإداريين (5 وظائف شاغرة)
    
    المواد الخام:
    - قطن: مخزون 2 شهر
    - أصباغ: مخزون 1 شهر (منخفض)
    - مواد كيميائية: كافية
    
    الجودة:
    - معدل العيوب: 2% (مقبول)
    - شكاوى العملاء: 3 في الشهر الماضي
    
    السلامة:
    - لا حوادث خطيرة
    - بحاجة تحديث طفايات الحريق
    
    البنية التحتية:
    - المبنى بحالة جيدة
    - نظام التكييف قديم (بحاجة صيانة)
  `,
  context: {
    reportDate: '2025-12-29',
    facilityName: 'مصنع النسيج الوطني',
    reportingPeriod: 'ديسمبر 2025',
  }
}
```

### Output Example:
```
# تقرير جاهزية الإنتاج

## معلومات عامة
- **تاريخ التقرير**: 2025-12-29
- **اسم المنشأة**: مصنع النسيج الوطني
- **فترة التقرير**: ديسمبر 2025

## حالة المعدات والآلات
المعدات الإنتاجية في حالة جيدة بشكل عام:
- 20 ماكينة نسيج حديثة جاهزة للعمل
- 5 ماكينات قديمة بحاجة للاستبدال
- الصيانة الدورية منتظمة (آخر صيانة منذ أسبوعين)
- معدل توفر المعدات: حوالي 80%

**ملاحظة**: يُنصح بوضع خطة لاستبدال الماكينات القديمة.

## الموارد البشرية
...
[يتبع بقية الأقسام]
...

## التقييم العام
**التصنيف: جاهز مع ملاحظات**

المصنع جاهز للإنتاج بشكل عام، لكن هناك بعض النقاط التي تحتاج انتباه:
- نقص في المواد الخام (الأصباغ)
- حاجة لتحديث بعض المعدات القديمة
- نقص في الموظفين الإداريين

**نسبة الجاهزية المقدرة**: 75-80%
```

## Integration with API

### Example Controller Usage:

```typescript
import { Request, Response } from 'express';
import { productionReadinessAnalyzerAgent } from '@/services/agents';

export const generateProductionReadinessReport = async (
  req: Request,
  res: Response
) => {
  try {
    const { productionData, reportDate, facilityName, reportingPeriod } = req.body;

    const result = await productionReadinessAnalyzerAgent.executeTask({
      input: productionData,
      context: {
        reportDate,
        facilityName,
        reportingPeriod,
      },
    });

    res.json({
      success: true,
      data: {
        report: result.text,
        confidence: result.confidence,
        notes: result.notes,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في إنشاء تقرير جاهزية الإنتاج',
    });
  }
};
```

## Tips for Best Results

1. **Provide Detailed Data**: The more specific and detailed your production data, the better the report quality.

2. **Structure Your Input**: Organize input data by categories (equipment, staff, materials, etc.) for clearer analysis.

3. **Use Context Parameters**: Always provide `reportDate`, `facilityName`, and `reportingPeriod` for complete reports.

4. **Review Confidence Score**: Check the `confidence` score in the result. Higher scores (>0.8) indicate more reliable analysis.

5. **Check Notes**: Review the `notes` array for any important warnings or observations.

## Configuration

The agent uses these default settings:
- **Confidence Floor**: 0.85
- **Temperature**: 0.7
- **Max Tokens**: 48192
- **Timeout**: 30000ms
- **Retries**: 2

You can override these in the `options` parameter when calling `executeTask()`.

## Error Handling

The agent includes fallback mechanisms:

```typescript
try {
  const result = await productionReadinessAnalyzerAgent.executeTask({
    input: productionData,
    context: { reportDate: '2025-12-29' },
  });
  
  if (result.confidence < 0.7) {
    console.warn('تحذير: مستوى الثقة منخفض، قد يحتاج التقرير لمراجعة');
  }
  
} catch (error) {
  // The agent will return a fallback response with basic guidance
  console.error('خطأ في إنشاء التقرير:', error);
}
```

## Notes

- The agent generates **text-only output** in Arabic, not JSON
- All reports follow a **consistent structure** with 9 main sections
- The agent applies **standard agent patterns** (RAG, Self-Critique, Constitutional, etc.)
- Reports are designed to be **professional and presentation-ready**
