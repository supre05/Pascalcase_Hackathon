import sys
import json

print("Function Started")

try:
    input_data = json.load(sys.stdin)  # Attempt to read input
    print("Input received:", input_data)
except Exception as e:
    print("Error:", str(e))

print("Function Completed")

