export function sanitizeUrl(input: string): string | null {
  var mutatedInput = input;
  mutatedInput.trim();
  mutatedInput = mutatedInput.replace(/^https?:\/\//i, "");
  mutatedInput = mutatedInput.replace(/\/$/, "");

  const minputSplit = mutatedInput.split("/");
  minputSplit[0] = minputSplit[0].toLowerCase();
  mutatedInput = minputSplit.join("/");

  const paramSplit = mutatedInput.split("?");
  if (paramSplit.length > 2) {
    return null;
  }
  const leadingUrl = paramSplit[0];
  const urlRegex =
    /^(?:[a-zA-Z0-9.-]+\.)*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s?&]*)?$/;
  const validUrl = urlRegex.test(leadingUrl);
  if (!validUrl) {
    return null;
  }

  if (paramSplit.length == 2) {
    const params = paramSplit[1];
    const paramsRegex = /^[^\s?&]+(?:=[^\s?&]+)?(?:&[^\s?&]+(=[^\s?&]+)?)*$/;
    if (!paramsRegex.test(params)) {
      return null;
    }
  }

  return mutatedInput;
}
