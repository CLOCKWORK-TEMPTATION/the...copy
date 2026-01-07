#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت استرجاع الملفات المحذوفة (Rollback)
استخدم هذا السكريبت لاسترجاع الملفات من النسخة الاحتياطية
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
from pathlib import Path
import datetime


def list_backups():
    """عرض جميع النسخ الاحتياطية المتاحة"""
    print("\n📂 النسخ الاحتياطية المتاحة:\n")

    repo_path = Path.cwd()
    backups = sorted(repo_path.parent.glob('backup_*'), reverse=True)

    if not backups:
        print("  لم يتم العثور على نسخ احتياطية")
        return []

    for i, backup_path in enumerate(backups, 1):
        # قراءة معلومات النسخة الاحتياطية
        info_file = backup_path / 'BACKUP_INFO.json'
        if info_file.exists():
            with open(info_file, 'r', encoding='utf-8') as f:
                info = json.load(f)
            timestamp = info.get('timestamp', 'غير معروف')
            commit = info.get('commit_hash', 'غير معروف')[:8]
        else:
            timestamp = backup_path.name.replace('backup_', '')
            commit = 'غير معروف'

        # قراءة سجل الحذف
        log_file = backup_path / 'deletion_log.json'
        deleted_count = 0
        if log_file.exists():
            with open(log_file, 'r', encoding='utf-8') as f:
                log = json.load(f)
            deleted_count = len(log.get('deleted', []))

        print(f"  {i}. {backup_path.name}")
        print(f"     التاريخ: {timestamp}")
        print(f"     Commit: {commit}")
        print(f"     الملفات المحذوفة: {deleted_count}")
        print()

    return backups


def select_backup():
    """اختيار نسخة احتياطية"""
    backups = list_backups()

    if not backups:
        return None

    choice = input("اختر رقم النسخة الاحتياطية (أو 0 للإلغاء): ").strip()

    if choice == '0':
        return None

    try:
        index = int(choice) - 1
        if 0 <= index < len(backups):
            return backups[index]
    except:
        pass

    print("❌ اختيار غير صالح")
    return None


def rollback_full(backup_path: Path):
    """استرجاع جميع الملفات المحذوفة"""
    log_file = backup_path / 'deletion_log.json'

    if not log_file.exists():
        print("❌ لم يتم العثور على سجل الحذف")
        return

    with open(log_file, 'r', encoding='utf-8') as f:
        deletion_log = json.load(f)

    repo_path = Path(deletion_log.get('backup_path', '.')).parent / 'the...copy'

    if not repo_path.exists():
        # محاولة العثور على المسار الأصلي
        repo_path = Path.cwd()

    print(f"\n🔄 جاري استرجاع الملفات إلى: {repo_path}")

    restored = []
    failed = []

    for deleted_file in deletion_log.get('deleted', []):
        try:
            backup_location = Path(deleted_file.get('backup_location', ''))
            original_path = repo_path / deleted_file['path']

            # إنشاء المجلدات
            original_path.parent.mkdir(parents=True, exist_ok=True)

            # نسخ الملف
            shutil.copy2(backup_location, original_path)

            restored.append(deleted_file['path'])
            print(f"  ✅ {deleted_file['path']}")

        except Exception as e:
            failed.append({'path': deleted_file['path'], 'error': str(e)})
            print(f"  ❌ فشل: {deleted_file['path']} - {e}")

    print(f"\n✅ تم استرجاع {len(restored)} ملف")
    if failed:
        print(f"❌ فشل استرجاع {len(failed)} ملف")


def rollback_partial(backup_path: Path):
    """استرجاع ملفات محددة"""
    log_file = backup_path / 'deletion_log.json'

    if not log_file.exists():
        print("❌ لم يتم العثور على سجل الحذف")
        return

    with open(log_file, 'r', encoding='utf-8') as f:
        deletion_log = json.load(f)

    deleted_files = deletion_log.get('deleted', [])

    if not deleted_files:
        print("❌ لا توجد ملفات محذوفة")
        return

    print("\n📋 الملفات المحذوفة:\n")
    for i, file_info in enumerate(deleted_files, 1):
        print(f"  {i}. {file_info['path']}")

    choice = input("\nأدخل أرقام الملفات للاسترجاع (مفصولة بفواصل، أو 0 للعودة): ").strip()

    if choice == '0':
        return

    try:
        indices = [int(x.strip()) - 1 for x in choice.split(',')]
    except:
        print("❌ إدخال غير صالح")
        return

    repo_path = Path.cwd()

    for index in indices:
        if 0 <= index < len(deleted_files):
            file_info = deleted_files[index]
            backup_location = Path(file_info.get('backup_location', ''))
            original_path = repo_path / file_info['path']

            try:
                original_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(backup_location, original_path)
                print(f"✅ تم استرجاع: {file_info['path']}")
            except Exception as e:
                print(f"❌ فشل: {file_info['path']} - {e}")


def view_backup_info(backup_path: Path):
    """عرض معلومات النسخة الاحتياطية"""
    print(f"\n📄 معلومات النسخة الاحتياطية: {backup_path.name}\n")

    # معلومات النسخة الاحتياطية
    info_file = backup_path / 'BACKUP_INFO.json'
    if info_file.exists():
        with open(info_file, 'r', encoding='utf-8') as f:
            info = json.load(f)
        print(f"التاريخ: {info.get('timestamp', 'غير معروف')}")
        print(f"Commit: {info.get('commit_hash', 'غير معروف')}")
        print(f"المسار الأصلي: {info.get('original_path', 'غير معروف')}")

    # سجل الحذف
    log_file = backup_path / 'deletion_log.json'
    if log_file.exists():
        with open(log_file, 'r', encoding='utf-8') as f:
            log = json.load(f)
        print(f"\nتاريخ الحذف: {log.get('timestamp', 'غير معروف')}")
        print(f"إجمالي الملفات المحذوفة: {len(log.get('deleted', []))}")
        print(f"فشل الحذف: {len(log.get('failed', []))}")

    # التقرير
    report_file = backup_path / 'cleanup_report.txt'
    if report_file.exists():
        print(f"\n📄 التقرير متوفر في: {report_file}")
        with open(report_file, 'r', encoding='utf-8') as f:
            print(f"\n{f.read()}")


def main():
    """نقطة الدخول الرئيسية"""

    print("""
╔══════════════════════════════════════════════════════════════════╗
║          🔄 أداة استرجاع الملفات المحذوفة                     ║
║                                                                  ║
║  استخدم هذه الأداة لاسترجاع الملفات من النسخة الاحتياطية     ║
╚══════════════════════════════════════════════════════════════════╝
    """)

    backup_path = select_backup()

    if backup_path is None:
        print("❌ لم يتم اختيار نسخة احتياطية")
        return

    print("\n" + "="*70)
    print("الخيارات المتاحة:")
    print("="*70)
    print("  1. عرض معلومات النسخة الاحتياطية")
    print("  2. استرجاع جميع الملفات المحذوفة")
    print("  3. استرجاع ملفات محددة")
    print("  0. خروج")
    print("="*70)

    choice = input("\nاختيارك: ").strip()

    if choice == '1':
        view_backup_info(backup_path)
    elif choice == '2':
        rollback_full(backup_path)
    elif choice == '3':
        rollback_partial(backup_path)
    else:
        print("👋 خروج...")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  تم إيقاف البرنامج")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ خطأ: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
