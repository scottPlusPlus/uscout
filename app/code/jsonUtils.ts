export function parseJson<T extends object>(
  jsonString: string | null | undefined,
  errors?: Array<string>
): T | null {
  if (!jsonString) {
    return null;
  }
  try {
    console.log("running parseJson");
    const obj = JSON.parse(jsonString) as T;
    // Use Required<T> utility type to get the required properties of T
    type RequiredProps = Required<T>;
    const requiredFields = Object.keys(
      {} as RequiredProps
    ) as (keyof RequiredProps)[];
    console.log(requiredFields.length + " required fields...");

    const fields = Object.keys(obj);
    if (fields.length == 0) {
      if (errors) {
        errors.push("no fields");
      }
      return null;
    }
    //TODO: somehow validate object type...
    //   var errCount = 0;
    //   requiredFields.forEach(field => {
    //     console.log("checking field " + (field as string));
    //     if (!(field in obj)){
    //         errCount++;
    //         if (errors){
    //             errors.push("missing field " + (field as string));
    //         }
    //     }
    //   });
    //   if (errCount > 0){
    //     return null;
    //   }
    return obj;
  } catch (error:any) {
    if (errors){
        errors.push(error.message);
    }
    return null; // Return null if there's an error during deserialization
  }
}
