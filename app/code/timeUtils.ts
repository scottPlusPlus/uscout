export function nowHHMMSS(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

const twentyFourHoursInMS = 24 * 60 * 60 * 1000;

export function twentyFourHoursAgo():Date {
    const now = new Date();
    return new Date(now.getTime() - (twentyFourHoursInMS));
}