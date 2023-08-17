import { logger, overrideLogger, restoreLogger } from "./logger";
import RecentsLogger from "./logger/RecentsLogger";
import { afterEach } from 'vitest'

afterEach(async () => {
    restoreLogger();
});


test("example of capturing logs during a test", () => {
    const recentsLogger = new RecentsLogger();
    overrideLogger(recentsLogger);

    const msg1 = "foo";
    const msg2 = "bar";

    logger.warn(msg1);
    logger.warn(msg2);
    const recentLogsCopy = [...recentsLogger.recentLogs];

    expect(recentLogsCopy.length >=2).toBeTruthy();
    expect(recentLogsCopy[recentLogsCopy.length-2].includes(msg1)).toBeTruthy();
    expect(recentLogsCopy[recentLogsCopy.length-1].includes(msg2)).toBeTruthy();
});