import sys
import json

try:
    raw_input = sys.stdin.read()  # Read raw input from stdin
    print(f" Raw Input Received: {raw_input}")  # Debugging step

    event_data = json.loads(raw_input)  # Parse JSON input
    response = {'message': 'Hello, ' + event_data.get('name', 'World')}
    print(json.dumps(response))  # Print JSON output
except json.JSONDecodeError:
    print(json.dumps({"error": "Invalid JSON input"}))
