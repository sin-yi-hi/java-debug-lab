#!/usr/bin/env python3
"""Validate article JSON structure; run: python scripts/validate_data.py"""
import json
import re
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / 'data' / 'articles.json'
REQUIRED = {
    'id': str, 'title': str, 'category': str, 'errorType': str,
    'minutes': int, 'summary': str, 'symptom': str,
    'wrongCode': str, 'correctCode': str, 'explanation': list,
    'takeaways': list, 'tags': list,
}
ERROR_TYPES = {'編譯錯誤', '執行階段錯誤', '邏輯錯誤'}
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)

try:
    data = json.loads(DATA.read_text(encoding='utf-8'))
except (OSError, json.JSONDecodeError) as exc:
    print(f'FAIL: 讀取 articles.json 失敗：{exc}')
    sys.exit(1)

check(isinstance(data, dict), '最外層必須為 JSON 物件')
if not isinstance(data, dict):
    print('\n'.join(errors)); sys.exit(1)
check(data.get('version') == 1, 'version 必須是 1')
categories = data.get('categories')
articles = data.get('articles')
check(isinstance(categories, list) and all(isinstance(c, str) and c.strip() for c in categories or []), 'categories 必須是不為空的字串陣列')
check(isinstance(articles, list) and len(articles) > 0, 'articles 必須為非空陣列')
if not isinstance(categories, list): categories = []
if not isinstance(articles, list): articles = []
check(len(categories) == len(set(str(c) for c in categories)), 'categories 不可重複')
seen = set()
for index, article in enumerate(articles, 1):
    prefix = f'第 {index} 篇'
    if not isinstance(article, dict):
        check(False, f'{prefix} 必須是物件')
        continue
    for name, value_type in REQUIRED.items():
        value = article.get(name)
        check(type(value) is value_type, f'{prefix}：{name} 必須是 {value_type.__name__}')
        if isinstance(value, str):
            check(bool(value.strip()), f'{prefix}：{name} 不可空白')
    article_id = article.get('id')
    if isinstance(article_id, str):
        check(bool(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', article_id)), f'{prefix}：id 格式不正確')
        check(article_id not in seen, f'{prefix}：id 重複：{article_id}')
        seen.add(article_id)
    check(article.get('category') in categories, f'{prefix}：category 不在 categories 中')
    check(article.get('errorType') in ERROR_TYPES, f'{prefix}：errorType 不是允許的類型')
    minutes = article.get('minutes')
    check(type(minutes) is int and 1 <= minutes <= 15, f'{prefix}：minutes 必須為 1～15 的正整數')
    for name, min_length, max_length in [('explanation', 2, None), ('takeaways', 2, 4), ('tags', 2, None)]:
        values = article.get(name)
        if isinstance(values, list):
            check(len(values) >= min_length and (max_length is None or len(values) <= max_length), f'{prefix}：{name} 數量不正確')
            check(all(isinstance(v, str) and v.strip() for v in values), f'{prefix}：{name} 必須是非空字串陣列')

if errors:
    print('FAIL: 資料驗證未通過：')
    for error in errors:
        print(f' - {error}')
    sys.exit(1)
print(f'PASS: 驗證通過。共有 {len(articles)} 篇文章、{len(categories)} 個分類，ID 與欄位格式正常。')
