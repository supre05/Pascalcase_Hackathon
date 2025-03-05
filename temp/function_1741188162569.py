import json
import sys

data = json.load(sys.stdin)
print(json.dumps({"message": f"Hello, {data.get('name', 'World')}!"}))
