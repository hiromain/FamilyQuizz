import os
import json

data_dir = r"e:\FamilyQuizz\src\data"
json_files = [f for f in os.listdir(data_dir) if f.endswith('.json') and not f.endswith('.bak') and not f.endswith('.metadata.json')]

print("File | Total Qs | Open Qs")
print("-" * 45)
for filename in json_files:
    filepath = os.path.join(data_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        continue
    
    counts = {"total": 0, "open_q": 0}
    
    def count_recursive(obj):
        if isinstance(obj, list):
            for item in obj:
                if isinstance(item, dict) and "type" in item:
                    counts["total"] += 1
                    if item.get("type", "").lower() != "qcm":
                        counts["open_q"] += 1
                else:
                    count_recursive(item)
        elif isinstance(obj, dict):
            for v in obj.values():
                count_recursive(v)
                
    count_recursive(data)
    print(f"{filename:<30} | {counts['total']:^8} | {counts['open_q']:^8}")
