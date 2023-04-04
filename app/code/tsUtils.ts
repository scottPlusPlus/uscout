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