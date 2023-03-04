export function sanitizeUrl(input: string): string | null {
    input.trim();
    input = input.replace(/^https?:\/\//i, '');
    const urlRegex = /^([a-zA-Z0-9]+:\/\/)?[a-zA-Z0-9]+\.[^\s]{2,}$/i;
    const validUrl = urlRegex.test(input);
    if (!validUrl) {
        return null;
    }
    return input;
}