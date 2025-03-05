const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const executeFunction = require("./execute_function");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// SQLite Database Initialization
const db = new sqlite3.Database("./functions.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {

        // Create tables if they do not exist
        db.run(
            `CREATE TABLE IF NOT EXISTS invocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                functionId TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        );

        db.run(
            `CREATE TABLE IF NOT EXISTS logs (
                logId INTEGER PRIMARY KEY AUTOINCREMENT,
                functionId TEXT,
                invocationId INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                logOutput TEXT,
                FOREIGN KEY (functionId) REFERENCES functions(functionId),
                FOREIGN KEY (invocationId) REFERENCES invocations(id)
            )`
        );
    }
});

// Function Execution Endpoint
app.post("/functions/:functionId/invoke", async (req, res) => {
    const { functionId } = req.params;
    const { language, functionCode, inputData, dependencies=""} = req.body;

    if (!language || !functionCode) {
        return res.status(400).json({ error: "Missing language or function code" });
    }

    try {
        // Execute function inside Docker
        const output = await executeFunction(language, functionCode, inputData, dependencies );
        

        // Store invocation in database
        // Store invocation in database
    db.run(
        "INSERT INTO invocations (functionId) VALUES (?)",
        [functionId],
        function (err) {
        if (err) {
            console.error("Error inserting invocation:", err.message);
        }

        // Store logs if there was an error output from execution
        if (output && output.includes("Error")) {
            const invocationId = this.lastID; // Get last inserted invocation ID
            db.run(
                "INSERT INTO logs (functionId, invocationId, logOutput) VALUES (?, ?, ?)",
                [functionId, invocationId, output],
                (logErr) => {
                    if (logErr) console.error("Error inserting log:", logErr.message);
                }
            );
        }
    }
);

res.json({ output: output.trim(), logs: output.includes("Error") ? output : "No errors" });


    } catch (error) {
        res.status(500).json({ error: `Execution failed: ${error.message}` });
    }
});

// Get Billing Info
app.get("/functions/:functionId/billing", (req, res) => {
    const { functionId } = req.params;

    db.get(
        "SELECT COUNT(*) AS runs FROM invocations WHERE functionId = ?",
        [functionId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Database error retrieving billing info" });
            }

            const runs = row.runs || 0;
            const cost = (runs * 0.01).toFixed(2); // $0.01 per run
            res.json({ functionId, runs, cost });
        }
    );
});

// Get Logs
app.get("/functions/:functionId/logs", (req, res) => {
    const { functionId } = req.params;

    db.all(
        "SELECT invocationId, timestamp, logOutput FROM logs WHERE functionId = ? ORDER BY timestamp DESC",
        [functionId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: "Database error retrieving logs" });
            }

            res.json({ functionId, logs: rows });
        }
    );
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
