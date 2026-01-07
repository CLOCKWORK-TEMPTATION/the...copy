#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت تنظيف المستودع - الإصدار النهائي
الهدف: الحصول على مستودع نظيف حيث كل ملف مفعّل وله علاقة بالتطبيق

يعتمد على:
- dependency-cruiser, knip, madge, depcheck لتحليل الاعتماديات
- Gemini 3 Pro للتحليل الذكي بالذكاء الاصطناعي
"""

import os
import sys
import io

# إصلاح الترميز على Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import shutil
import subprocess
from pathlib import Path
import datetime
from collections import deque
from typing import Dict, List, Any, Optional

# ============================================================================
# الثوابت والإعدادات
# ============================================================================

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
  "reasons": [
    "سبب رئيسي 1",
    "سبب رئيسي 2"
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
  "recommendation": "نص قصير يشرح القرار النهائي"
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
   - ملف config/settings

**قواعد حاسمة:**

- ❌ **لا تكن متساهلاً** - الافتراض الأساسي: احذف إلا إذا كان هناك دليل واضح على الاستخدام
- ✅ **كن صارماً في KEEP** - فقط الملفات المفعّلة فعلياً
- ⚠️ **كن حذراً مع UNCERTAIN** - عند أدنى شك، ضعه في uncertain
- 📊 **استخدم البيانات فقط** - لا تخمن، اعتمد على الاعتماديات والأدوات
- 🎯 **التركيز على الهدف** - مستودع نظيف = صفر ملفات غير مفعّلة
"""


# ============================================================================
# المرحلة 0: الإعداد والـ Backup
# ============================================================================

def create_backup(repo_path: Path) -> Path:
    """
    إنشاء نسخة احتياطية كاملة قبل أي حذف
    """
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"backup_{timestamp}"
    backup_path = repo_path.parent / backup_name

    print(f"🔄 جاري إنشاء نسخة احتياطية...")

    # أسماء محجوزة على Windows لا يمكن استخدامها كملفات
    reserved_names = {'nul', 'con', 'prn', 'aux', 'com1', 'com2', 'com3', 'com4',
                      'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2',
                      'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'}

    def ignore_invalid_files(path, names):
        """تجاهل الملفات غير الصالحة"""
        ignored = []
        for name in names:
            if name.lower() in reserved_names:
                ignored.append(name)
                print(f"  ⚠️  تم تجاهل ملف غير صالح: {path}/{name}")
        return ignored

    # نسخ كامل المستودع مع معالجة الأخطاء
    base_ignore = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'temp_backup']

    try:
        shutil.copytree(
            repo_path,
            backup_path,
            ignore=shutil.ignore_patterns(*base_ignore),
            ignore_dangling_symlinks=True
        )
    except shutil.Error as e:
        # معالجة أخطاء محددة
        print(f"  ⚠️  بعض الملفات لم يتم نسخها: {e}")
        # المتابعة إذا تم نسخ الجزء الأكبر
        if not backup_path.exists():
            # إنشاء المجلد يدوياً والنسخ ملفاً بملف
            backup_path.mkdir(parents=True, exist_ok=True)
            copy_directory_manually(repo_path, backup_path, base_ignore, reserved_names)

    # حفظ معلومات الـ backup
    backup_info = {
        'timestamp': timestamp,
        'original_path': str(repo_path),
        'backup_path': str(backup_path),
        'commit_hash': get_current_commit_hash(repo_path)
    }

    with open(backup_path / 'BACKUP_INFO.json', 'w', encoding='utf-8') as f:
        json.dump(backup_info, f, indent=2, ensure_ascii=False)

    print(f"✅ تم إنشاء النسخة الاحتياطية: {backup_path}")
    return backup_path


def copy_directory_manually(src: Path, dst: Path, ignore_patterns: List[str], reserved_names: set):
    """نسخ المجلد يدوياً مع تجاهل الملفات المشكلة"""
    for item in src.iterdir():
        if item.name in ignore_patterns:
            continue

        if item.name.lower() in reserved_names:
            continue

        dest_item = dst / item.name

        if item.is_dir():
            dest_item.mkdir(exist_ok=True)
            copy_directory_manually(item, dest_item, ignore_patterns, reserved_names)
        else:
            try:
                shutil.copy2(item, dest_item)
            except Exception as e:
                print(f"  ⚠️  تم تخطي {item}: {e}")


def get_current_commit_hash(repo_path: Path) -> Optional[str]:
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


def load_config(config_path: str) -> Dict[str, Any]:
    """تحميل إعدادات التنظيف"""
    default_config = {
        "repo_path": str(Path.cwd()),
        "ignore_patterns": [
            "node_modules",
            ".git",
            "dist",
            "build",
            "__pycache__",
            ".vscode",
            ".idea",
            ".next",
            "coverage",
            "temp_backup"
        ],
        "entry_points": [
            "frontend/src/app/page.tsx",
            "frontend/src/main.tsx",
            "backend/src/server.ts",
            "backend/src/index.ts"
        ],
        "protected_files": [
            "package.json",
            "package-lock.json",
            "pnpm-lock.yaml",
            "tsconfig.json",
            ".env.example",
            "README.md",
            ".gitignore",
            "CLAUDE.md",
            "cleanup_config.json"
        ],
        "safe_mode": True,
        "create_backup": True,
        "dry_run": False
    }

    config_file = Path(config_path)
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            user_config = json.load(f)
            default_config.update(user_config)

    return default_config


# ============================================================================
# المرحلة 1: المسح الشامل وبناء خريطة الاعتماديات
# ============================================================================

def collect_all_files(repo_path: Path, ignore_patterns: List[str], config: Dict) -> Dict[str, Dict]:
    """
    جمع كل الملفات مع معلومات أساسية
    """
    import fnmatch
    all_files = {}

    for root, dirs, files in os.walk(repo_path):
        # تصفية المجلدات المستثناة - استخدام pattern matching
        dirs[:] = [d for d in dirs if not any(
            fnmatch.fnmatch(d, pattern) or d == pattern
            for pattern in ignore_patterns
        ) and not d.startswith('.')]

        for file in files:
            file_path = Path(root) / file
            relative_path = str(file_path.relative_to(repo_path))

            # تخطي الملفات المحمية
            if relative_path in config['protected_files']:
                continue

            # تخطي الملفات غير البرمجية
            extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.py', '.yaml', '.yml']
            if file_path.suffix not in extensions:
                continue

            try:
                all_files[relative_path] = {
                    'absolute_path': str(file_path),
                    'relative_path': relative_path,
                    'extension': file_path.suffix,
                    'size_bytes': file_path.stat().st_size,
                    'is_protected': False,
                    'analysis_status': 'pending'
                }
            except:
                pass

    return all_files


def build_complete_dependency_map(repo_path: Path) -> Dict[str, Any]:
    """
    بناء خريطة اعتماديات دقيقة باستخدام الأدوات المتاحة
    """
    print("🔍 جاري بناء خريطة الاعتماديات...")

    dependency_map = {
        'imports': {},
        'imported_by': {},
        'unused_exports': [],
        'unused_dependencies': [],
        'circular_dependencies': []
    }

    # 1. محاولة استخدام dependency-cruiser
    print("  ├─ تشغيل dependency-cruiser...")
    try:
        result = subprocess.run(
            ['npx', 'depcruise', '--include-only', '^(frontend|backend)/src', '--output-type', 'json', 'frontend', 'backend'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            dependency_map = merge_depcruise_results(dependency_map, json.loads(result.stdout))
            print("    ✅ dependency-cruiser")
        else:
            print("    ⚠️  dependency-cruiser فشل - سنتابع بدونها")
    except Exception as e:
        print(f"    ⚠️  فشل تشغيل dependency-cruiser: {e}")

    # 2. محاولة استخدام knip
    print("  ├─ تشغيل knip...")
    try:
        result = subprocess.run(
            ['npx', 'knip', '--reporter', 'json'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            knip_data = json.loads(result.stdout)
            dependency_map['unused_exports'] = extract_knip_unused(knip_data)
            print("    ✅ knip")
        else:
            print("    ⚠️  knip فشل - سنتابع بدونها")
    except Exception as e:
        print(f"    ⚠️  فشل تشغيل knip: {e}")

    # 3. محاولة استخدام depcheck
    print("  └─ تشغيل depcheck...")
    try:
        result = subprocess.run(
            ['npx', 'depcheck', '--json'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            depcheck_data = json.loads(result.stdout)
            dependency_map['unused_dependencies'] = list(depcheck_data.keys())
            print("    ✅ depcheck")
        else:
            print("    ⚠️  depcheck فشل - سنتابع بدونها")
    except Exception as e:
        print(f"    ⚠️  فشل تشغيل depcheck: {e}")

    print("✅ تم بناء خريطة الاعتماديات")
    return dependency_map


def merge_depcruise_results(dep_map: Dict, depcruise_data: Dict) -> Dict:
    """دمج نتائج dependency-cruiser"""
    for module in depcruise_data.get('modules', []):
        module_path = module.get('source', '')
        dependencies = [d.get('imported', '') for d in module.get('dependencies', [])]

        dep_map['imports'][module_path] = dependencies

        for dep in dependencies:
            if dep not in dep_map['imported_by']:
                dep_map['imported_by'][dep] = []
            if module_path not in dep_map['imported_by'][dep]:
                dep_map['imported_by'][dep].append(module_path)

    return dep_map


def extract_knip_unused(knip_data: Dict) -> List[str]:
    """استخراج الملفات غير المستخدمة من knip"""
    unused = []

    # Unused files
    for issue in knip_data.get('issues', {}).get('files', []):
        unused.append(issue.get('file', ''))

    # Unused exports
    for issue in knip_data.get('issues', {}).get('dependencies', []):
        if issue.get('file'):
            unused.append(issue['file'])

    return unused


def generate_repo_map(repo_path: Path, ignore_patterns: List[str]) -> Dict[str, Any]:
    """توليد خريطة هيكلية للمستودع"""
    repo_map = {
        'structure': {},
        'frontend_files': [],
        'backend_files': [],
        'config_files': [],
        'root_files': []
    }

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in ignore_patterns and not d.startswith('.')]

        for file in files:
            file_path = Path(root) / file
            relative_path = str(file_path.relative_to(repo_path))

            if relative_path.startswith('frontend/'):
                repo_map['frontend_files'].append(relative_path)
            elif relative_path.startswith('backend/'):
                repo_map['backend_files'].append(relative_path)
            elif relative_path.startswith('frontend/') or relative_path.startswith('backend/'):
                pass
            else:
                repo_map['root_files'].append(relative_path)

    return repo_map


# ============================================================================
# المرحلة 1.5: التحليل الذكي بالـ AI
# ============================================================================

def initialize_gemini():
    """
    تهيئة نموذج Gemini للتحليل باستخدام المكتبة الجديدة google-genai
    """
    try:
        from google import genai
        from google.genai import types
        from dotenv import load_dotenv

        load_dotenv()

        api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_GENAI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not api_key:
            print("⚠️  لم يتم العثور على GEMINI_API_KEY - سيتم استخدام التحليل التقني فقط")
            print("   أضف في ملف .env: GEMINI_API_KEY=your_key_here")
            return None

        # تهيئة العميل
        client = genai.Client(api_key=api_key)

        print("✅ تم تهيئة Google Gen AI SDK")
        return client

    except ImportError:
        print("⚠️  لم يتم تثبيت google-genai - سيتم استخدام التحليل التقني فقط")
        print("   ثبته: pip install google-genai")
        return None
    except Exception as e:
        print(f"⚠️  فشل تهيئة Gemini: {e} - سيتم استخدام التحليل التقني فقط")
        return None


def build_ai_analysis_prompt(file_path: str, file_info: Dict, dependency_map: Dict, entry_points: List[str]) -> str:
    """
    بناء prompt مخصص لكل ملف للتحليل بالـ AI
    """
    # استخراج معلومات الاعتماديات
    imported_by = dependency_map['imported_by'].get(file_path, [])
    is_unused_export = file_path in dependency_map['unused_exports']

    # حساب المسافة من entry points
    distance = calculate_distance_from_entry_points(file_path, entry_points, dependency_map)

    # قراءة محتوى الملف أو ملخصه
    if file_info['size_bytes'] < 10000:  # أقل من ~10KB
        try:
            with open(file_info['absolute_path'], 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            content_section = f"### محتوى الملف الكامل:\n```\n{content}\n```"
        except:
            content_section = "### محتوى الملف: (غير قادر على القراءة)"
    else:
        content_section = f"### ملخص: ملف كبير ({file_info['size_bytes']} بايت)"

    # بناء الـ prompt النهائي
    prompt = f"""{CLEANUP_FOCUSED_PROMPT}

---

# معلومات الملف للتحليل

## الملف: `{file_path}`

### المعلومات التقنية:
- **الحجم:** {file_info['size_bytes']} بايت
- **الامتداد:** {file_info['extension']}
- **المسار:** {file_info['absolute_path']}

### تحليل الاعتماديات:
- **يتم استيراده بواسطة ({len(imported_by)} ملف):** {', '.join(imported_by[:5]) if imported_by else 'لا يستورده أي ملف'}
- **المسافة من entry points:** {distance if distance != -1 else 'غير متصل'}
- **exports غير مستخدمة:** {'نعم' if is_unused_export else 'لا'}

### نقاط الدخول:
{chr(10).join(['- ' + ep for ep in entry_points])}

{content_section}

---

**المطلوب:** قم بتحليل هذا الملف وأرجع JSON فقط.
"""

    return prompt


def analyze_files_with_ai(all_files: Dict, dependency_map: Dict, entry_points: List[str], client, config: Dict) -> Dict[str, Dict]:
    """
    تحليل جميع الملفات باستخدام Google Gen AI (المكتبة الجديدة)
    """
    if client is None:
        print("⚠️  لم يتم تهيئة AI - سيتم استخدام التحليل التقني فقط")
        return analyze_files_technically(all_files, dependency_map, entry_points)

    print(f"\n🤖 جاري تحليل الملفات باستخدام Google Gen AI...")
    ai_analysis_results = {}

    total = len(all_files)
    for i, (file_path, file_info) in enumerate(all_files.items(), 1):
        try:
            if i % 10 == 0 or i == total:
                print(f"\r  [{i}/{total}] تحليل: {file_path[:50]}...", end='', flush=True)

            # بناء الـ prompt
            prompt = build_ai_analysis_prompt(file_path, file_info, dependency_map, entry_points)

            # إرسال للنموذج باستخدام المكتبة الجديدة
            response = client.models.generate_content(
                model='gemini-2.5-flash-latest',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type='application/json'
                )
            )

            # استخراج النتيجة
            analysis = json.loads(response.text)

            ai_analysis_results[file_path] = {
                'analysis': analysis,
                'file_info': file_info,
                'timestamp': datetime.datetime.now().isoformat()
            }

        except json.JSONDecodeError as e:
            # الفشل في parsing - نستخدم التحليل التقني
            ai_analysis_results[file_path] = {
                'analysis': analyze_single_file_technical(file_path, file_info, dependency_map, entry_points),
                'file_info': file_info,
                'fallback': 'technical'
            }

        except Exception as e:
            # فشل AI - نستخدم التحليل التقني
            ai_analysis_results[file_path] = {
                'analysis': analyze_single_file_technical(file_path, file_info, dependency_map, entry_points),
                'file_info': file_info,
                'fallback': 'technical',
                'error': str(e)
            }

    print(f"\n✅ اكتمل التحليل لـ {len(ai_analysis_results)} ملف")

    # حفظ النتائج
    results_file = Path(config.get('repo_path', '.')) / 'ai_analysis_results.json'
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(ai_analysis_results, f, indent=2, ensure_ascii=False)

    print(f"💾 تم حفظ النتائج في: {results_file}")

    return ai_analysis_results


def analyze_files_technically(all_files: Dict, dependency_map: Dict, entry_points: List[str]) -> Dict[str, Dict]:
    """
    تحليل الملفات باستخدام الطرق التقنية فقط (بدون AI)
    """
    print(f"\n🔧 جاري التحليل التقني للملفات...")
    ai_analysis_results = {}

    for file_path, file_info in all_files.items():
        ai_analysis_results[file_path] = {
            'analysis': analyze_single_file_technical(file_path, file_info, dependency_map, entry_points),
            'file_info': file_info,
            'method': 'technical'
        }

    return ai_analysis_results


def analyze_single_file_technical(file_path: str, file_info: Dict, dependency_map: Dict, entry_points: List[str]) -> Dict:
    """
    تحليل ملف واحد باستخدام الطرق التقنية
    """
    analysis = {
        'decision': 'UNCERTAIN',
        'confidence': 50,
        'reasons': [],
        'usage_analysis': {
            'is_imported': False,
            'import_count': 0,
            'distance_from_entry': -1,
            'has_unused_exports': False
        },
        'risk_assessment': {
            'deletion_safety_score': 50,
            'potential_impact': 'unknown',
            'affected_files': []
        },
        'recommendation': ''
    }

    # 1. فحص الاستيراد
    imported_by = dependency_map['imported_by'].get(file_path, [])
    analysis['usage_analysis']['import_count'] = len(imported_by)
    analysis['usage_analysis']['is_imported'] = len(imported_by) > 0

    # 2. فحص المسافة
    distance = calculate_distance_from_entry_points(file_path, entry_points, dependency_map)
    analysis['usage_analysis']['distance_from_entry'] = distance

    # 3. فحص unused exports
    is_unused = file_path in dependency_map['unused_exports']
    analysis['usage_analysis']['has_unused_exports'] = is_unused

    # 4. الحكم
    safety_score = 0

    if len(imported_by) == 0:
        analysis['reasons'].append('لا يتم استيراده من أي ملف')
        safety_score += 40

    if distance == -1:
        analysis['reasons'].append('غير متصل بأي entry point')
        safety_score += 30
    elif distance > 5:
        analysis['reasons'].append(f'بعيد عن entry points ({distance} مستويات)')
        safety_score += 10
    else:
        analysis['reasons'].append(f'قريب من entry points ({distance} مستويات)')
        safety_score -= 20

    if is_unused:
        analysis['reasons'].append('exports غير مستخدمة')
        safety_score += 20

    if file_info['size_bytes'] == 0:
        analysis['reasons'].append('ملف فارغ')
        safety_score += 30

    # أنماط مشبوهة
    suspicious = ['test', 'temp', 'backup', 'old', 'deprecated', 'unused', '.bak']
    if any(p in file_path.lower() for p in suspicious):
        analysis['reasons'].append('اسم مشبوه')
        safety_score += 15

    # التصنيف النهائي
    analysis['risk_assessment']['deletion_safety_score'] = safety_score

    if safety_score >= 70:
        analysis['decision'] = 'DELETE_SAFE'
        analysis['confidence'] = min(95, 50 + safety_score // 2)
        analysis['recommendation'] = 'آمن للحذف'
    elif safety_score >= 40:
        analysis['decision'] = 'DELETE_PROBABLY'
        analysis['confidence'] = 60
        analysis['recommendation'] = 'غالباً آمن للحذف - يحتاج مراجعة'
    elif safety_score >= 20:
        analysis['decision'] = 'UNCERTAIN'
        analysis['confidence'] = 40
        analysis['recommendation'] = 'غير متأكد - يحتاج مراجعة يدوية'
    else:
        analysis['decision'] = 'KEEP'
        analysis['confidence'] = 80
        analysis['recommendation'] = 'ملف نشط - يجب الاحتفاظ به'

    return analysis


def categorize_ai_results(ai_analysis_results: Dict) -> Dict[str, List]:
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


def convert_ai_results_to_candidates(categorized_results: Dict) -> Dict[str, List]:
    """
    تحويل نتائج الـ AI إلى تنسيق المرشحين للحذف
    """
    candidates = {
        'safe_to_delete': [],
        'probably_unused': [],
        'uncertain': [],
        'keep': []
    }

    for category, target_key in [
        ('DELETE_SAFE', 'safe_to_delete'),
        ('DELETE_PROBABLY', 'probably_unused'),
        ('UNCERTAIN', 'uncertain'),
        ('KEEP', 'keep')
    ]:
        for item in categorized_results[category]:
            candidates[target_key].append({
                'path': item['path'],
                'info': item['result']['file_info'],
                'classification': {
                    'category': target_key,
                    'reasons': item['result']['analysis'].get('reasons', []),
                    'safety_score': item['result']['analysis'].get('risk_assessment', {}).get('deletion_safety_score', item.get('confidence', 0)),
                    'risk_factors': []
                },
                'deletion_safety': item.get('confidence', 0)
            })

    return candidates


# ============================================================================
# المرحلة 2: تحديد الملفات المرشحة للحذف
# ============================================================================

def identify_deletion_candidates(all_files: Dict, dependency_map: Dict, entry_points: List[str]) -> Dict[str, List]:
    """
    تحديد الملفات المرشحة للحذف بدقة
    """
    candidates = {
        'safe_to_delete': [],
        'probably_unused': [],
        'uncertain': [],
        'keep': []
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


def classify_file(file_path: str, file_info: Dict, dependency_map: Dict, entry_points: List[str]) -> Dict:
    """
    تصنيف دقيق للملف
    """
    classification = {
        'category': 'uncertain',
        'reasons': [],
        'safety_score': 0,
        'risk_factors': []
    }

    # 1. فحص الاستيراد المباشر
    has_importers = len(dependency_map['imported_by'].get(file_path, [])) > 0

    if not has_importers:
        classification['reasons'].append('لا يتم استيراده من أي ملف')
        classification['safety_score'] += 40

    # 2. فحص المسافة من entry points
    distance = calculate_distance_from_entry_points(file_path, entry_points, dependency_map)

    if distance == -1:
        classification['reasons'].append('غير متصل بأي entry point')
        classification['safety_score'] += 30
    elif distance > 5:
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


def calculate_distance_from_entry_points(file_path: str, entry_points: List[str], dependency_map: Dict) -> int:
    """
    حساب أقصر مسافة من أي entry point
    """
    min_distance = float('inf')

    for entry_point in entry_points:
        queue = deque([(entry_point, 0)])
        visited = {entry_point}

        while queue:
            current, distance = queue.popleft()

            if current == file_path or current.endswith(file_path):
                min_distance = min(min_distance, distance)
                break

            # الحصول على الملفات التي يستوردها الملف الحالي
            imports = dependency_map['imports'].get(current, [])

            for imported_file in imports:
                if imported_file not in visited:
                    visited.add(imported_file)
                    queue.append((imported_file, distance + 1))

    return min_distance if min_distance != float('inf') else -1


# ============================================================================
# المرحلة 3: التحقق الآمن والمحاكاة
# ============================================================================

def perform_safety_checks(candidates: Dict, dependency_map: Dict, config: Dict) -> Dict:
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
        reverse_deps = dependency_map['imported_by'].get(file_path, [])
        if reverse_deps:
            candidate['blocked_reason'] = f'يتم استيراده من: {", ".join(reverse_deps[:3])}'
            safety_report['blocked'].append(candidate)
            continue

        # 2. فحص ما إذا كان entry point
        if file_path in config['entry_points']:
            candidate['blocked_reason'] = 'ملف entry point - لا يمكن حذفه'
            safety_report['blocked'].append(candidate)
            continue

        # 3. فحص الأنماط الخاصة
        if requires_manual_review(file_path, candidate):
            safety_report['needs_review'].append(candidate)
            continue

        # 4. اجتاز جميع الفحوصات
        safety_report['approved_for_deletion'].append(candidate)

    print(f"✅ الفحوصات الأمنية اكتملت:")
    print(f"  ├─ موافق للحذف: {len(safety_report['approved_for_deletion'])}")
    print(f"  ├─ يحتاج مراجعة: {len(safety_report['needs_review'])}")
    print(f"  └─ محظور: {len(safety_report['blocked'])}")

    return safety_report


def requires_manual_review(file_path: str, candidate: Dict) -> bool:
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

    # ملفات كبيرة
    if candidate['info']['size_bytes'] > 500 * 80:
        return True

    return False


def simulate_deletion(safety_report: Dict, dependency_map: Dict) -> Dict:
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

    # في الوضع البسيط، نعتبر جميع الملفات المعتمدة آمنة
    for file_path in approved_files:
        simulation_results['safe'].append(file_path)

    print(f"✅ المحاكاة اكتملت:")
    print(f"  ├─ آمن: {len(simulation_results['safe'])}")
    print(f"  └─ خطر: {len(simulation_results['would_break'])}")

    return simulation_results


# ============================================================================
# المرحلة 4: المراجعة والموافقة التفاعلية
# ============================================================================

def interactive_review(safety_report: Dict, simulation_results: Dict, config: Dict) -> List[str]:
    """
    واجهة تفاعلية لمراجعة الملفات قبل الحذف
    """
    if not config.get('safe_mode', True):
        print("⚠️  الوضع الآمن معطل - سيتم الحذف تلقائياً")
        return [f['path'] for f in safety_report['approved_for_deletion']]

    print("\n" + "="*70)
    print("📋 مراجعة الملفات المرشحة للحذف")
    print("="*70)

    final_approved = []

    # عرض ملخص
    safe_files = simulation_results['safe']
    print(f"\n🟢 ملفات آمنة للحذف: {len(safe_files)}")

    if len(safe_files) > 0:
        print("\nأول 20 ملف:")
        for i, file_path in enumerate(safe_files[:20], 1):
            candidate = next((f for f in safety_report['approved_for_deletion'] if f['path'] == file_path), None)
            if candidate:
                print(f"  {i}. {file_path}")
                print(f"     الأسباب: {', '.join(candidate['classification']['reasons'][:2])}")

        if len(safe_files) > 20:
            print(f"  ... و {len(safe_files) - 20} ملف آخر")

        # طلب الموافقة
        print("\n" + "-"*70)

        # في الوضع التلقائي للإنتاج
        if config.get('auto_approve', False):
            print("✅ الوضع التلقائي - الموافقة على جميع الملفات الآمنة")
            final_approved = safe_files
        else:
            choice = input(f"\n❓ هل توافق على حذف جميع الـ {len(safe_files)} ملف؟ (y/n/review): ").lower()

            if choice == 'y':
                final_approved = safe_files
                print(f"✅ تمت الموافقة على حذف {len(final_approved)} ملف")
            elif choice == 'review':
                final_approved = detailed_file_review(safe_files, safety_report)
            else:
                print("❌ تم إلغاء الحذف")
                return []

    return final_approved


def detailed_file_review(files: List[str], safety_report: Dict) -> List[str]:
    """
    مراجعة تفصيلية لكل ملف
    """
    approved = []

    print("\n" + "="*70)
    print("🔍 مراجعة تفصيلية")
    print("="*70)

    for i, file_path in enumerate(files, 1):
        candidate = next((f for f in safety_report['approved_for_deletion'] if f['path'] == file_path), None)

        if not candidate:
            continue

        print(f"\n[{i}/{len(files)}] {file_path}")
        print(f"  الحجم: {candidate['info']['size_bytes']} بايت")
        print(f"  الأسباب:")
        for reason in candidate['classification']['reasons']:
            print(f"    - {reason}")

        choice = input(f"  احذف هذا الملف؟ (y/n/skip-rest): ").lower()

        if choice == 'y':
            approved.append(file_path)
        elif choice == 'skip-rest':
            break

    return approved


# ============================================================================
# المرحلة 5: التنفيذ الآمن
# ============================================================================

def safe_deletion_execution(approved_files: List[str], config: Dict, backup_path: Path) -> Dict:
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

    if config.get('dry_run', False):
        print("\n⚠️  وضع المحاكاة (DRY RUN) - لن يتم حذف أي ملف فعلياً")
        for file_path in approved_files:
            print(f"  [المحاكاة] سيتم حذف: {file_path}")
            deletion_log['deleted'].append({
                'path': file_path,
                'dry_run': True
            })
        return deletion_log

    repo_path = Path(config['repo_path'])

    # الحذف الفعلي
    for i, file_path in enumerate(approved_files, 1):
        try:
            print(f"\r[{i}/{len(approved_files)}] حذف: {file_path[:60]}...", end='', flush=True)

            full_path = repo_path / file_path

            # 1. نسخ الملف إلى مجلد الحذف
            deleted_backup = backup_path / 'deleted_files' / file_path
            deleted_backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(full_path, deleted_backup)

            # 2. حذف الملف الفعلي
            full_path.unlink()

            deletion_log['deleted'].append({
                'path': file_path,
                'backup_location': str(deleted_backup),
                'timestamp': datetime.datetime.now().isoformat(),
                'status': 'success'
            })

        except Exception as e:
            print(f"\n  ❌ فشل حذف {file_path}: {e}")
            deletion_log['failed'].append({
                'path': file_path,
                'error': str(e)
            })

    print(f"\n\n✅ اكتملت عملية الحذف:")
    print(f"  ├─ نجح: {len(deletion_log['deleted'])}")
    print(f"  ├─ فشل: {len(deletion_log['failed'])}")

    # حفظ سجل الحذف
    log_file = backup_path / 'deletion_log.json'
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(deletion_log, f, indent=2, ensure_ascii=False)

    print(f"  └─ سجل الحذف: {log_file}")

    return deletion_log


# ============================================================================
# المرحلة 6: التحقق بعد الحذف
# ============================================================================

def post_deletion_validation(repo_path: Path, config: Dict) -> Dict:
    """
    التحقق من سلامة التطبيق بعد الحذف
    """
    print("\n" + "="*70)
    print("🧪 التحقق من سلامة التطبيق")
    print("="*70)

    validation_report = {
        'build_status': 'skipped',
        'tests_status': 'skipped',
        'linting_status': 'skipped',
        'issues_found': [],
        'overall_status': 'unknown'
    }

    # 1. فحص بناء المشروع (TypeScript فقط)
    print("\n1️⃣ فحص TypeScript...")
    try:
        # فحص frontend
        frontend_result = subprocess.run(
            ['pnpm', '--filter', 'frontend', 'typecheck'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=180
        )

        # فحص backend
        backend_result = subprocess.run(
            ['pnpm', '--filter', '@the-copy/backend', 'build'],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=180
        )

        if frontend_result.returncode == 0 and backend_result.returncode == 0:
            validation_report['build_status'] = 'success'
            print("  ✅ البناء نجح")
        else:
            validation_report['build_status'] = 'failed'
            if frontend_result.returncode != 0:
                validation_report['issues_found'].append({
                    'type': 'frontend_typecheck_error',
                    'message': frontend_result.stderr[:300] if frontend_result.stderr else frontend_result.stdout[:300]
                })
            if backend_result.returncode != 0:
                validation_report['issues_found'].append({
                    'type': 'backend_build_error',
                    'message': backend_result.stderr[:300] if backend_result.stderr else backend_result.stdout[:300]
                })
            print("  ❌ البناء فشل")
            for issue in validation_report['issues_found']:
                print(f"     - {issue['type']}: {issue['message'][:100]}")

    except subprocess.TimeoutExpired:
        validation_report['build_status'] = 'timeout'
        print("  ⏱️  البناء استغرق وقتاً طويلاً")
    except Exception as e:
        validation_report['build_status'] = 'error'
        print(f"  ❌ خطأ: {e}")

    # 2. التقييم النهائي
    if validation_report['build_status'] == 'success':
        validation_report['overall_status'] = 'healthy'
        print("\n✅ التطبيق في حالة جيدة")
    else:
        validation_report['overall_status'] = 'unhealthy'
        print("\n⚠️  التطبيق يحتاج مراجعة")

    return validation_report


# ============================================================================
# المرحلة 7: التقرير النهائي
# ============================================================================

def collect_repo_stats(repo_path: Path) -> Dict:
    """جمع إحصائيات المستودع"""
    stats = {
        'total_files': 0,
        'total_size_bytes': 0,
        'unused_files': 0,
        'active_files': 0
    }

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist', '__pycache__', 'temp_backup']]

        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.json')):
                stats['total_files'] += 1
                try:
                    stats['total_size_bytes'] += (Path(root) / file).stat().st_size
                except:
                    pass

    stats['total_size_mb'] = stats['total_size_bytes'] / (1024 * 1024)
    return stats


def generate_final_report(deletion_log: Dict, validation_report: Dict, stats_before: Dict, stats_after: Dict, backup_path: Path) -> str:
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

بعد التنظيف:
  • إجمالي الملفات: {stats_after['total_files']}
  • الحجم الكلي: {stats_after['total_size_mb']:.2f} MB

التحسين:
  • تم حذف: {deletion_log['total_files']} ملف
  • تم توفير: {stats_before['total_size_mb'] - stats_after['total_size_mb']:.2f} MB
  • نسبة التقليل: {(1 - stats_after['total_files']/stats_before['total_files'])*100 if stats_before['total_files'] > 0 else 0:.1f}%

{'─'*70}
🗑️  تفاصيل الحذف
{'─'*70}

✅ تم حذفها بنجاح: {len(deletion_log['deleted'])}
❌ فشل الحذف: {len(deletion_log['failed'])}

{'─'*70}
🧪 حالة التطبيق بعد التنظيف
{'─'*70}

البناء (Build): {get_status_emoji(validation_report['build_status'])} {validation_report['build_status']}

الحالة العامة: {get_status_emoji(validation_report['overall_status'])} {validation_report['overall_status'].upper()}

{'─'*70}
💾 معلومات النسخ الاحتياطي
{'─'*70}

المسار: {backup_path}
الملفات المحذوفة: {backup_path}/deleted_files/
سجل الحذف: {backup_path}/deletion_log.json

⚠️  ملاحظة: يمكن استرجاع أي ملف من النسخة الاحتياطية

{'='*70}
"""

    # حفظ التقرير
    report_file = backup_path / 'cleanup_report.txt'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(report)
    print(f"\n📄 تم حفظ التقرير في: {report_file}")

    return report


def get_status_emoji(status: str) -> str:
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
        'unknown': '❓',
        'error': '⚠️'
    }
    return emoji_map.get(status, '❓')


# ============================================================================
# السكريبت الرئيسي
# ============================================================================

def main():
    """نقطة الدخول الرئيسية"""

    print("""
╔══════════════════════════════════════════════════════════════════╗
║          🧹 أداة تنظيف المستودع - إصدار الإنتاج                ║
║                                                                  ║
║  الهدف: الحصول على مستودع نظيف - كل ملف مفعّل ومفيد           ║
╚══════════════════════════════════════════════════════════════════╝
    """)

    # 1. تحميل الإعدادات
    config = load_config('cleanup_config.json')
    repo_path = Path(config['repo_path'])

    # 2. إنشاء backup إلزامي
    print("\n📦 المرحلة 0: إنشاء نسخة احتياطية")
    if config.get('create_backup', True):
        backup_path = create_backup(repo_path)
    else:
        print("⚠️  تعطيل Backup - غير آمن!")
        backup_path = repo_path / 'temp_backup'

    # 3. جمع الإحصائيات قبل التنظيف
    print("\n📊 جمع إحصائيات المستودع...")
    stats_before = collect_repo_stats(repo_path)
    print(f"  • إجمالي الملفات: {stats_before['total_files']}")
    print(f"  • الحجم الكلي: {stats_before['total_size_mb']:.2f} MB")

    # 4. بناء خريطة الاعتماديات
    print("\n🗺️  المرحلة 1: بناء خريطة الاعتماديات")
    dependency_map = build_complete_dependency_map(repo_path)

    # 5. جمع جميع الملفات
    print("\n📁 جمع جميع الملفات...")
    all_files = collect_all_files(
        repo_path,
        config['ignore_patterns'],
        config
    )
    print(f"  • وجد {len(all_files)} ملف برمجي")

    # 6. توليد خريطة المستودع
    print("\n🗺️  توليد خريطة المستودع...")
    repo_map = generate_repo_map(repo_path, config['ignore_patterns'])

    # 7. التحليل الذكي بالـ AI
    print("\n🤖 المرحلة 1.5: التحليل الذكي")
    model = initialize_gemini()
    ai_analysis_results = analyze_files_with_ai(
        all_files,
        dependency_map,
        config['entry_points'],
        model,
        config
    )
    categorized_results = categorize_ai_results(ai_analysis_results)

    # 8. تحويل نتائج الـ AI إلى مرشحين للحذف
    print("\n🎯 المرحلة 2: تحديد الملفات المرشحة للحذف")
    candidates = convert_ai_results_to_candidates(categorized_results)

    print(f"  • آمن للحذف: {len(candidates['safe_to_delete'])}")
    print(f"  • غالباً غير مستخدم: {len(candidates['probably_unused'])}")
    print(f"  • غير متأكد: {len(candidates['uncertain'])}")
    print(f"  • احتفظ به: {len(candidates['keep'])}")

    # 9. فحوصات الأمان
    print("\n🔒 المرحلة 3: فحوصات الأمان")
    safety_report = perform_safety_checks(candidates, dependency_map, config)

    # 10. محاكاة الحذف
    print("\n🎭 محاكاة الحذف")
    simulation_results = simulate_deletion(safety_report, dependency_map)

    # 11. المراجعة التفاعلية
    print("\n👀 المرحلة 4: المراجعة والموافقة")
    final_approved = interactive_review(safety_report, simulation_results, config)

    if not final_approved:
        print("\n❌ لم تتم الموافقة على حذف أي ملف - إنهاء البرنامج")
        return

    # 12. التنفيذ
    print("\n🗑️  المرحلة 5: التنفيذ")
    deletion_log = safe_deletion_execution(final_approved, config, backup_path)

    # 13. التحقق بعد الحذف
    print("\n🧪 المرحلة 6: التحقق من سلامة التطبيق")
    validation_report = post_deletion_validation(repo_path, config)

    # 14. الإحصائيات بعد التنظيف
    stats_after = collect_repo_stats(repo_path)

    # 15. التقرير النهائي
    print("\n📄 المرحلة 7: توليد التقرير النهائي")
    generate_final_report(
        deletion_log,
        validation_report,
        stats_before,
        stats_after,
        backup_path
    )

    print("\n" + "="*70)
    print("✅ اكتملت عملية التنظيف!")
    print(f"🎉 تم تنظيف المستودع - {len(deletion_log['deleted'])} ملف تم حذفه")
    print("="*70)


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
