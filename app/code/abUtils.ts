import { ipAsNumber } from "./ipUtils";

export enum AB_FLAGS {
    COLOR = 1 << 0, // 0001 in binary
    HERO_1 = 1 << 1, // 0010 in binary
    HERO_2 = 1 << 2 // 0100 in binary
};

export const AB_MOD = 16;

export function getAbFlag(ipab:number, flag:AB_FLAGS):boolean {
    return !! (ipab & flag);
}

export function combineFlags(a:boolean, b:boolean):number {
    return (a ? 1 : 0) | (b ? 2 : 0);
}

export function ipAsMask(ip:string):number {
    const val = ipAsNumber(ip);
    return val % AB_MOD;
}