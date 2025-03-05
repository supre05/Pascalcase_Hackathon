import sys
import json

try:
    event_data = json.load(sys.stdin)  # Read input from stdin
    print(json.dumps({"message": "Hello, " + event_data.get("name", "World")}))
except Exception as e:
    print(json.dumps({"error": str(e)}))  # Capture errors
