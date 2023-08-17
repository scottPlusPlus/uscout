import { Writable, WritableOptions } from 'stream';

interface RecentLogsStreamOptions extends WritableOptions {
  maxLogs?: number;
}

export default class RecentLogsStream extends Writable {
  recentLogs: string[];
  maxLogs: number;

  constructor(options: RecentLogsStreamOptions = {}) {
    // Set the objectMode option to true to handle non-string data as objects
    options.objectMode = true;
    super(options);
    this.recentLogs = [];
    this.maxLogs = options.maxLogs || 100; // You can set a maximum number of logs to store
  }

  _write(chunk: any, encoding: string, callback: () => void): void {
    // Convert the chunk (object) to a string representation
    const logMessage = chunk.toString();

    // Add the log message to the recentLogs array
    this.recentLogs.push(logMessage);

    // Trim the array if it exceeds the maximum number of logs
    if (this.recentLogs.length > this.maxLogs) {
      this.recentLogs.shift();
    }

    // Call the callback to signal that the write operation is complete
    callback();
  }
}