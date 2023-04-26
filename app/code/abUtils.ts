import { ipAsNumber } from "./ipUtils";

export enum AB_FLAGS {
    COLOR = 1 << 0, // 0001 in binary
    FONT = 1 << 1, // 0010 in binary
    TBD = 1 << 2 // 0100 in binary
};

export const AB_MOD = 16;

export function getAbFlag(ipab:number, flag:AB_FLAGS):boolean {
    return !! (ipab & flag);
}

export function ipAsMask(ip:string):number {
    const val = ipAsNumber(ip);
    return val % AB_MOD;
}