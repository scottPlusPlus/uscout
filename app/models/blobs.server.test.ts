import { getBlob, setBlob } from "./blobs.server";

const key = "myKey";

test("blobs: test mocked db part1", async () =>  {
    const intialVal = await getBlob(key);
    expect(intialVal).toBeNull();

    const myVal = "val1";
    await setBlob(key, myVal);

    const actualVal = await getBlob(key);
    expect(actualVal?.value).toEqual(myVal);
});

test("blobs: test mocked db part2", async () =>  {
    const intialVal = await getBlob(key);
    expect(intialVal).toBeNull();

    const myVal = "somethingElse";
    await setBlob(key, myVal);

    const actualVal = await getBlob(key);
    expect(actualVal?.value).toEqual(myVal);
});