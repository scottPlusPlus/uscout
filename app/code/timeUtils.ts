export function nowHHMMSS(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

const twentyFourHoursInMS = 24 * 60 * 60 * 1000;
const twentyFourHoursInS =  24 * 60 * 60;

export function twentyFourHoursAgo():Date {
    const now = new Date();
    return new Date(now.getTime() - (twentyFourHoursInMS));
}

export function twentyFourHoursAgoTimestamp():number {
    return nowUnixTimestamp() - twentyFourHoursInS;
}


//current time in SECONDS
export function nowUnixTimestamp():number {
    return Math.floor(Date.now() / 1000);
}

export function timeStampFromDate(date:Date):number {
    return Math.floor(date.getTime() / 1000);
}