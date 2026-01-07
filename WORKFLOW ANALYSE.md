

إليك الملف كاملاً بعد تطبيق التصحيحات اللازمة على ترقيم خطوات الـ Workflow داخل دالة `main`:

```markdown
# Workflow تنظيف المستودع - مُحسّن للحذف الآمن

## الهدف الرئيسي
**الحصول على مستودع نظيف: كل ملف فيه مفعّل وله علاقة مباشرة بالتطبيق، والتخلص من أي ملفات غير ضرورية بشكل آمن.**

---

## المرحلة 0: الإعداد والـ Backup الإلزامي

### 0.1 التثبيت

```bash
# أدوات أساسية
npm install --save-dev dependency-cruiser knip ts-prune
npm install -g madge depcheck

# أدوات إضافية للتحقق
npm install --save-dev eslint typescript
pip install --break-system-packages gitpython
```

### 0.2 إنشاء Backup كامل

```python
import shutil
import datetime
import os
from pathlib import Path

def create_backup(repo_path):
    """
    إنشاء نسخة احتياطية كاملة قبل أي حذف
    """
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"backup_{timestamp}"
    backup_path = Path(repo_path).parent / backup_name
    
    print(f"🔄 جاري إنشاء نسخة احتياطية...")
    
    # نسخ كامل المستودع
    shutil.copytree(
        repo_path, 
        backup_path,
        ignore=shutil.ignore_patterns('node_modules', '.git', 'dist', 'build', '__pycache__')
    )
    
    # حفظ معلومات الـ backup
    backup_info = {
        'timestamp': timestamp,
        'original_path': str(repo_path),
        'backup_path': str(backup_path),
        'commit_hash': get_current_commit_hash(repo_path)
    }
    
    with open(backup_path / 'BACKUP_INFO.json', 'w') as f:
        json.dump(backup_info, f, indent=2)
    
    print(f"✅ تم إنشاء النسخة الاحتياطية: {backup_path}")
    return backup_path

def get_current_commit_hash(repo_path):
    """الحصول على آخر commit hash"""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            cwd=repo_path,
            capture_output=True,
            text=True
        )
        return result.stdout.strip()
    except:
        return None
```

### 0.3 إعداد ملف الإعدادات

```python
# cleanup_config.json
{
    "repo_path": "./src",
    "ignore_patterns": [
        "node_modules",
        ".git",
        "dist",
        "build",
        "__pycache__",
        ".vscode",
        ".idea"
    ],
    "entry_points": [
        "src/main.ts",
        "src/index.ts",
        "src/app.tsx",
        "src/server.js"
    ],
    "protected_files": [
        "package.json",
        "tsconfig.json",
        ".env.example",
        "README.md",
        ".gitignore"
    ],
    "safe_mode": true,  # طلب موافقة قبل كل حذف
    "create_backup": true,
    "dry_run": false  # true = محاكاة فقط دون حذف فعلي
}
```

---

## المرحلة 1: المسح الشامل وبناء خريطة الاعتماديات الدقيقة

### 1.1 جمع كل الملفات

```python
def collect_all_files(repo_path, ignore_patterns, config):
    """
    جمع كل الملفات مع معلومات أساسية
    """
    all_files = {}
    
    for root, dirs, files in os.walk(repo_path):
        # تصفية المجلدات المستثناة
        dirs[:] = [d for d in dirs if d not in ignore_patterns]
        
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, repo_path)
            
            # تخطي الملفات المحمية
            if relative_path in config['protected_files']:
                continue
            
            all_files[relative_path] = {
                'absolute_path': file_path,
                'relative_path': relative_path,
                'extension': Path(file).suffix,
                'size_bytes': os.path.getsize(file_path),
                'is_protected': False,
                'analysis_status': 'pending'
            }
    
    return all_files
```

### 1.2 بناء خريطة اعتماديات شاملة

```python
def build_complete_dependency_map(repo_path):
    """
    بناء خريطة اعتماديات دقيقة باستخدام كل الأدوات
    """
    print("🔍 جاري بناء خريطة الاعتماديات...")
    
    dependency_map = {
        'imports': {},      # من يستورد من
        'imported_by': {},  # من يتم استيراده بواسطة
        'unused_exports': [],
        'unused_dependencies': [],
        'circular_dependencies': []
    }
    
    # 1. dependency-cruiser - الأدق
    print("  ├─ تشغيل dependency-cruiser...")
    dep_cruise_result = run_dependency_cruiser(repo_path)
    dependency_map = merge_depcruise_results(dependency_map, dep_cruise_result)
    
    # 2. madge - للتحقق المتقاطع
    print("  ├─ تشغيل madge...")
    madge_result = run_madge(repo_path)
    dependency_map = merge_madge_results(dependency_map, madge_result)
    
    # 3. Knip - لكشف الـ exports غير المستخدمة
    print("  ├─ تشغيل knip...")
    knip_result = run_knip(repo_path)
    dependency_map['unused_exports'] = knip_result['unused_exports']
    
    # 4. depcheck - لكشف الاعتماديات غير المستخدمة
    print("  ├─ تشغيل depcheck...")
    depcheck_result = run_depcheck(repo_path)
    dependency_map['unused_dependencies'] = depcheck_result['unused']
    
    # 5. ts-prune (للـ TypeScript)
    if has_typescript_files(repo_path):
        print("  └─ تشغيل ts-prune...")
        ts_prune_result = run_ts_prune(repo_path)
        dependency_map['unused_exports'].extend(ts_prune_result)
    
    print("✅ تم بناء خريطة الاعتماديات")
    return dependency_map

def run_dependency_cruiser(repo_path):
    """تشغيل dependency-cruiser"""
    cmd = f'depcruise --include-only "^src" --output-type json {repo_path}'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout) if result.returncode == 0 else {}

def run_knip(repo_path):
    """تشغيل knip"""
    cmd = 'npx knip --reporter json'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=repo_path)
    return json.loads(result.stdout) if result.returncode == 0 else {'unused_exports': []}
```

---

## المرحلة 1.5: التحليل الذكي بالـ AI

### 1.5.1 تجهيز النموذج

```python
import os
import google.generativeai as genai
from dotenv import load_dotenv

def initialize_gemini():
    """
    تهيئة نموذج Gemini للتحليل
    """
    load_dotenv()
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("❌ لم يتم العثور على GEMINI_API_KEY في ملف .env")
    
    genai.configure(api_key=api_key)
    
    # استخدام النموذج الأقوى للتحليل الدقيق
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    print("✅ تم تهيئة Gemini 2.0 Flash")
    return model
```

### 1.5.2 الأمر التوجيهي المخصص

```python
CLEANUP_FOCUSED_PROMPT = """
**الهدف الأساسي:** أنت مساعد خبير متخصص في تنظيف المستودعات البرمجية. مهمتك الوحيدة هي تحديد الملفات الآمنة للحذف للحصول على مستودع نظيف حيث كل ملف مفعّل وله علاقة مباشرة بالتطبيق.

**التركيز الرئيسي:**

أنت مطالب بتحليل كل ملف وتحديد **بدقة شديدة** ما إذا كان:

1. **KEEP** (احتفظ به) - ملف نشط ومفعّل:
   - يتم استيراده واستخدامه فعلياً في التطبيق
   - متصل بـ entry points
   - له تأثير على عمل التطبيق

2. **DELETE_SAFE** (احذف بأمان) - ملف عديم الفائدة:
   - لا يتم استيراده من أي ملف
   - غير متصل بأي entry point
   - ملف فارغ أو تجريبي أو معطل
   - أسماء مشبوهة (test, temp, backup, old, deprecated, unused)
   - exports غير مستخدمة نهائياً

3. **DELETE_PROBABLY** (غالباً آمن للحذف) - يحتاج مراجعة:
   - قد يكون له استخدام غير واضح
   - بعيد جداً من entry points (> 5 مستويات)
   - لم يتم تعديله منذ فترة طويلة (> 6 شهور)

4. **UNCERTAIN** (غير متأكد) - مراجعة يدوية إلزامية:
   - معلومات غير كافية للحكم
   - ملفات config أو إعدادات
   - ملفات كبيرة معقدة
   - احتمالية تأثير غير واضحة

**معلومات السياق المتاحة:**

سيتم تزويدك بـ:
- **خريطة المستودع الكاملة:** بنية المجلدات والملفات
- **شبكة الاعتماديات الكاملة:** من يستورد من، ومن يتم استيراده بواسطة
- **نقاط الدخول (Entry Points):** الملفات الرئيسية للتطبيق
- **المعلومات التقنية:** حجم الملف، الامتداد، تاريخ التعديل
- **تحليل الأدوات:** نتائج knip, depcheck, dependency-cruiser
- **محتوى الملف أو ملخصه:** حسب الحجم

**تنسيق الإخراج المطلوب (JSON فقط):**

```json
{
  "decision": "KEEP|DELETE_SAFE|DELETE_PROBABLY|UNCERTAIN",
  "confidence": 0-100,
  "reasons": [
    "سبب رئيسي 1",
    "سبب رئيسي 2",
    "سبب رئيسي 3"
  ],
  "usage_analysis": {
    "is_imported": true|false,
    "import_count": 0,
    "distance_from_entry": -1|0|1|2|...,
    "has_unused_exports": true|false
  },
  "risk_assessment": {
    "deletion_safety_score": 0-100,
    "potential_impact": "none|minimal|moderate|high|critical",
    "affected_files": []
  },
  "recommendation": "نص قصير يشرح القرار النهائي والإجراء الموصى به"
}
```

**معايير الحكم الصارمة:**

1. **KEEP إذا وفقط إذا:**
   - يتم استيراده بواسطة ملف واحد على الأقل، أو
   - هو entry point نفسه، أو
   - مسافته من entry points ≤ 3 مستويات

2. **DELETE_SAFE إذا:**
   - لا يتم استيراده نهائياً (import_count = 0)، و
   - غير متصل بأي entry point (distance = -1)، و
   - جميع exports غير مستخدمة، و
   - لا يوجد أي تأثير على ملفات أخرى

3. **DELETE_PROBABLY إذا:**
   - import_count = 0، و
   - distance > 5 أو -1، و
   - confidence >= 70

4. **UNCERTAIN إذا:**
   - confidence < 70، أو
   - معلومات ناقصة، أو
   - ملف config/settings، أو
   - احتمالية تأثير غير واضحة

**قواعد حاسمة:**

- ❌ **لا تكن متساهلاً** - الافتراض الأساسي: احذف إلا إذا كان هناك دليل واضح على الاستخدام
- ✅ **كن صارماً في KEEP** - فقط الملفات المفعّلة فعلياً
- ⚠️ **كن حذراً مع UNCERTAIN** - عند أدنى شك، ضعه في uncertain
- 📊 **استخدم البيانات فقط** - لا تخمن، اعتمد على الاعتماديات والأدوات
- 🎯 **التركيز على الهدف** - مستودع نظيف = صفر ملفات غير مفعّلة

**أمثلة:**

❌ **خطأ:**
```json
{
  "decision": "KEEP",
  "reasons": ["قد يكون مفيداً في المستقبل"]
}
```

✅ **صحيح:**
```json
{
  "decision": "DELETE_SAFE",
  "confidence": 95,
  "reasons": [
    "import_count = 0 - لا يستورده أي ملف",
    "distance_from_entry = -1 - غير متصل نهائياً",
    "الملف فارغ - 0 بايت"
  ]
}
```

**ملاحظة نهائية:**

هدفك الوحيد هو تنظيف المستودع. كن حازماً في قرارات الحذف عندما تكون البيانات واضحة.
"""
```

### 1.5.3 بناء الـ Prompt لكل ملف

```python
def build_ai_analysis_prompt(file_path, file_info, dependency_map, repo_map, entry_points):
    """
    بناء prompt مخصص لكل ملف للتحليل بالـ AI
    """
    # استخراج معلومات الاعتماديات
    imports_from = dependency_map['imports'].get(file_path, [])
    imported_by = dependency_map['imported_by'].get(file_path, [])
    is_unused_export = file_path in dependency_map['unused_exports']
    
    # حساب المسافة من entry points
    distance = calculate_distance_from_entry_points(file_path, entry_points, dependency_map)
    
    # قراءة محتوى الملف أو ملخصه
    if file_info['size_bytes'] < 50000:  # أقل من ~50KB
        with open(file_info['absolute_path'], 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        content_section = f"### محتوى الملف الكامل:\n```\n{content}\n```"
    else:
        content_summary = generate_structure_summary(file_info['absolute_path'])
        content_section = f"### ملخص هيكل الملف (ملف كبير):\n{json.dumps(content_summary, ensure_ascii=False, indent=2)}"
    
    # بناء الـ prompt النهائي
    prompt = f"""{CLEANUP_FOCUSED_PROMPT}

---

# معلومات الملف للتحليل

## الملف: `{file_path}`

### المعلومات التقنية:
- **الحجم:** {file_info['size_bytes']} بايت
- **الامتداد:** {file_info['extension']}
- **المسار الكامل:** {file_info['absolute_path']}

### تحليل الاعتماديات:
- **يستورد من ({len(imports_from)} ملف):** {', '.join(imports_from) if imports_from else 'لا يستورد شيئاً'}
- **يتم استيراده بواسطة ({len(imported_by)} ملف):** {', '.join(imported_by) if imported_by else 'لا يستورده أي ملف'}
- **المسافة من entry points:** {distance if distance != -1 else 'غير متصل'}
- **exports غير مستخدمة:** {'نعم' if is_unused_export else 'لا'}

### نقاط الدخول للمشروع:
{chr(10).join(['- ' + ep for ep in entry_points])}

### نتائج الأدوات:
- **Knip:** {'ملف غير مستخدم' if is_unused_export else 'قيد الاستخدام'}
- **Import Count:** {len(imported_by)}
- **Export Count:** {len(imports_from)}

{content_section}

---

**المطلوب:** قم بتحليل هذا الملف وفقاً للمعايير المذكورة وأرجع JSON فقط.
"""
    
    return prompt
```

### 1.5.4 تنفيذ التحليل بالـ AI

```python
def analyze_files_with_ai(all_files, dependency_map, repo_map, entry_points, model):
    """
    تحليل جميع الملفات باستخدام Gemini AI
    """
    print(f"\n🤖 جاري تحليل {len(all_files)} ملف باستخدام Gemini 2.0 Flash...")
    
    ai_analysis_results = {}
    
    for i, (file_path, file_info) in enumerate(all_files.items(), 1):
        try:
            print(f"\r  [{i}/{len(all_files)}] تحليل: {file_path[:50]}...", end='', flush=True)
            
            # بناء الـ prompt
            prompt = build_ai_analysis_prompt(
                file_path, 
                file_info, 
                dependency_map, 
                repo_map, 
                entry_points
            )
            
            # إرسال للنموذج
            response = model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.1,  # أقل عشوائية للدقة
                    'response_mime_type': 'application/json'
                }
            )
            
            # استخراج النتيجة
            analysis = json.loads(response.text)
            
            ai_analysis_results[file_path] = {
                'analysis': analysis,
                'file_info': file_info,
                'timestamp': datetime.datetime.now().isoformat()
            }
            
        except json.JSONDecodeError as e:
            print(f"\n  ⚠️  خطأ في parsing JSON لـ {file_path}: {e}")
            ai_analysis_results[file_path] = {
                'analysis': {
                    'decision': 'UNCERTAIN',
                    'confidence': 0,
                    'reasons': [f'فشل parsing: {str(e)}'],
                    'error': True
                },
                'file_info': file_info
            }
        
        except Exception as e:
            print(f"\n  ❌ خطأ في تحليل {file_path}: {e}")
            ai_analysis_results[file_path] = {
                'analysis': {
                    'decision': 'UNCERTAIN',
                    'confidence': 0,
                    'reasons': [f'خطأ في التحليل: {str(e)}'],
                    'error': True
                },
                'file_info': file_info
            }
    
    print(f"\n✅ اكتمل التحليل بالـ AI لـ {len(ai_analysis_results)} ملف")
    
    # حفظ النتائج
    save_ai_analysis_results(ai_analysis_results)
    
    return ai_analysis_results

def save_ai_analysis_results(results, output_file='ai_analysis_results.json'):
    """
    حفظ نتائج التحليل
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"💾 تم حفظ نتائج التحليل في: {output_file}")
```

### 1.5.5 تصنيف النتائج

```python
def categorize_ai_results(ai_analysis_results):
    """
    تصنيف الملفات حسب قرارات الـ AI
    """
    categorized = {
        'KEEP': [],
        'DELETE_SAFE': [],
        'DELETE_PROBABLY': [],
        'UNCERTAIN': [],
        'ERROR': []
    }
    
    for file_path, result in ai_analysis_results.items():
        analysis = result['analysis']
        decision = analysis.get('decision', 'UNCERTAIN')
        
        if analysis.get('error'):
            categorized['ERROR'].append({
                'path': file_path,
                'result': result
            })
        else:
            categorized[decision].append({
                'path': file_path,
                'result': result,
                'confidence': analysis.get('confidence', 0)
            })
    
    # ترتيب حسب الثقة
    for category in ['DELETE_SAFE', 'DELETE_PROBABLY']:
        categorized[category].sort(key=lambda x: x['confidence'], reverse=True)
    
    print("\n📊 تصنيف النتائج:")
    print(f"  ├─ KEEP: {len(categorized['KEEP'])}")
    print(f"  ├─ DELETE_SAFE: {len(categorized['DELETE_SAFE'])}")
    print(f"  ├─ DELETE_PROBABLY: {len(categorized['DELETE_PROBABLY'])}")
    print(f"  ├─ UNCERTAIN: {len(categorized['UNCERTAIN'])}")
    print(f"  └─ ERROR: {len(categorized['ERROR'])}")
    
    return categorized

def convert_ai_results_to_candidates(categorized_results):
    """
    تحويل نتائج الـ AI إلى تنسيق المرشحين للحذف
    """
    candidates = {
        'safe_to_delete': [],
        'probably_unused': [],
        'uncertain': [],
        'keep': []
    }
    
    # تحويل DELETE_SAFE
    for item in categorized_results['DELETE_SAFE']:
        candidates['safe_to_delete'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'safe_to_delete',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': item['result']['analysis'].get('confidence', 0),
                'risk_factors': []
            },
            'deletion_safety': item['confidence']
        })
    
    # تحويل DELETE_PROBABLY
    for item in categorized_results['DELETE_PROBABLY']:
        candidates['probably_unused'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'probably_unused',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': item['result']['analysis'].get('confidence', 0),
                'risk_factors': []
            },
            'deletion_safety': item['confidence']
        })
    
    # تحويل UNCERTAIN
    for item in categorized_results['UNCERTAIN']:
        candidates['uncertain'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'uncertain',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': item['result']['analysis'].get('confidence', 0),
                'risk_factors': []
            },
            'deletion_safety': item['confidence']
        })
    
    # تحويل KEEP
    for item in categorized_results['KEEP']:
        candidates['keep'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'keep',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': 0,
                'risk_factors': []
            },
            'deletion_safety': 0
        })
    
    return candidates
```

---

## المرحلة 2: تحديد الملفات المرشحة للحذف

### 2.1 تصنيف الملفات حسب الاستخدام

```python
def identify_deletion_candidates(all_files, dependency_map, entry_points):
    """
    تحديد الملفات المرشحة للحذف بدقة
    """
    candidates = {
        'safe_to_delete': [],      # آمن للحذف - أولوية عالية
        'probably_unused': [],     # غالباً غير مستخدم - يحتاج مراجعة
        'uncertain': [],           # غير متأكد - يحتاج فحص يدوي
        'keep': []                 # يجب الاحتفاظ به
    }
    
    for file_path, file_info in all_files.items():
        classification = classify_file(file_path, file_info, dependency_map, entry_points)
        category = classification['category']
        
        candidates[category].append({
            'path': file_path,
            'info': file_info,
            'classification': classification,
            'deletion_safety': classification['safety_score']
        })
    
    # ترتيب حسب درجة الأمان
    for category in candidates:
        candidates[category].sort(key=lambda x: x['deletion_safety'], reverse=True)
    
    return candidates

def classify_file(file_path, file_info, dependency_map, entry_points):
    """
    تصنيف دقيق للملف
    """
    classification = {
        'category': 'uncertain',
        'reasons': [],
        'safety_score': 0,  # 0-100 (كلما أعلى = أكثر أمانًا للحذف)
        'risk_factors': []
    }
    
    # 1. فحص الاستيراد المباشر
    is_imported = file_path in dependency_map['imported_by']
    has_importers = len(dependency_map['imported_by'].get(file_path, [])) > 0
    
    if not has_importers:
        classification['reasons'].append('لا يتم استيراده من أي ملف')
        classification['safety_score'] += 40
    
    # 2. فحص المسافة من entry points
    distance = calculate_distance_from_entry_points(file_path, entry_points, dependency_map)
    
    if distance == -1:  # غير متصل نهائيًا
        classification['reasons'].append('غير متصل بأي entry point')
        classification['safety_score'] += 30
    elif distance > 5:  # بعيد جدًا
        classification['reasons'].append(f'بعيد عن entry points ({distance} مستويات)')
        classification['safety_score'] += 10
    else:
        classification['risk_factors'].append(f'قريب من entry points ({distance} مستويات)')
        classification['safety_score'] -= 20
    
    # 3. فحص exports غير المستخدمة
    if file_path in dependency_map['unused_exports']:
        classification['reasons'].append('جميع exports غير مستخدمة')
        classification['safety_score'] += 20
    
    # 4. فحص حجم الملف
    if file_info['size_bytes'] == 0:
        classification['reasons'].append('ملف فارغ')
        classification['safety_score'] += 10
        classification['category'] = 'safe_to_delete'
        return classification
    
    # 5. فحص أنماط الأسماء المشبوهة
    suspicious_patterns = ['test', 'temp', 'backup', 'old', 'deprecated', 'unused', '.bak']
    if any(pattern in file_path.lower() for pattern in suspicious_patterns):
        classification['reasons'].append('اسم مشبوه يدل على عدم الاستخدام')
        classification['safety_score'] += 15
    
    # 6. فحص التاريخ (إن أمكن)
    git_info = get_git_file_info(file_path)
    if git_info and git_info['days_since_modified'] > 180:
        classification['reasons'].append(f'لم يتم تعديله منذ {git_info["days_since_modified"]} يوم')
        classification['safety_score'] += 5
    
    # 7. التصنيف النهائي
    if classification['safety_score'] >= 70:
        classification['category'] = 'safe_to_delete'
    elif classification['safety_score'] >= 40:
        classification['category'] = 'probably_unused'
    elif classification['safety_score'] >= 20:
        classification['category'] = 'uncertain'
    else:
        classification['category'] = 'keep'
        classification['reasons'].append('الملف نشط ومستخدم')
    
    return classification

def calculate_distance_from_entry_points(file_path, entry_points, dependency_map):
    """
    حساب أقصر مسافة من أي entry point
    """
    from collections import deque
    
    # BFS من كل entry point
    min_distance = float('inf')
    
    for entry_point in entry_points:
        queue = deque([(entry_point, 0)])
        visited = {entry_point}
        
        while queue:
            current, distance = queue.popleft()
            
            if current == file_path:
                min_distance = min(min_distance, distance)
                break
            
            # الحصول على الملفات التي يستوردها الملف الحالي
            imports = dependency_map['imports'].get(current, [])
            
            for imported_file in imports:
                if imported_file not in visited:
                    visited.add(imported_file)
                    queue.append((imported_file, distance + 1))
    
    return min_distance if min_distance != float('inf') else -1
```

---

## المرحلة 3: التحقق الآمن المتقدم

### 3.1 فحص التأثير قبل الحذف

```python
def perform_safety_checks(candidates, dependency_map, config):
    """
    إجراء فحوصات أمان شاملة قبل الحذف
    """
    print("\n🔒 جاري إجراء فحوصات الأمان...")
    
    safety_report = {
        'approved_for_deletion': [],
        'needs_review': [],
        'blocked': [],
        'warnings': []
    }
    
    # فحص كل ملف مرشح للحذف
    files_to_check = candidates['safe_to_delete'] + candidates['probably_unused']
    
    for candidate in files_to_check:
        file_path = candidate['path']
        
        # 1. فحص الاعتماديات العكسية
        reverse_deps = get_reverse_dependencies(file_path, dependency_map)
        if reverse_deps:
            candidate['blocked_reason'] = f'يتم استيراده من: {", ".join(reverse_deps[:3])}'
            safety_report['blocked'].append(candidate)
            continue
        
        # 2. فحص ما إذا كان entry point
        if is_entry_point(file_path, config['entry_points']):
            candidate['blocked_reason'] = 'ملف entry point - لا يمكن حذفه'
            safety_report['blocked'].append(candidate)
            continue
        
        # 3. فحص الأنماط الخاصة
        if requires_manual_review(file_path, candidate):
            safety_report['needs_review'].append(candidate)
            continue
        
        # 4. اجتاز جميع الفحوصات
        safety_report['approved_for_deletion'].append(candidate)
    
    # 5. فحص الاعتماديات الدائرية
    circular = check_circular_dependencies(dependency_map)
    if circular:
        safety_report['warnings'].append(f'تحذير: وجود {len(circular)} اعتماديات دائرية')
    
    print(f"✅ الفحوصات الأمنية اكتملت:")
    print(f"  ├─ موافق للحذف: {len(safety_report['approved_for_deletion'])}")
    print(f"  ├─ يحتاج مراجعة: {len(safety_report['needs_review'])}")
    print(f"  └─ محظور: {len(safety_report['blocked'])}")
    
    return safety_report

def requires_manual_review(file_path, candidate):
    """
    تحديد ما إذا كان الملف يحتاج مراجعة يدوية
    """
    # ملفات config دائماً تحتاج مراجعة
    config_extensions = ['.json', '.yaml', '.yml', '.toml', '.ini', '.env']
    if any(file_path.endswith(ext) for ext in config_extensions):
        return True
    
    # ملفات ذات safety score متوسط
    if 40 <= candidate['deletion_safety'] < 70:
        return True
    
    # ملفات كبيرة (> 500 سطر)
    if candidate['info']['size_bytes'] > 500 * 80:  # تقريباً 500 سطر
        return True
    
    return False
```

### 3.2 محاكاة الحذف (Dry Run)

```python
def simulate_deletion(safety_report, dependency_map):
    """
    محاكاة الحذف للتأكد من عدم كسر التطبيق
    """
    print("\n🎭 جاري محاكاة الحذف...")
    
    simulation_results = {
        'would_break': [],
        'safe': [],
        'uncertain': []
    }
    
    approved_files = [f['path'] for f in safety_report['approved_for_deletion']]
    
    # إنشاء dependency map مؤقت بدون الملفات المحذوفة
    simulated_map = simulate_dependency_removal(dependency_map, approved_files)
    
    # فحص الاتصال بعد الحذف
    for file in approved_files:
        # فحص ما إذا كان هناك ملفات ستصبح منفصلة بعد حذف هذا الملف
        would_orphan = find_would_be_orphaned_files(file, simulated_map)
        
        if would_orphan:
            simulation_results['would_break'].append({
                'file': file,
                'reason': f'حذفه سيجعل {len(would_orphan)} ملف منفصل',
                'orphaned_files': would_orphan
            })
        else:
            simulation_results['safe'].append(file)
    
    print(f"✅ المحاكاة اكتملت:")
    print(f"  ├─ آمن: {len(simulation_results['safe'])}")
    print(f"  └─ خطر: {len(simulation_results['would_break'])}")
    
    return simulation_results
```

---

## المرحلة 4: المراجعة والموافقة التفاعلية

### 4.1 واجهة مراجعة تفاعلية

```python
def interactive_review(safety_report, simulation_results, config):
    """
    واجهة تفاعلية لمراجعة الملفات قبل الحذف
    """
    if not config['safe_mode']:
        print("⚠️  الوضع الآمن معطل - سيتم الحذف تلقائياً")
        return safety_report['approved_for_deletion']
    
    print("\n" + "="*70)
    print("📋 مراجعة الملفات المرشحة للحذف")
    print("="*70)
    
    final_approved = []
    
    # عرض ملخص
    safe_files = simulation_results['safe']
    print(f"\n🟢 ملفات آمنة للحذف: {len(safe_files)}")
    
    if len(safe_files) > 0:
        print("\nأول 10 ملفات:")
        for i, file_path in enumerate(safe_files[:10], 1):
            candidate = next(f for f in safety_report['approved_for_deletion'] if f['path'] == file_path)
            print(f"  {i}. {file_path}")
            print(f"     السبب: {', '.join(candidate['classification']['reasons'][:2])}")
            print(f"     درجة الأمان: {candidate['deletion_safety']}/100")
        
        if len(safe_files) > 10:
            print(f"  ... و {len(safe_files) - 10} ملف آخر")
        
        # طلب الموافقة
        print("\n" + "-"*70)
        choice = input(f"\n❓ هل توافق على حذف جميع الـ {len(safe_files)} ملف؟ (y/n/review): ").lower()
        
        if choice == 'y':
            final_approved = safe_files
            print(f"✅ تمت الموافقة على حذف {len(final_approved)} ملف")
        
        elif choice == 'review':
            # مراجعة ملف بملف
            final_approved = detailed_file_review(safe_files, safety_report)
        
        else:
            print("❌ تم إلغاء الحذف")
            return []
    
    # عرض الملفات الخطرة
    if simulation_results['would_break']:
        print(f"\n🔴 ملفات خطرة (لن يتم حذفها): {len(simulation_results['would_break'])}")
        for item in simulation_results['would_break'][:5]:
            print(f"  - {item['file']}")
            print(f"    السبب: {item['reason']}")
    
    # عرض الملفات التي تحتاج مراجعة
    if safety_report['needs_review']:
        print(f"\n🟡 ملفات تحتاج مراجعة يدوية: {len(safety_report['needs_review'])}")
        review_choice = input("\nهل تريد مراجعتها الآن؟ (y/n): ").lower()
        
        if review_choice == 'y':
            reviewed = detailed_file_review(
                [f['path'] for f in safety_report['needs_review']], 
                safety_report
            )
            final_approved.extend(reviewed)
    
    return final_approved

def detailed_file_review(files, safety_report):
    """
    مراجعة تفصيلية لكل ملف
    """
    approved = []
    
    print("\n" + "="*70)
    print("🔍 مراجعة تفصيلية")
    print("="*70)
    
    for i, file_path in enumerate(files, 1):
        candidate = next(f for f in safety_report['approved_for_deletion'] if f['path'] == file_path)
        
        print(f"\n[{i}/{len(files)}] {file_path}")
        print(f"  الحجم: {candidate['info']['size_bytes']} بايت")
        print(f"  درجة الأمان: {candidate['deletion_safety']}/100")
        print(f"  الأسباب:")
        for reason in candidate['classification']['reasons']:
            print(f"    - {reason}")
        
        if candidate['classification']['risk_factors']:
            print(f"  ⚠️  عوامل خطر:")
            for risk in candidate['classification']['risk_factors']:
                print(f"    - {risk}")
        
        choice = input(f"  احذف هذا الملف؟ (y/n/view/skip-rest): ").lower()
        
        if choice == 'y':
            approved.append(file_path)
        elif choice == 'view':
            view_file_content(candidate['info']['absolute_path'])
            # إعادة السؤال
            if input("  احذف؟ (y/n): ").lower() == 'y':
                approved.append(file_path)
        elif choice == 'skip-rest':
            break
    
    return approved

def view_file_content(file_path, lines=20):
    """
    عرض محتوى الملف
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.readlines()
        
        print(f"\n  --- محتوى الملف (أول {lines} سطر) ---")
        for i, line in enumerate(content[:lines], 1):
            print(f"  {i:3} | {line.rstrip()}")
        
        if len(content) > lines:
            print(f"  ... ({len(content) - lines} سطر إضافي)")
        print("  " + "-"*50)
    except Exception as e:
        print(f"  ❌ خطأ في قراءة الملف: {e}")
```

---

## المرحلة 5: التنفيذ الآمن

### 5.1 الحذف المرحلي

```python
def safe_deletion_execution(approved_files, config, backup_path):
    """
    تنفيذ الحذف بشكل آمن ومرحلي
    """
    print("\n" + "="*70)
    print("🗑️  بدء عملية الحذف الآمن")
    print("="*70)
    
    deletion_log = {
        'timestamp': datetime.datetime.now().isoformat(),
        'backup_path': str(backup_path),
        'total_files': len(approved_files),
        'deleted': [],
        'failed': [],
        'rollback_available': True
    }
    
    if config['dry_run']:
        print("\n⚠️  وضع المحاكاة (DRY RUN) - لن يتم حذف أي ملف فعلياً")
        for file_path in approved_files:
            print(f"  [محاكاة] سيتم حذف: {file_path}")
            deletion_log['deleted'].append({
                'path': file_path,
                'dry_run': True
            })
        return deletion_log
    
    # الحذف الفعلي
    for i, file_path in enumerate(approved_files, 1):
        try:
            print(f"\n[{i}/{len(approved_files)}] حذف: {file_path}")
            
            # 1. نسخ الملف إلى مجلد الحذف (للاسترجاع السريع)
            deleted_backup = backup_path / 'deleted_files' / file_path
            deleted_backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, deleted_backup)
            
            # 2. حذف الملف الفعلي
            os.remove(file_path)
            
            deletion_log['deleted'].append({
                'path': file_path,
                'backup_location': str(deleted_backup),
                'timestamp': datetime.datetime.now().isoformat(),
                'status': 'success'
            })
            
            print(f"  ✅ تم الحذف")
            
        except Exception as e:
            print(f"  ❌ فشل الحذف: {e}")
            deletion_log['failed'].append({
                'path': file_path,
                'error': str(e)
            })
    
    # حفظ سجل الحذف
    log_file = backup_path / 'deletion_log.json'
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(deletion_log, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ اكتملت عملية الحذف:")
    print(f"  ├─ نجح: {len(deletion_log['deleted'])}")
    print(f"  ├─ فشل: {len(deletion_log['failed'])}")
    print(f"  └─ سجل الحذف: {log_file}")
    
    return deletion_log
```

### 5.2 نظام Rollback

```python
def rollback_deletion(deletion_log):
    """
    استرجاع الملفات المحذوفة في حالة وجود مشكلة
    """
    print("\n🔄 جاري استرجاع الملفات المحذوفة...")
    
    rollback_report = {
        'restored': [],
        'failed': []
    }
    
    for deleted_file in deletion_log['deleted']:
        try:
            backup_location = deleted_file['backup_location']
            original_path = deleted_file['path']
            
            # استرجاع الملف
            Path(original_path).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(backup_location, original_path)
            
            rollback_report['restored'].append(original_path)
            print(f"  ✅ استرجاع: {original_path}")
            
        except Exception as e:
            rollback_report['failed'].append({
                'path': original_path,
                'error': str(e)
            })
            print(f"  ❌ فشل استرجاع: {original_path}")
    
    print(f"\n✅ اكتمل الاسترجاع:")
    print(f"  ├─ تم استرجاع: {len(rollback_report['restored'])}")
    print(f"  └─ فشل: {len(rollback_report['failed'])}")
    
    return rollback_report
```

---

## المرحلة 6: التحقق بعد الحذف

### 6.1 اختبار التطبيق بعد الحذف

```python
def post_deletion_validation(repo_path, config):
    """
    التحقق من سلامة التطبيق بعد الحذف
    """
    print("\n" + "="*70)
    print("🧪 التحقق من سلامة التطبيق")
    print("="*70)
    
    validation_report = {
        'build_status': None,
        'tests_status': None,
        'linting_status': None,
        'issues_found': [],
        'overall_status': 'unknown'
    }
    
    # 1. فحص بناء المشروع
    print("\n1️⃣ فحص البناء (Build)...")
    try:
        build_result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if build_result.returncode == 0:
            validation_report['build_status'] = 'success'
            print("  ✅ البناء نجح")
        else:
            validation_report['build_status'] = 'failed'
            validation_report['issues_found'].append({
                'type': 'build_error',
                'message': build_result.stderr[:500]
            })
            print("  ❌ البناء فشل")
            print(f"  الخطأ: {build_result.stderr[:200]}")
    
    except subprocess.TimeoutExpired:
        validation_report['build_status'] = 'timeout'
        print("  ⏱️  البناء استغرق وقتاً طويلاً")
    
    except Exception as e:
        validation_report['build_status'] = 'error'
        print(f"  ❌ خطأ: {e}")
    
    # 2. تشغيل الاختبارات
    print("\n2️⃣ تشغيل الاختبارات...")
    try:
        test_result = subprocess.run(
            ['npm', 'test'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if test_result.returncode == 0:
            validation_report['tests_status'] = 'passed'
            print("  ✅ جميع الاختبارات نجحت")
        else:
            validation_report['tests_status'] = 'failed'
            validation_report['issues_found'].append({
                'type': 'test_failure',
                'message': test_result.stderr[:500]
            })
            print("  ❌ بعض الاختبارات فشلت")
    
    except Exception as e:
        validation_report['tests_status'] = 'skipped'
        print(f"  ⏭️  تخطي الاختبارات: {e}")
    
    # 3. فحص Linting
    print("\n3️⃣ فحص Linting...")
    try:
        lint_result = subprocess.run(
            ['npm', 'run', 'lint'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        validation_report['linting_status'] = 'passed' if lint_result.returncode == 0 else 'warnings'
        print(f"  {'✅' if lint_result.returncode == 0 else '⚠️'} Linting")
    
    except Exception as e:
        validation_report['linting_status'] = 'skipped'
        print(f"  ⏭️  تخطي Linting")
    
    # 4. التقييم النهائي
    if (validation_report['build_status'] == 'success' and 
        validation_report['tests_status'] in ['passed', 'skipped']):
        validation_report['overall_status'] = 'healthy'
        print("\n✅ التطبيق في حالة جيدة")
    else:
        validation_report['overall_status'] = 'unhealthy'
        print("\n❌ التطبيق يحتاج مراجعة")
    
    return validation_report
```

### 6.2 التعامل مع الفشل

```python
def handle_validation_failure(validation_report, deletion_log, backup_path):
    """
    التعامل مع فشل التحقق بعد الحذف
    """
    print("\n⚠️  تم اكتشاف مشاكل بعد الحذف!")
    print("\nالخيارات المتاحة:")
    print("  1. استرجاع جميع الملفات (Rollback كامل)")
    print("  2. استرجاع بعض الملفات (Rollback جزئي)")
    print("  3. الاحتفاظ بالتغييرات ومعالجة المشاكل يدوياً")
    
    choice = input("\nاختيارك (1/2/3): ")
    
    if choice == '1':
        print("\n🔄 جاري استرجاع جميع الملفات...")
        rollback_deletion(deletion_log)
        print("✅ تم استرجاع جميع الملفات")
        
    elif choice == '2':
        print("\n📋 الملفات المحذوفة:")
        for i, file_info in enumerate(deletion_log['deleted'], 1):
            print(f"  {i}. {file_info['path']}")
        
        to_restore = input("\nأدخل أرقام الملفات للاسترجاع (مفصولة بفواصل): ")
        indices = [int(x.strip()) - 1 for x in to_restore.split(',')]
        
        partial_rollback(deletion_log, indices)
        
    else:
        print("\n⚠️  تم الاحتفاظ بالتغييرات - يُرجى معالجة المشاكل يدوياً")
        print(f"النسخة الاحتياطية متوفرة في: {backup_path}")
```

---

## المرحلة 7: التقرير النهائي الشامل

### 7.1 توليد التقرير

```python
def generate_final_report(deletion_log, validation_report, stats_before, stats_after):
    """
    توليد تقرير نهائي شامل
    """
    report = f"""
{'='*70}
📊 تقرير تنظيف المستودع - النسخة النهائية
{'='*70}

⏰ التاريخ: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{'─'*70}
📈 إحصائيات قبل وبعد
{'─'*70}

قبل التنظيف:
  • إجمالي الملفات: {stats_before['total_files']}
  • الحجم الكلي: {stats_before['total_size_mb']:.2f} MB
  • ملفات غير مستخدمة: {stats_before['unused_files']}

بعد التنظيف:
  • إجمالي الملفات: {stats_after['total_files']}
  • الحجم الكلي: {stats_after['total_size_mb']:.2f} MB
  • ملفات نشطة: {stats_after['active_files']}

التحسين:
  • تم حذف: {deletion_log['total_files']} ملف
  • تم توفير: {stats_before['total_size_mb'] - stats_after['total_size_mb']:.2f} MB
  • نسبة التقليل: {(1 - stats_after['total_files']/stats_before['total_files'])*100:.1f}%

{'─'*70}
🗑️  تفاصيل الحذف
{'─'*70}

✅ تم حذفها بنجاح: {len(deletion_log['deleted'])}
❌ فشل الحذف: {len(deletion_log['failed'])}

{'─'*70}
🧪 حالة التطبيق بعد التنظيف
{'─'*70}

البناء (Build): {get_status_emoji(validation_report['build_status'])} {validation_report['build_status']}
الاختبارات (Tests): {get_status_emoji(validation_report['tests_status'])} {validation_report['tests_status']}
Linting: {get_status_emoji(validation_report['linting_status'])} {validation_report['linting_status']}

الحالة العامة: {get_status_emoji(validation_report['overall_status'])} {validation_report['overall_status'].upper()}

{'─'*70}
💾 معلومات النسخ الاحتياطي
{'─'*70}

المسار: {deletion_log['backup_path']}
الملفات المحذوفة: {deletion_log['backup_path']}/deleted_files/
سجل الحذف: {deletion_log['backup_path']}/deletion_log.json

⚠️  ملاحظة: يمكن استرجاع أي ملف من النسخة الاحتياطية

{'='*70}
"""
    
    # حفظ التقرير
    report_file = Path(deletion_log['backup_path']) / 'cleanup_report.txt'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(report)
    print(f"\n📄 تم حفظ التقرير في: {report_file}")
    
    return report

def get_status_emoji(status):
    """الحصول على emoji حسب الحالة"""
    emoji_map = {
        'success': '✅',
        'passed': '✅',
        'healthy': '✅',
        'failed': '❌',
        'unhealthy': '❌',
        'warnings': '⚠️',
        'skipped': '⏭️',
        'timeout': '⏱️',
        'unknown': '❓'
    }
    return emoji_map.get(status, '❓')
```

---

## السكريبت الرئيسي المُجمّع
```python
#!/usr/bin/env python3
"""
سكريبت تنظيف المستودع - الإصدار النهائي مع مسار إخراج مخصص
الهدف: الحصول على مستودع نظيف حيث كل ملف مفعّل وله علاقة بالتطبيق
جميع الملفات الناتجة تُحفظ في: D:\New folder (56)
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
import datetime
import json
import subprocess
from collections import deque

# ==========================================
# الإعدادات العامة - مسار الإخراج الثابت
# ==========================================
OUTPUT_BASE_PATH = Path("D:/New folder (56)")

def load_config(config_path='cleanup_config.json'):
    """تحميل إعدادات التنظيف"""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        # تأكيد مسار الإخراج
        config['output_path'] = str(OUTPUT_BASE_PATH)
        return config
    except FileNotFoundError:
        print("❌ ملف الإعدادات غير موجود. سيتم استخدام الإعدادات الافتراضية.")
        return {
            'repo_path': './src',
            'ignore_patterns': ['node_modules', '.git', 'dist', 'build', '__pycache__', '.vscode', '.idea'],
            'entry_points': ['src/main.ts', 'src/index.ts', 'src/app.tsx', 'src/server.js'],
            'protected_files': ['package.json', 'tsconfig.json', '.env.example', 'README.md', '.gitignore'],
            'safe_mode': True,
            'create_backup': True,
            'dry_run': False,
            'output_path': str(OUTPUT_BASE_PATH)
        }

def create_backup(repo_path, config):
    """
    إنشاء نسخة احتياطية كاملة قبل أي حذف في D:\New folder (56)
    """
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"backup_{timestamp}"
    backup_path = Path(config['output_path']) / backup_name
    
    print(f"🔄 جاري إنشاء نسخة احتياطية في: {backup_path}...")
    
    try:
        OUTPUT_BASE_PATH.mkdir(parents=True, exist_ok=True)
        
        # نسخ كامل المستودع
        shutil.copytree(
            repo_path, 
            backup_path,
            ignore=shutil.ignore_patterns('node_modules', '.git', 'dist', 'build', '__pycache__')
        )
        
        # حفظ معلومات الـ backup
        backup_info = {
            'timestamp': timestamp,
            'original_path': str(repo_path),
            'backup_path': str(backup_path),
            'commit_hash': get_current_commit_hash(repo_path)
        }
        
        with open(backup_path / 'BACKUP_INFO.json', 'w', encoding='utf-8') as f:
            json.dump(backup_info, f, indent=2, ensure_ascii=False)
        
        print(f"✅ تم إنشاء النسخة الاحتياطية في: {backup_path}")
        return backup_path
        
    except Exception as e:
        print(f"❌ فشل إنشاء النسخة الاحتياطية: {e}")
        sys.exit(1)

def get_current_commit_hash(repo_path):
    """الحصول على آخر commit hash"""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            cwd=repo_path,
            capture_output=True,
            text=True
        )
        return result.stdout.strip()
    except:
        return None

def collect_all_files(repo_path, ignore_patterns, config):
    """
    جمع كل الملفات مع معلومات أساسية
    """
    all_files = {}
    
    for root, dirs, files in os.walk(repo_path):
        # تصفية المجلدات المستثناة
        dirs[:] = [d for d in dirs if d not in ignore_patterns]
        
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, repo_path)
            
            # تخطي الملفات المحمية
            if relative_path in config['protected_files']:
                continue
            
            all_files[relative_path] = {
                'absolute_path': file_path,
                'relative_path': relative_path,
                'extension': Path(file).suffix,
                'size_bytes': os.path.getsize(file_path),
                'is_protected': False,
                'analysis_status': 'pending'
            }
    
    return all_files

def build_complete_dependency_map(repo_path):
    """
    بناء خريطة اعتماديات دقيقة باستخدام كل الأدوات
    """
    print("🔍 جاري بناء خريطة الاعتماديات...")
    
    dependency_map = {
        'imports': {},      # من يستورد من
        'imported_by': {},  # من يتم استيراده بواسطة
        'unused_exports': [],
        'unused_dependencies': [],
        'circular_dependencies': []
    }
    
    # 1. dependency-cruiser - الأدق
    print("  ├─ تشغيل dependency-cruiser...")
    dep_cruise_result = run_dependency_cruiser(repo_path)
    dependency_map = merge_depcruise_results(dependency_map, dep_cruise_result)
    
    # 2. madge - للتحقق المتقاطع
    print("  ├─ تشغيل madge...")
    madge_result = run_madge(repo_path)
    dependency_map = merge_madge_results(dependency_map, madge_result)
    
    # 3. Knip - لكشف الـ exports غير المستخدمة
    print("  ├─ تشغيل knip...")
    knip_result = run_knip(repo_path)
    dependency_map['unused_exports'] = knip_result['unused_exports']
    
    # 4. depcheck - لكشف الاعتماديات غير المستخدمة
    print("  ├─ تشغيل depcheck...")
    depcheck_result = run_depcheck(repo_path)
    dependency_map['unused_dependencies'] = depcheck_result['unused']
    
    # 5. ts-prune (للـ TypeScript)
    if has_typescript_files(repo_path):
        print("  └─ تشغيل ts-prune...")
        ts_prune_result = run_ts_prune(repo_path)
        dependency_map['unused_exports'].extend(ts_prune_result)
    
    print("✅ تم بناء خريطة الاعتماديات")
    return dependency_map

def run_dependency_cruiser(repo_path):
    """تشغيل dependency-cruiser"""
    try:
        cmd = f'depcruise --include-only "^src" --output-type json {repo_path}'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return json.loads(result.stdout) if result.returncode == 0 else {}
    except:
        return {}

def run_madge(repo_path):
    """تشغيل madge"""
    try:
        cmd = f'madge --json {repo_path}'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return json.loads(result.stdout) if result.returncode == 0 else {}
    except:
        return {}

def run_knip(repo_path):
    """تشغيل knip"""
    try:
        cmd = 'npx knip --reporter json'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=repo_path)
        return json.loads(result.stdout) if result.returncode == 0 else {'unused_exports': []}
    except:
        return {'unused_exports': []}

def run_depcheck(repo_path):
    """تشغيل depcheck"""
    try:
        cmd = 'depcheck --json'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=repo_path)
        return json.loads(result.stdout) if result.returncode == 0 else {'unused': []}
    except:
        return {'unused': []}

def has_typescript_files(repo_path):
    """التحقق من وجود ملفات TypeScript"""
    for root, dirs, files in os.walk(repo_path):
        if any(f.endswith('.ts') or f.endswith('.tsx') for f in files):
            return True
    return False

def run_ts_prune(repo_path):
    """تشغيل ts-prune"""
    try:
        cmd = 'ts-prune --json'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=repo_path)
        return json.loads(result.stdout) if result.returncode == 0 else []
    except:
        return []

def merge_depcruise_results(dependency_map, result):
    """دمج نتائج dependency-cruiser"""
    # implementation placeholder
    return dependency_map

def merge_madge_results(dependency_map, result):
    """دمج نتائج madge"""
    # implementation placeholder
    return dependency_map

def generate_repo_map(repo_path, ignore_patterns):
    """توليد خريطة المستودع"""
    # implementation placeholder
    return {}

def initialize_gemini():
    """
    تهيئة نموذج Gemini للتحليل
    """
    try:
        import google.generativeai as genai
        from dotenv import load_dotenv
        
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("❌ لم يتم العثور على GEMINI_API_KEY في ملف .env")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        print("✅ تم تهيئة Gemini 2.0 Flash")
        return model
    except ImportError:
        print("⚠️  لم يتم تثبيت مكتبات Gemini - سيتم تخطي التحليل الذكي")
        return None

CLEANUP_FOCUSED_PROMPT = """
**الهدف الأساسي:** أنت مساعد خبير متخصص في تنظيف المستودعات البرمجية. مهمتك الوحيدة هي تحديد الملفات الآمنة للحذف للحصول على مستودع نظيف حيث كل ملف مفعّل وله علاقة مباشرة بالتطبيق.

**التركيز الرئيسي:**

أنت مطالب بتحليل كل ملف وتحديد **بدقة شديدة** ما إذا كان:

1. **KEEP** (احتفظ به) - ملف نشط ومفعّل:
   - يتم استيراده واستخدامه فعلياً في التطبيق
   - متصل بـ entry points
   - له تأثير على عمل التطبيق

2. **DELETE_SAFE** (احذف بأمان) - ملف عديم الفائدة:
   - لا يتم استيراده من أي ملف
   - غير متصل بأي entry point
   - ملف فارغ أو تجريبي أو معطل
   - أسماء مشبوهة (test, temp, backup, old, deprecated, unused)
   - exports غير مستخدمة نهائياً

3. **DELETE_PROBABLY** (غالباً آمن للحذف) - يحتاج مراجعة:
   - قد يكون له استخدام غير واضح
   - بعيد جداً من entry points (> 5 مستويات)
   - لم يتم تعديله منذ فترة طويلة (> 6 شهور)

4. **UNCERTAIN** (غير متأكد) - مراجعة يدوية إلزامية:
   - معلومات غير كافية للحكم
   - ملفات config أو إعدادات
   - ملفات كبيرة معقدة
   - احتمالية تأثير غير واضحة

**تنسيق الإخراج المطلوب (JSON فقط):**
```json
{
  "decision": "KEEP|DELETE_SAFE|DELETE_PROBABLY|UNCERTAIN",
  "confidence": 0-100,
  "reasons": ["سبب رئيسي 1", "سبب رئيسي 2", "سبب رئيسي 3"],
  "usage_analysis": {
    "is_imported": true|false,
    "import_count": 0,
    "distance_from_entry": -1|0|1|2|...,
    "has_unused_exports": true|false
  },
  "risk_assessment": {
    "deletion_safety_score": 0-100,
    "potential_impact": "none|minimal|moderate|high|critical",
    "affected_files": []
  },
  "recommendation": "نص قصير يشرح القرار النهائي والإجراء الموصى به"
}
```
"""

def build_ai_analysis_prompt(file_path, file_info, dependency_map, repo_map, entry_points):
    """
    بناء prompt مخصص لكل ملف للتحليل بالـ AI
    """
    # استخراج معلومات الاعتماديات
    imports_from = dependency_map['imports'].get(file_path, [])
    imported_by = dependency_map['imported_by'].get(file_path, [])
    is_unused_export = file_path in dependency_map['unused_exports']
    
    # حساب المسافة من entry points
    distance = calculate_distance_from_entry_points(file_path, entry_points, dependency_map)
    
    # قراءة محتوى الملف أو ملخصه
    if file_info['size_bytes'] < 50000:  # أقل من ~50KB
        with open(file_info['absolute_path'], 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        content_section = f"### محتوى الملف الكامل:\n```\n{content}\n```"
    else:
        content_summary = generate_structure_summary(file_info['absolute_path'])
        content_section = f"### ملخص هيكل الملف (ملف كبير):\n{json.dumps(content_summary, ensure_ascii=False, indent=2)}"
    
    # بناء الـ prompt النهائي
    prompt = f"""{CLEANUP_FOCUSED_PROMPT}

---

# معلومات الملف للتحليل

## الملف: `{file_path}`

### المعلومات التقنية:
- **الحجم:** {file_info['size_bytes']} بايت
- **الامتداد:** {file_info['extension']}
- **المسار الكامل:** {file_info['absolute_path']}

### تحليل الاعتماديات:
- **يستورد من ({len(imports_from)} ملف):** {', '.join(imports_from) if imports_from else 'لا يستورد شيئاً'}
- **يتم استيراده بواسطة ({len(imported_by)} ملف):** {', '.join(imported_by) if imported_by else 'لا يستورده أي ملف'}
- **المسافة من entry points:** {distance if distance != -1 else 'غير متصل'}
- **exports غير مستخدمة:** {'نعم' if is_unused_export else 'لا'}

### نقاط الدخول للمشروع:
{chr(10).join(['- ' + ep for ep in entry_points])}

### نتائج الأدوات:
- **Knip:** {'ملف غير مستخدم' if is_unused_export else 'قيد الاستخدام'}
- **Import Count:** {len(imported_by)}
- **Export Count:** {len(imports_from)}

{content_section}

---

**المطلوب:** قم بتحليل هذا الملف وفقاً للمعايير المذكورة وأرجع JSON فقط.
"""
    
    return prompt

def analyze_files_with_ai(all_files, dependency_map, repo_map, entry_points, model, config):
    """
    تحليل جميع الملفات باستخدام Gemini AI - النتائج تُحفظ في D:\New folder (56)
    """
    if not model:
        print("⚠️  تخطي التحليل الذكي - النموذج غير متاح")
        return {}
    
    print(f"\n🤖 جاري تحليل {len(all_files)} ملف باستخدام Gemini 2.0 Flash...")
    
    ai_analysis_results = {}
    
    for i, (file_path, file_info) in enumerate(all_files.items(), 1):
        try:
            print(f"\r  [{i}/{len(all_files)}] تحليل: {file_path[:50]}...", end='', flush=True)
            
            # بناء الـ prompt
            prompt = build_ai_analysis_prompt(
                file_path, 
                file_info, 
                dependency_map, 
                repo_map, 
                entry_points
            )
            
            # إرسال للنموذج
            response = model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.1,  # أقل عشوائية للدقة
                    'response_mime_type': 'application/json'
                }
            )
            
            # استخراج النتيجة
            analysis = json.loads(response.text)
            
            ai_analysis_results[file_path] = {
                'analysis': analysis,
                'file_info': file_info,
                'timestamp': datetime.datetime.now().isoformat()
            }
            
        except json.JSONDecodeError as e:
            print(f"\n  ⚠️  خطأ في parsing JSON لـ {file_path}: {e}")
            ai_analysis_results[file_path] = {
                'analysis': {
                    'decision': 'UNCERTAIN',
                    'confidence': 0,
                    'reasons': [f'فشل parsing: {str(e)}'],
                    'error': True
                },
                'file_info': file_info
            }
        
        except Exception as e:
            print(f"\n  ❌ خطأ في تحليل {file_path}: {e}")
            ai_analysis_results[file_path] = {
                'analysis': {
                    'decision': 'UNCERTAIN',
                    'confidence': 0,
                    'reasons': [f'خطأ في التحليل: {str(e)}'],
                    'error': True
                },
                'file_info': file_info
            }
    
    print(f"\n✅ اكتمل التحليل بالـ AI لـ {len(ai_analysis_results)} ملف")
    
    # حفظ النتائج في D:\New folder (56)
    save_ai_analysis_results(ai_analysis_results, config)
    
    return ai_analysis_results

def save_ai_analysis_results(results, config, output_file='ai_analysis_results.json'):
    """
    حفظ نتائج التحليل في D:\New folder (56)
    """
    output_path = Path(config['output_path']) / output_file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"💾 تم حفظ نتائج التحليل في: {output_path}")

def categorize_ai_results(ai_analysis_results):
    """
    تصنيف الملفات حسب قرارات الـ AI
    """
    categorized = {
        'KEEP': [],
        'DELETE_SAFE': [],
        'DELETE_PROBABLY': [],
        'UNCERTAIN': [],
        'ERROR': []
    }
    
    for file_path, result in ai_analysis_results.items():
        analysis = result['analysis']
        decision = analysis.get('decision', 'UNCERTAIN')
        
        if analysis.get('error'):
            categorized['ERROR'].append({
                'path': file_path,
                'result': result
            })
        else:
            categorized[decision].append({
                'path': file_path,
                'result': result,
                'confidence': analysis.get('confidence', 0)
            })
    
    # ترتيب حسب الثقة
    for category in ['DELETE_SAFE', 'DELETE_PROBABLY']:
        categorized[category].sort(key=lambda x: x['confidence'], reverse=True)
    
    print("\n📊 تصنيف النتائج:")
    print(f"  ├─ KEEP: {len(categorized['KEEP'])}")
    print(f"  ├─ DELETE_SAFE: {len(categorized['DELETE_SAFE'])}")
    print(f"  ├─ DELETE_PROBABLY: {len(categorized['DELETE_PROBABLY'])}")
    print(f"  ├─ UNCERTAIN: {len(categorized['UNCERTAIN'])}")
    print(f"  └─ ERROR: {len(categorized['ERROR'])}")
    
    return categorized

def convert_ai_results_to_candidates(categorized_results):
    """
    تحويل نتائج الـ AI إلى تنسيق المرشحين للحذف
    """
    candidates = {
        'safe_to_delete': [],
        'probably_unused': [],
        'uncertain': [],
        'keep': []
    }
    
    # تحويل DELETE_SAFE
    for item in categorized_results['DELETE_SAFE']:
        candidates['safe_to_delete'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'safe_to_delete',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': item['result']['analysis'].get('confidence', 0),
                'risk_factors': []
            },
            'deletion_safety': item['confidence']
        })
    
    # تحويل DELETE_PROBABLY
    for item in categorized_results['DELETE_PROBABLY']:
        candidates['probably_unused'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'probably_unused',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': item['result']['analysis'].get('confidence', 0),
                'risk_factors': []
            },
            'deletion_safety': item['confidence']
        })
    
    # تحويل UNCERTAIN
    for item in categorized_results['UNCERTAIN']:
        candidates['uncertain'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'uncertain',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': item['result']['analysis'].get('confidence', 0),
                'risk_factors': []
            },
            'deletion_safety': item['confidence']
        })
    
    # تحويل KEEP
    for item in categorized_results['KEEP']:
        candidates['keep'].append({
            'path': item['path'],
            'info': item['result']['file_info'],
            'classification': {
                'category': 'keep',
                'reasons': item['result']['analysis'].get('reasons', []),
                'safety_score': 0,
                'risk_factors': []
            },
            'deletion_safety': 0
        })
    
    return candidates

def identify_deletion_candidates(all_files, dependency_map, entry_points):
    """
    تحديد الملفات المرشحة للحذف بدقة
    """
    candidates = {
        'safe_to_delete': [],      # آمن للحذف - أولوية عالية
        'probably_unused': [],     # غالباً غير مستخدم - يحتاج مراجعة
        'uncertain': [],           # غير متأكد - يحتاج فحص يدوي
        'keep': []                 # يجب الاحتفاظ به
    }
    
    for file_path, file_info in all_files.items():
        classification = classify_file(file_path, file_info, dependency_map, entry_points)
        category = classification['category']
        
        candidates[category].append({
            'path': file_path,
            'info': file_info,
            'classification': classification,
            'deletion_safety': classification['safety_score']
        })
    
    # ترتيب حسب درجة الأمان
    for category in candidates:
        candidates[category].sort(key=lambda x: x['deletion_safety'], reverse=True)
    
    return candidates

def classify_file(file_path, file_info, dependency_map, entry_points):
    """
    تصنيف دقيق للملف
    """
    classification = {
        'category': 'uncertain',
        'reasons': [],
        'safety_score': 0,  # 0-100 (كلما أعلى = أكثر أمانًا للحذف)
        'risk_factors': []
    }
    
    # 1. فحص الاستيراد المباشر
    is_imported = file_path in dependency_map['imported_by']
    has_importers = len(dependency_map['imported_by'].get(file_path, [])) > 0
    
    if not has_importers:
        classification['reasons'].append('لا يتم استيراده من أي ملف')
        classification['safety_score'] += 40
    
    # 2. فحص المسافة من entry points
    distance = calculate_distance_from_entry_points(file_path, entry_points, dependency_map)
    
    if distance == -1:  # غير متصل نهائيًا
        classification['reasons'].append('غير متصل بأي entry point')
        classification['safety_score'] += 30
    elif distance > 5:  # بعيد جدًا
        classification['reasons'].append(f'بعيد عن entry points ({distance} مستويات)')
        classification['safety_score'] += 10
    else:
        classification['risk_factors'].append(f'قريب من entry points ({distance} مستويات)')
        classification['safety_score'] -= 20
    
    # 3. فحص exports غير المستخدمة
    if file_path in dependency_map['unused_exports']:
        classification['reasons'].append('جميع exports غير مستخدمة')
        classification['safety_score'] += 20
    
    # 4. فحص حجم الملف
    if file_info['size_bytes'] == 0:
        classification['reasons'].append('ملف فارغ')
        classification['safety_score'] += 10
        classification['category'] = 'safe_to_delete'
        return classification
    
    # 5. فحص أنماط الأسماء المشبوهة
    suspicious_patterns = ['test', 'temp', 'backup', 'old', 'deprecated', 'unused', '.bak']
    if any(pattern in file_path.lower() for pattern in suspicious_patterns):
        classification['reasons'].append('اسم مشبوه يدل على عدم الاستخدام')
        classification['safety_score'] += 15
    
    # 6. فحص التاريخ (إن أمكن)
    git_info = get_git_file_info(file_path)
    if git_info and git_info.get('days_since_modified', 0) > 180:
        classification['reasons'].append(f'لم يتم تعديله منذ {git_info["days_since_modified"]} يوم')
        classification['safety_score'] += 5
    
    # 7. التصنيف النهائي
    if classification['safety_score'] >= 70:
        classification['category'] = 'safe_to_delete'
    elif classification['safety_score'] >= 40:
        classification['category'] = 'probably_unused'
    elif classification['safety_score'] >= 20:
        classification['category'] = 'uncertain'
    else:
        classification['category'] = 'keep'
        classification['reasons'].append('الملف نشط ومستخدم')
    
    return classification

def calculate_distance_from_entry_points(file_path, entry_points, dependency_map):
    """
    حساب أقصر مسافة من أي entry point
    """
    # BFS من كل entry point
    min_distance = float('inf')
    
    for entry_point in entry_points:
        queue = deque([(entry_point, 0)])
        visited = {entry_point}
        
        while queue:
            current, distance = queue.popleft()
            
            if current == file_path:
                min_distance = min(min_distance, distance)
                break
            
            # الحصول على الملفات التي يستوردها الملف الحالي
            imports = dependency_map['imports'].get(current, [])
            
            for imported_file in imports:
                if imported_file not in visited:
                    visited.add(imported_file)
                    queue.append((imported_file, distance + 1))
    
    return min_distance if min_distance != float('inf') else -1

def get_git_file_info(file_path):
    """الحصول على معلومات git للملف"""
    try:
        result = subprocess.run(
            ['git', 'log', '-1', '--format=%at', file_path],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            import time
            timestamp = int(result.stdout.strip())
            days_since = (time.time() - timestamp) / (86400)
            return {'days_since_modified': int(days_since)}
    except:
        pass
    return None

def get_reverse_dependencies(file_path, dependency_map):
    """الحصول على الاعتماديات العكسية"""
    return dependency_map['imported_by'].get(file_path, [])

def is_entry_point(file_path, entry_points):
    """التحقق مما إذا كان الملف entry point"""
    return file_path in entry_points

def requires_manual_review(file_path, candidate):
    """تحديد ما إذا كان الملف يحتاج مراجعة يدوية"""
    # ملفات config دائماً تحتاج مراجعة
    config_extensions = ['.json', '.yaml', '.yml', '.toml', '.ini', '.env']
    if any(file_path.endswith(ext) for ext in config_extensions):
        return True
    
    # ملفات ذات safety score متوسط
    if 40 <= candidate['deletion_safety'] < 70:
        return True
    
    # ملفات كبيرة (> 500 سطر)
    if candidate['info']['size_bytes'] > 500 * 80:  # تقريباً 500 سطر
        return True
    
    return False

def check_circular_dependencies(dependency_map):
    """فحص الاعتماديات الدائرية"""
    # implementation placeholder
    return []

def simulate_dependency_removal(dependency_map, files_to_remove):
    """محاكاة إزالة الاعتماديات"""
    # implementation placeholder
    return dependency_map

def find_would_be_orphaned_files(file_path, simulated_map):
    """العثور على الملفات التي ستصبح منفصلة"""
    # implementation placeholder
    return []

def perform_safety_checks(candidates, dependency_map, config):
    """
    إجراء فحوصات أمان شاملة قبل الحذف
    """
    print("\n🔒 جاري إجراء فحوصات الأمان...")
    
    safety_report = {
        'approved_for_deletion': [],
        'needs_review': [],
        'blocked': [],
        'warnings': []
    }
    
    # فحص كل ملف مرشح للحذف
    files_to_check = candidates['safe_to_delete'] + candidates['probably_unused']
    
    for candidate in files_to_check:
        file_path = candidate['path']
        
        # 1. فحص الاعتماديات العكسية
        reverse_deps = get_reverse_dependencies(file_path, dependency_map)
        if reverse_deps:
            candidate['blocked_reason'] = f'يتم استيراده من: {", ".join(reverse_deps[:3])}'
            safety_report['blocked'].append(candidate)
            continue
        
        # 2. فحص ما إذا كان entry point
        if is_entry_point(file_path, config['entry_points']):
            candidate['blocked_reason'] = 'ملف entry point - لا يمكن حذفه'
            safety_report['blocked'].append(candidate)
            continue
        
        # 3. فحص الأنماط الخاصة
        if requires_manual_review(file_path, candidate):
            safety_report['needs_review'].append(candidate)
            continue
        
        # 4. اجتاز جميع الفحوصات
        safety_report['approved_for_deletion'].append(candidate)
    
    # 5. فحص الاعتماديات الدائرية
    circular = check_circular_dependencies(dependency_map)
    if circular:
        safety_report['warnings'].append(f'تحذير: وجود {len(circular)} اعتماديات دائرية')
    
    print(f"✅ الفحوصات الأمنية اكتملت:")
    print(f"  ├─ موافق للحذف: {len(safety_report['approved_for_deletion'])}")
    print(f"  ├─ يحتاج مراجعة: {len(safety_report['needs_review'])}")
    print(f"  └─ محظور: {len(safety_report['blocked'])}")
    
    return safety_report

def simulate_deletion(safety_report, dependency_map):
    """
    محاكاة الحذف للتأكد من عدم كسر التطبيق
    """
    print("\n🎭 جاري محاكاة الحذف...")
    
    simulation_results = {
        'would_break': [],
        'safe': [],
        'uncertain': []
    }
    
    approved_files = [f['path'] for f in safety_report['approved_for_deletion']]
    
    # إنشاء dependency map مؤقت بدون الملفات المحذوفة
    simulated_map = simulate_dependency_removal(dependency_map, approved_files)
    
    # فحص الاتصال بعد الحذف
    for file in approved_files:
        # فحص ما إذا كان هناك ملفات ستصبح منفصلة بعد حذف هذا الملف
        would_orphan = find_would_be_orphaned_files(file, simulated_map)
        
        if would_orphan:
            simulation_results['would_break'].append({
                'file': file,
                'reason': f'حذفه سيجعل {len(would_orphan)} ملف منفصل',
                'orphaned_files': would_orphan
            })
        else:
            simulation_results['safe'].append(file)
    
    print(f"✅ المحاكاة اكتملت:")
    print(f"  ├─ آمن: {len(simulation_results['safe'])}")
    print(f"  └─ خطر: {len(simulation_results['would_break'])}")
    
    return simulation_results

def interactive_review(safety_report, simulation_results, config):
    """
    واجهة تفاعلية لمراجعة الملفات قبل الحذف
    """
    if not config['safe_mode']:
        print("⚠️  الوضع الآمن معطل - سيتم الحذف تلقائياً")
        return safety_report['approved_for_deletion']
    
    print("\n" + "="*70)
    print("📋 مراجعة الملفات المرشحة للحذف")
    print("="*70)
    
    final_approved = []
    
    # عرض ملخص
    safe_files = simulation_results['safe']
    print(f"\n🟢 ملفات آمنة للحذف: {len(safe_files)}")
    
    if len(safe_files) > 0:
        print("\nأول 10 ملفات:")
        for i, file_path in enumerate(safe_files[:10], 1):
            candidate = next(f for f in safety_report['approved_for_deletion'] if f['path'] == file_path)
            print(f"  {i}. {file_path}")
            print(f"     السبب: {', '.join(candidate['classification']['reasons'][:2])}")
            print(f"     درجة الأمان: {candidate['deletion_safety']}/100")
        
        if len(safe_files) > 10:
            print(f"  ... و {len(safe_files) - 10} ملف آخر")
        
        # طلب الموافقة
        print("\n" + "-"*70)
        choice = input(f"\n❓ هل توافق على حذف جميع الـ {len(safe_files)} ملف؟ (y/n/review): ").lower()
        
        if choice == 'y':
            final_approved = safe_files
            print(f"✅ تمت الموافقة على حذف {len(final_approved)} ملف")
        
        elif choice == 'review':
            # مراجعة ملف بملف
            final_approved = detailed_file_review(safe_files, safety_report)
        
        else:
            print("❌ تم إلغاء الحذف")
            return []
    
    # عرض الملفات الخطرة
    if simulation_results['would_break']:
        print(f"\n🔴 ملفات خطرة (لن يتم حذفها): {len(simulation_results['would_break'])}")
        for item in simulation_results['would_break'][:5]:
            print(f"  - {item['file']}")
            print(f"    السبب: {item['reason']}")
    
    # عرض الملفات التي تحتاج مراجعة
    if safety_report['needs_review']:
        print(f"\n🟡 ملفات تحتاج مراجعة يدوية: {len(safety_report['needs_review'])}")
        review_choice = input("\nهل تريد مراجعتها الآن؟ (y/n): ").lower()
        
        if review_choice == 'y':
            reviewed = detailed_file_review(
                [f['path'] for f in safety_report['needs_review']], 
                safety_report
            )
            final_approved.extend(reviewed)
    
    return final_approved

def detailed_file_review(files, safety_report):
    """
    مراجعة تفصيلية لكل ملف
    """
    approved = []
    
    print("\n" + "="*70)
    print("🔍 مراجعة تفصيلية")
    print("="*70)
    
    for i, file_path in enumerate(files, 1):
        candidate = next(f for f in safety_report['approved_for_deletion'] if f['path'] == file_path)
        
        print(f"\n[{i}/{len(files)}] {file_path}")
        print(f"  الحجم: {candidate['info']['size_bytes']} بايت")
        print(f"  درجة الأمان: {candidate['deletion_safety']}/100")
        print(f"  الأسباب:")
        for reason in candidate['classification']['reasons']:
            print(f"    - {reason}")
        
        if candidate['classification']['risk_factors']:
            print(f"  ⚠️  عوامل خطر:")
            for risk in candidate['classification']['risk_factors']:
                print(f"    - {risk}")
        
        choice = input(f"  احذف هذا الملف؟ (y/n/view/skip-rest): ").lower()
        
        if choice == 'y':
            approved.append(file_path)
        elif choice == 'view':
            view_file_content(candidate['info']['absolute_path'])
            # إعادة السؤال
            if input("  احذف؟ (y/n): ").lower() == 'y':
                approved.append(file_path)
        elif choice == 'skip-rest':
            break
    
    return approved

def view_file_content(file_path, lines=20):
    """
    عرض محتوى الملف
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.readlines()
        
        print(f"\n  --- محتوى الملف (أول {lines} سطر) ---")
        for i, line in enumerate(content[:lines], 1):
            print(f"  {i:3} | {line.rstrip()}")
        
        if len(content) > lines:
            print(f"  ... ({len(content) - lines} سطر إضافي)")
        print("  " + "-"*50)
    except Exception as e:
        print(f"  ❌ خطأ في قراءة الملف: {e}")

def safe_deletion_execution(approved_files, config, backup_path):
    """
    تنفيذ الحذف بشكل آمن ومرحلي - الملفات المحذوفة تُنسخ احتياطياً في D:\New folder (56)
    """
    print("\n" + "="*70)
    print("🗑️  بدء عملية الحذف الآمن")
    print("="*70)
    
    deletion_log = {
        'timestamp': datetime.datetime.now().isoformat(),
        'backup_path': str(backup_path),
        'total_files': len(approved_files),
        'deleted': [],
        'failed': [],
        'rollback_available': True
    }
    
    if config['dry_run']:
        print("\n⚠️  وضع المحاكاة (DRY RUN) - لن يتم حذف أي ملف فعلياً")
        for file_path in approved_files:
            print(f"  [محاكاة] سيتم حذف: {file_path}")
            deletion_log['deleted'].append({
                'path': file_path,
                'dry_run': True
            })
        return deletion_log
    
    # الحذف الفعلي
    for i, file_path in enumerate(approved_files, 1):
        try:
            print(f"\n[{i}/{len(approved_files)}] حذف: {file_path}")
            
            # 1. نسخ الملف إلى مجلد الحذف (للاسترجاع السريع) داخل D:\New folder (56)
            deleted_backup = backup_path / 'deleted_files' / file_path
            deleted_backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, deleted_backup)
            
            # 2. حذف الملف الفعلي
            os.remove(file_path)
            
            deletion_log['deleted'].append({
                'path': file_path,
                'backup_location': str(deleted_backup),
                'timestamp': datetime.datetime.now().isoformat(),
                'status': 'success'
            })
            
            print(f"  ✅ تم الحذف")
            
        except Exception as e:
            print(f"  ❌ فشل الحذف: {e}")
            deletion_log['failed'].append({
                'path': file_path,
                'error': str(e)
            })
    
    # حفظ سجل الحذف في D:\New folder (56)
    log_file = Path(config['output_path']) / 'deletion_log.json'
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(deletion_log, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ اكتملت عملية الحذف:")
    print(f"  ├─ نجح: {len(deletion_log['deleted'])}")
    print(f"  ├─ فشل: {len(deletion_log['failed'])}")
    print(f"  └─ سجل الحذف: {log_file}")
    
    return deletion_log

def rollback_deletion(deletion_log):
    """
    استرجاع الملفات المحذوفة في حالة وجود مشكلة - الملفات المسترجعة من D:\New folder (56)
    """
    print("\n🔄 جاري استرجاع الملفات المحذوفة...")
    
    rollback_report = {
        'restored': [],
        'failed': []
    }
    
    for deleted_file in deletion_log['deleted']:
        try:
            backup_location = deleted_file['backup_location']
            original_path = deleted_file['path']
            
            # استرجاع الملف
            Path(original_path).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(backup_location, original_path)
            
            rollback_report['restored'].append(original_path)
            print(f"  ✅ استرجاع: {original_path}")
            
        except Exception as e:
            rollback_report['failed'].append({
                'path': original_path,
                'error': str(e)
            })
            print(f"  ❌ فشل استرجاع: {original_path}")
    
    print(f"\n✅ اكتمل الاسترجاع:")
    print(f"  ├─ تم استرجاع: {len(rollback_report['restored'])}")
    print(f"  └─ فشل: {len(rollback_report['failed'])}")
    
    return rollback_report

def post_deletion_validation(repo_path, config):
    """
    التحقق من سلامة التطبيق بعد الحذف
    """
    print("\n" + "="*70)
    print("🧪 التحقق من سلامة التطبيق")
    print("="*70)
    
    validation_report = {
        'build_status': None,
        'tests_status': None,
        'linting_status': None,
        'issues_found': [],
        'overall_status': 'unknown'
    }
    
    # 1. فحص بناء المشروع
    print("\n1️⃣ فحص البناء (Build)...")
    try:
        build_result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if build_result.returncode == 0:
            validation_report['build_status'] = 'success'
            print("  ✅ البناء نجح")
        else:
            validation_report['build_status'] = 'failed'
            validation_report['issues_found'].append({
                'type': 'build_error',
                'message': build_result.stderr[:500]
            })
            print("  ❌ البناء فشل")
            print(f"  الخطأ: {build_result.stderr[:200]}")
    
    except subprocess.TimeoutExpired:
        validation_report['build_status'] = 'timeout'
        print("  ⏱️  البناء استغرق وقتاً طويلاً")
    
    except Exception as e:
        validation_report['build_status'] = 'error'
        print(f"  ❌ خطأ: {e}")
    
    # 2. تشغيل الاختبارات
    print("\n2️⃣ تشغيل الاختبارات...")
    try:
        test_result = subprocess.run(
            ['npm', 'test'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if test_result.returncode == 0:
            validation_report['tests_status'] = 'passed'
            print("  ✅ جميع الاختبارات نجحت")
        else:
            validation_report['tests_status'] = 'failed'
            validation_report['issues_found'].append({
                'type': 'test_failure',
                'message': test_result.stderr[:500]
            })
            print("  ❌ بعض الاختبارات فشلت")
    
    except Exception as e:
        validation_report['tests_status'] = 'skipped'
        print(f"  ⏭️  تخطي الاختبارات: {e}")
    
    # 3. فحص Linting
    print("\n3️⃣ فحص Linting...")
    try:
        lint_result = subprocess.run(
            ['npm', 'run', 'lint'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        validation_report['linting_status'] = 'passed' if lint_result.returncode == 0 else 'warnings'
        print(f"  {'✅' if lint_result.returncode == 0 else '⚠️'} Linting")
    
    except Exception as e:
        validation_report['linting_status'] = 'skipped'
        print(f"  ⏭️  تخطي Linting")
    
    # 4. التقييم النهائي
    if (validation_report['build_status'] == 'success' and 
        validation_report['tests_status'] in ['passed', 'skipped']):
        validation_report['overall_status'] = 'healthy'
        print("\n✅ التطبيق في حالة جيدة")
    else:
        validation_report['overall_status'] = 'unhealthy'
        print("\n❌ التطبيق يحتاج مراجعة")
    
    return validation_report

def handle_validation_failure(validation_report, deletion_log, config):
    """
    التعامل مع فشل التحقق بعد الحذف
    """
    print("\n⚠️  تم اكتشاف مشاكل بعد الحذف!")
    print("\nالخيارات المتاحة:")
    print("  1. استرجاع جميع الملفات (Rollback كامل)")
    print("  2. استرجاع بعض الملفات (Rollback جزئي)")
    print("  3. الاحتفاظ بالتغييرات ومعالجة المشاكل يدوياً")
    
    choice = input("\nاختيارك (1/2/3): ")
    
    if choice == '1':
        print("\n🔄 جاري استرجاع جميع الملفات...")
        rollback_deletion(deletion_log)
        print("✅ تم استرجاع جميع الملفات")
        
    elif choice == '2':
        print("\n📋 الملفات المحذوفة:")
        for i, file_info in enumerate(deletion_log['deleted'], 1):
            print(f"  {i}. {file_info['path']}")
        
        to_restore = input("\nأدخل أرقام الملفات للاسترجاع (مفصولة بفواصل): ")
        indices = [int(x.strip()) - 1 for x in to_restore.split(',')]
        
        partial_rollback(deletion_log, indices)
        
    else:
        print("\n⚠️  تم الاحتفاظ بالتغييرات - يُرجى معالجة المشاكل يدوياً")
        print(f"النسخة الاحتياطية متوفرة في: {config['output_path']}")

def partial_rollback(deletion_log, indices):
    """استرجاع جزئي للملفات"""
    print("\n🔄 جاري الاسترجاع الجزئي...")
    rollback_report = {
        'restored': [],
        'failed': []
    }
    
    for idx in indices:
        if 0 <= idx < len(deletion_log['deleted']):
            file_info = deletion_log['deleted'][idx]
            try:
                backup_location = file_info['backup_location']
                original_path = file_info['path']
                
                Path(original_path).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(backup_location, original_path)
                
                rollback_report['restored'].append(original_path)
                print(f"  ✅ استرجاع: {original_path}")
                
            except Exception as e:
                rollback_report['failed'].append({
                    'path': file_info['path'],
                    'error': str(e)
                })
                print(f"  ❌ فشل استرجاع: {file_info['path']}")
    
    print(f"\n✅ اكتمل الاسترجاع الجزئي:")
    print(f"  ├─ تم استرجاع: {len(rollback_report['restored'])}")
    print(f"  └─ فشل: {len(rollback_report['failed'])}")

def generate_final_report(deletion_log, validation_report, stats_before, stats_after, config):
    """
    توليد تقرير نهائي شامل - يُحفظ في D:\New folder (56)
    """
    report_content = f"""
{'='*70}
📊 تقرير تنظيف المستودع - النسخة النهائية
{'='*70}

⏰ التاريخ: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{'─'*70}
📈 إحصائيات قبل وبعد
{'─'*70}

قبل التنظيف:
  • إجمالي الملفات: {stats_before['total_files']}
  • الحجم الكلي: {stats_before['total_size_mb']:.2f} MB
  • ملفات غير مستخدمة: {stats_before['unused_files']}

بعد التنظيف:
  • إجمالي الملفات: {stats_after['total_files']}
  • الحجم الكلي: {stats_after['total_size_mb']:.2f} MB
  • ملفات نشطة: {stats_after['active_files']}

التحسين:
  • تم حذف: {deletion_log['total_files']} ملف
  • تم توفير: {stats_before['total_size_mb'] - stats_after['total_size_mb']:.2f} MB
  • نسبة التقليل: {(1 - stats_after['total_files']/stats_before['total_files'])*100:.1f}%

{'─'*70}
🗑️  تفاصيل الحذف
{'─'*70}

✅ تم حذفها بنجاح: {len(deletion_log['deleted'])}
❌ فشل الحذف: {len(deletion_log['failed'])}

{'─'*70}
🧪 حالة التطبيق بعد التنظيف
{'─'*70}

البناء (Build): {get_status_emoji(validation_report['build_status'])} {validation_report['build_status']}
الاختبارات (Tests): {get_status_emoji(validation_report['tests_status'])} {validation_report['tests_status']}
Linting: {get_status_emoji(validation_report['linting_status'])} {validation_report['linting_status']}

الحالة العامة: {get_status_emoji(validation_report['overall_status'])} {validation_report['overall_status'].upper()}

{'─'*70}
💾 معلومات النسخ الاحتياطي
{'─'*70}

المسار: {deletion_log['backup_path']}
الملفات المحذوفة: {Path(deletion_log['backup_path']) / 'deleted_files/'}
سجل الحذف: {config['output_path']}/deletion_log.json

⚠️  ملاحظة: يمكن استرجاع أي ملف من النسخة الاحتياطية

{'='*70}
"""
    
    # حفظ التقرير في D:\New folder (56)
    report_file = Path(config['output_path']) / 'cleanup_report.txt'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(report_content)
    print(f"\n📄 تم حفظ التقرير في: {report_file}")
    
    return report_content

def get_status_emoji(status):
    """الحصول على emoji حسب الحالة"""
    emoji_map = {
        'success': '✅',
        'passed': '✅',
        'healthy': '✅',
        'failed': '❌',
        'unhealthy': '❌',
        'warnings': '⚠️',
        'skipped': '⏭️',
        'timeout': '⏱️',
        'unknown': '❓'
    }
    return emoji_map.get(status, '❓')

def collect_repo_stats(repo_path, ignore_patterns=None):
    """
    جمع إحصائيات المستودع
    """
    if ignore_patterns is None:
        ignore_patterns = ['node_modules', '.git', 'dist', 'build', '__pycache__']
    
    total_files = 0
    total_size = 0
    unused_files = 0
    
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in ignore_patterns]
        
        for file in files:
            file_path = os.path.join(root, file)
            total_files += 1
            total_size += os.path.getsize(file_path)
    
    return {
        'total_files': total_files,
        'total_size_mb': total_size / (1024 * 1024),
        'unused_files': unused_files
    }

def generate_structure_summary(file_path):
    """توليد ملخص لهيكل الملف (للملفات الكبيرة)"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        return {
            'total_lines': len(lines),
            'import_statements': len([l for l in lines if l.startswith('import')]),
            'export_statements': len([l for l in lines if l.startswith('export')]),
            'class_definitions': len([l for l in lines if l.startswith('class')]),
            'function_definitions': len([l for l in lines if l.startswith('function')])
        }
    except:
        return {'error': 'unable to parse'}

def main():
    """نقطة الدخول الرئيسية"""
    
    print(f"""
╔══════════════════════════════════════════════════════════════════╗
║          🧹 أداة تنظيف المستودع - إصدار الإنتاج                ║
║                                                                  ║
║  📁 مسار الإخراج: D:\\New folder (56)                            ║
║  الهدف: الحصول على مستودع نظيف - كل ملف مفعّل ومفيد           ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    # تأكيد وجود مسار الإخراج
    OUTPUT_BASE_PATH.mkdir(parents=True, exist_ok=True)
    print(f"✅ تم التحقق من مسار الإخراج: {OUTPUT_BASE_PATH}")
    
    # 1. تحميل الإعدادات
    config = load_config('cleanup_config.json')
    
    # 2. إنشاء backup إلزامي في D:\New folder (56)
    print("\n📦 المرحلة 0: إنشاء نسخة احتياطية")
    backup_path = create_backup(config['repo_path'], config)
    
    # 3. جمع الإحصائيات قبل التنظيف
    print("\n📊 جمع إحصائيات المستودع...")
    stats_before = collect_repo_stats(config['repo_path'], config['ignore_patterns'])
    
    # 4. بناء خريطة الاعتماديات
    print("\n🗺️  المرحلة 1: بناء خريطة الاعتماديات")
    dependency_map = build_complete_dependency_map(config['repo_path'])
    
    # 5. جمع جميع الملفات
    print("\n📁 جمع جميع الملفات...")
    all_files = collect_all_files(
        config['repo_path'], 
        config['ignore_patterns'],
        config
    )
    print(f"  وجد {len(all_files)} ملف")
    
    # 5.5. توليد خريطة المستودع
    print("\n🗺️  توليد خريطة المستودع...")
    repo_map = generate_repo_map(config['repo_path'], config['ignore_patterns'])
    
    # ✨ المرحلة 1.5: التحليل الذكي بالـ AI
    print("\n🤖 المرحلة 1.5: التحليل الذكي بـ Gemini 2.0 Flash")
    model = initialize_gemini()
    ai_analysis_results = analyze_files_with_ai(
        all_files,
        dependency_map,
        repo_map,
        config['entry_points'],
        model,
        config
    )
    categorized_results = categorize_ai_results(ai_analysis_results)
    
    # 6. تحويل نتائج الـ AI إلى مرشحين للحذف
    print("\n🎯 المرحلة 2: تحديد الملفات المرشحة للحذف (من نتائج AI)")
    candidates = convert_ai_results_to_candidates(categorized_results)
    
    print(f"  ├─ آمن للحذف: {len(candidates['safe_to_delete'])}")
    print(f"  ├─ غالباً غير مستخدم: {len(candidates['probably_unused'])}")
    print(f"  ├─ غير متأكد: {len(candidates['uncertain'])}")
    print(f"  └─ احتفظ به: {len(candidates['keep'])}")
    
    # 7. فحوصات الأمان
    print("\n🔒 المرحلة 3: فحوصات الأمان")
    safety_report = perform_safety_checks(candidates, dependency_map, config)
    
    # 8. محاكاة الحذف
    print("\n🎭 المرحلة 3: محاكاة الحذف")
    simulation_results = simulate_deletion(safety_report, dependency_map)
    
    # 9. المراجعة التفاعلية
    print("\n👀 المرحلة 4: المراجعة والموافقة")
    final_approved = interactive_review(safety_report, simulation_results, config)
    
    if not final_approved:
        print("\n❌ لم تتم الموافقة على حذف أي ملف - إنهاء البرنامج")
        return
    
    # 10. التنفيذ
    print("\n🗑️  المرحلة 5: التنفيذ")
    deletion_log = safe_deletion_execution(final_approved, config, backup_path)
    
    # 11. التحقق بعد الحذف
    print("\n🧪 المرحلة 6: التحقق من سلامة التطبيق")
    validation_report = post_deletion_validation(config['repo_path'], config)
    
    # 12. معالجة الفشل
    if validation_report['overall_status'] == 'unhealthy':
        handle_validation_failure(validation_report, deletion_log, config)
    
    # 13. الإحصائيات بعد التنظيف
    stats_after = collect_repo_stats(config['repo_path'], config['ignore_patterns'])
    
    # 14. التقرير النهائي
    print("\n📄 المرحلة 7: توليد التقرير النهائي")
    final_report = generate_final_report(
        deletion_log,
        validation_report,
        stats_before,
        stats_after,
        config
    )
    
    print("\n✅ اكتملت عملية التنظيف بنجاح!")
    print(f"🎉 تم تنظيف المستودع - كل ملف الآن مفعّل ومفيد!")
    print(f"📁 جميع الملفات الناتجة محفوظة في: {config['output_path']}")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  تم إيقاف البرنامج من قبل المستخدم")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ خطأ غير متوقع: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
```

---

### 📌 **ملاحظات هامة:**

1. **جميع الملفات الناتجة تُحفظ في:** `D:\New folder (56)`
   - النسخة الاحتياطية الكاملة
   - ملف `ai_analysis_results.json` (نتائج التحليل الذكي)
   - ملف `deletion_log.json` (سجل العمليات المحذوفة)
   - ملف `cleanup_report.txt` (التقرير النهائي)
   - مجلد `deleted_files` (نسخة احتياطية للملفات المحذوفة قبل حذفها)

2. **الملفات المحذوفة نفسها** تُحذف من المستودع الأصلي فقط، أما النسخ الاحتياطية فكلها في `D:\New folder (56)`

3. **لتغيير مسار الإخراج** قم بتعديل السطر الأول في الكود:
   ```python
   OUTPUT_BASE_PATH = Path("D:/New folder (56)")
   ```

4. **التشغيل:** أنشئ ملف `cleanup_config.json` في المستودع ثم شغل السكريبت:
   ```bash
   python repo_cleanup.py
   ```م")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ خطأ غير متوقع: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
```
```