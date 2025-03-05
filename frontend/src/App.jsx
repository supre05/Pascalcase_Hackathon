import { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

function App() {
  const [language, setLanguage] = useState(""); // Selected language
  const [functionCode, setFunctionCode] = useState(""); // Function code
  const [inputData, setInputData] = useState("{}"); // Input data (JSON)
  const [dependencies, setDependencies] = useState(""); // Dependencies (optional)
  const [output, setOutput] = useState(""); // Execution output
  const [billing, setBilling] = useState(null); // Billing details
  const [logs, setLogs] = useState([]); // Execution logs

  const invokeFunction = async () => {
    if (!language || !functionCode.trim()) {
      alert("Please select a language and enter function code.");
      return;
    }

    const functionId = "userFunction";

    try {
      const response = await axios.post(`${API_BASE_URL}/functions/${functionId}/invoke`, {
        language,
        functionCode,
        inputData,
        dependencies, // Sending dependencies to backend
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const fetchBilling = async () => {
    const functionId = "userFunction"; // Define functionId
    try {
      const response = await axios.get(`${API_BASE_URL}/functions/${functionId}/billing`);
      setBilling(response.data);
    } catch (error) {
      alert("Error fetching billing details.");
    }
  };

  const fetchLogs = async () => {
    const functionId = "userFunction"; // Define functionId
    try {
      const response = await axios.get(`${API_BASE_URL}/functions/${functionId}/logs`);
      setLogs(response.data.logs);
    } catch (error) {
      alert("Error fetching logs.");
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Serverless Platform</h1>

      {/* Language Selection */}
      <label className="block mb-2">Select Language:</label>
      <select
        className="p-2 border rounded mb-4"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="">Choose a language</option>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
      </select>

      {/* Function Code Input */}
      <label className="block mb-2">Function Code:</label>
      <textarea
        className="p-2 border rounded w-80 h-40 mb-4"
        value={functionCode}
        onChange={(e) => setFunctionCode(e.target.value)}
        placeholder="Write your function code here..."
      />

      {/* Input Data */}
      <label className="block mb-2">Input Data (JSON):</label>
      <textarea
        className="p-2 border rounded w-80 h-20 mb-4"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder='{"name": "Alice"}'
      />

      {/* Dependencies Input */}
      <label className="block mb-2">Dependencies (requirements.txt or package.json format):</label>
<textarea
  className="p-2 border rounded w-80 h-20 mb-4"
  value={dependencies}
  onChange={(e) => setDependencies(e.target.value)}
  placeholder="requests (for Python) or dependencies in JSON format (for Node.js)"
/>

      {/* Invoke Function */}
      <button onClick={invokeFunction} className="p-2 bg-blue-500 text-white rounded mb-2">
        Invoke Function
      </button>

      {/* Output Display */}
      {output && (
        <div className="mt-4 p-2 border bg-gray-200 w-80">
          <h3 className="font-bold">Output:</h3>
          <pre className="text-sm">{output}</pre>
        </div>
      )}

      {/* Billing Section */}
      <button onClick={fetchBilling} className="p-2 bg-green-500 text-white rounded mt-4">
        View Billing
      </button>

      {billing && (
        <div className="mt-4 p-2 border bg-gray-200 w-80">
          <h3 className="font-bold">Billing Details:</h3>
          <p>Runs: {billing.runs}</p>
          <p>Estimated Cost: ${billing.cost}</p>
        </div>
      )}

      {/* Logs Section */}
      <button onClick={fetchLogs} className="p-2 bg-yellow-500 text-white rounded mt-4">
        View Logs
      </button>

      {logs.length > 0 && (
        <div className="mt-4 p-2 border bg-gray-200 w-80">
          <h3 className="font-bold">Execution Logs:</h3>
          {logs.map((log, index) => (
            <div key={index} className="border-b py-2">
              <p>
                <strong>Invocation ID:</strong> {log.invocationId}
              </p>
              <p>
                <strong>Timestamp:</strong> {log.timestamp}
              </p>
              <p>
                <strong>Log Output:</strong> {log.logOutput}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
