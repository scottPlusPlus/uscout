import ILogger from "./ILogger";

export default class ConsoleLogger implements ILogger {
    constructor() {}

    debug(message?: string, ...optionalParams: any[]): void {
        console.debug(message, ...optionalParams);
    }

    info(message?: string, ...optionalParams: any[]): void {
        console.info(message, ...optionalParams);
    }

    warn(message?: string, ...optionalParams: any[]): void {
        console.warn(message, ...optionalParams);
    }

    error(message?: string, ...optionalParams: any[]): void {
        console.error(message, ...optionalParams);
    }
}
