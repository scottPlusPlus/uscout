import fs from 'fs/promises';

export default async function winstonLogReader(pathToLogFile:string):Promise<Array<string>> {
    const logString = await readFile(pathToLogFile);
    const logLines = logString.trim().split('\n');
    const parsedLogs = logLines.map((line) => {
      try {
        const logData = JSON.parse(line);
        const { level, message } = logData;
        return `${level}: ${message}`;
      } catch (err) {
        console.error('Error parsing log line:', err);
        return null;
      }
    });
    
    const res:string[] = [];
    parsedLogs.forEach(log => {
        if (log !== null) {
            res.push(log);
        }
    })
    return res;
  }

async function readFile(logFilePath:string):Promise<string>{
    try {
        // Read the contents of the log file asynchronously
        const data = await fs.readFile(logFilePath, 'utf8');
        return data;
    } catch (err){
        console.error('Error reading log file:', err);
        return "";
    }
}