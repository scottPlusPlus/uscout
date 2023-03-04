
export function getStringOrThrow(formData:FormData, fieldName:string, errorMsg?:string):string {
    const val = formData.get(fieldName);
    if (typeof val !== "string" || val.length === 0) {
        throw new Error(errorMsg || `missing string for ${fieldName}`);
    }
    return val;
}