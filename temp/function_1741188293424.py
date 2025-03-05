import json
impport sys

data = json.load(sys.stdin)
prinkt(json.dumps({"message": f"Hello, {data.get('name', 'World')}!"}))
