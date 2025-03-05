const Docker = require('dockerode');
const docker = new Docker();
const fs = require('fs');
const path = require('path');

async function execute_function(language, functionCode, inputData, dependencies ="") {
    const image = language === 'python' ? 'python:3.9' : 'node:16';
    const extension = language === 'python' ? '.py' : '.js';

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const uniqueId = Date.now();
    const fileName = `function_${uniqueId}${extension}`;
    const filePath = path.join(tempDir, fileName);
    const inputFilePath = path.join(tempDir, `input_${uniqueId}.json`);
    const dependenciesFilePath = language === "python"
  ? path.join(tempDir, "requirements.txt")
  : path.join(tempDir, "package.json");


    try {

        fs.writeFileSync(filePath, functionCode);
        fs.writeFileSync(inputFilePath, JSON.stringify(typeof inputData === "string" ? JSON.parse(inputData) : inputData));

        if (dependencies.trim()) {
            fs.writeFileSync(dependenciesFilePath, dependencies);
          }
          
        await docker.pull(image);
        const binds = [`${filePath}:/function`, `${inputFilePath}:/input.json`];

        if (language === 'python' && fs.existsSync(path.join(tempDir, 'requirements.txt'))) {
            binds.push(`${path.join(tempDir, 'requirements.txt')}:/requirements.txt`);
        }

        if (language === 'javascript' && fs.existsSync(path.join(tempDir, 'package.json'))) {
            binds.push(`${path.join(tempDir, 'package.json')}:/package.json`);
        }

        const cmd = language === 'python' 
            ? ['sh', '-c', 'if [ -f /requirements.txt ]; then pip install -r /requirements.txt --quiet; fi && cat /input.json | python /function']
            : ['sh', '-c', 'if [ -f /package.json ]; then npm install; fi && cat /input.json | node /function'];

        const container = await docker.createContainer({
            Image: image,
            Cmd: cmd,
            AttachStdout: true,
            AttachStderr: true,
            HostConfig: { Binds: binds }
        });

        await container.start();

        const stream = await container.logs({ follow: true, stdout: true, stderr: true });

        return new Promise((resolve, reject) => {
            let logData = '';

            stream.on('data', (chunk) => {
                let cleanedChunk = chunk.toString("utf8").replace(/[\x00-\x1F\x7F]/g, "");
                logData += cleanedChunk;
            });

            stream.on('end', async () => {

                try {

                    try {
                        await container.remove();
                    } catch (cleanupError) {
                    }
                    
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(inputFilePath);
                    if (dependencies.trim()) fs.unlinkSync(dependenciesFilePath);
                    resolve(logData.trim() || "No output");

                } catch (cleanupError) {
                    reject(`Error cleaning up: ${cleanupError.message}`);
                }
            });

            stream.on('error', (err) => reject(` Docker Log Error: ${err.message}`));
        });

    } catch (error) {
        return `Execution failed: ${error.message}`;
    }
}

module.exports = execute_function;