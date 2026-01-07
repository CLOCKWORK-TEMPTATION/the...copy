#!/usr/bin/env python3
import shutil
import os
from pathlib import Path

# المجلدات المنقولة (الموجودة في e:/)
backups = [
    'e:/backup_20260107_203818',
    'e:/the...copy-backup-2026-01-02-193227'
]

dst_base = Path('D:/New folder (55)')
dst_base.mkdir(parents=True, exist_ok=True)

for src_path in backups:
    src = Path(src_path)
    if src.exists():
        dst = dst_base / src.name
        print(f'Moving {src.name}...')
        try:
            shutil.copytree(src, dst)
            shutil.rmtree(src)
            print(f'Done: {src.name}')
        except Exception as e:
            print(f'Error: {src.name} - {e}')
    else:
        print(f'Not found: {src.name}')
