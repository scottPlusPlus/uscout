import winston from "winston";
import ILogger from "./logger/ILogger";
import winstonLogReader from "./logger/WinstonFileLogParser";
import DailyRotateFile from 'winston-daily-rotate-file';

import path from "path";
import { todayYYYYMMDD } from "../agnostic/timeUtils";


const drfTransport = new DailyRotateFile({
    dirname: "logs",
    filename: "%DATE%-app.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "3d", // Keep logs for 3 days
});


const w = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [new winston.transports.Console(), drfTransport],
});

export let logger: ILogger = w;

export function overrideLogger(l:ILogger){
    logger = l;
}

export function restoreLogger(){
    logger = w;
}

export async function recentLogs(): Promise<Array<string>> {

    const formattedDate = todayYYYYMMDD();
    const filepath = drfTransport.filename.replace('%DATE%', formattedDate);
    const fullPath = path.join("logs", filepath)
    return await winstonLogReader(fullPath);
}
