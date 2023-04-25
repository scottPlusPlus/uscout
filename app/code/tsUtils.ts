export function asUndefined<T>(x:T|null): T|undefined {
    if (x == null){
        return undefined;
    }
    return x;
}

export function asNull<T>(x:T|undefined): T|null {
    if (!x){
        return null;
    }
    return x;
}

export function asInt(str:string|null|undefined, fallback:number = 0):number {
    if (!str){
        return fallback;
    }
    const result = parseInt(str, 10);
    return isNaN(result) ? fallback : result;
}