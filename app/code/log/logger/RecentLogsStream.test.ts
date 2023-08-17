import RecentLogsStream from "./RecentLogsStream";

test("RecentLogsStream captures input and can be read back", () => {

    const recentLogsStream = new RecentLogsStream({ maxLogs: 5 });

    const msg1 = "log message 1";
    const msg2 = "log message 1";

    recentLogsStream.write(msg1);
    recentLogsStream.write(msg2);
    // End the recentLogsStream to close the pipe
    recentLogsStream.end();

    const recentLogs = recentLogsStream.recentLogs;
    expect(recentLogs.length).toBe(2);  
    expect(recentLogs[0]).toEqual(msg1);
    expect(recentLogs[1]).toEqual(msg2);
});


