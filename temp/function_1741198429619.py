import sys
import json
import requests  # This should be installed

try:
    raw_input = sys.stdin.read()
    print(f"🔹 Raw Input Received: {repr(raw_input)}")
    event_data = json.loads(raw_input)

    # Call an API
    response = requests.get("https://jsonplaceholder.typicode.com/todos/1")

    output = {
        "message": "Hello, " + event_data.get("name", "World"),
        "api_response": response.json()
    }
    print(json.dumps(output))
except json.JSONDecodeError as e:
    print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
