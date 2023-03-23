export function sanitizeUrl(input: string): string | null {
    input.trim();
    input = input.replace(/^https?:\/\//i, '');
    //https://regexr.com/3abjr  (with additions for after the host)
    const urlRegex = /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})(\/.*)?$/;
    const validUrl = urlRegex.test(input);
    if (!validUrl) {
        return null;
    }
    return input;
}