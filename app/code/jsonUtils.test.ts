import { parseJson } from "./jsonUtils";

type FooT = {
    myString:string,
    myNumber:number,
}

test("parses json successfully", () => {
    const fooJson = '{"myString":"some string","myNumber":42}';
    const res = parseJson<FooT>(fooJson);
    expect(res == null).toBeFalsy();
    expect(res?.myString).toEqual("some string");
    expect(res?.myNumber).toEqual(42);
});

test("bad json returns null", () => {
    //null
    var res = parseJson<FooT>(null);
    expect(res).toBeNull();
    
    //invlid json
    var fooJson = "{invalid json yo...}";
    res = parseJson<FooT>(fooJson);
    expect(res).toBeNull();

    // //missing field
    // fooJson = '{"myString":"some string"}';
    // res = parseJson<FooT>(fooJson);
    // expect(res).toBeNull();
});
