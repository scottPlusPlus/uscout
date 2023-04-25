import { asInt } from "./tsUtils";

export function getIpAddress(request: Request): string {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "??";
  return ipAddress;
}

export function ipAsNumber(ip:string):number {
  const str = ip.replace(".","");
  return asInt(str, 0);
}