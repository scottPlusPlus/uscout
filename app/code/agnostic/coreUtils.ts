export function wait(milliseconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

export function haveSameFields(obj1: object, obj2: object): boolean {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    if (obj1Keys.length !== obj2Keys.length) {
        return false;
    }

    for (const key of obj1Keys) {
        if (!obj2.hasOwnProperty(key)) {
            return false;
        }
    }

    return true;
}
