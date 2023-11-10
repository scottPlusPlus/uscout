import { createUser, getUserById } from "./user.server";

test("create a user and get its id", async () =>  {

    const createdUser = await createUser("userA@gmail.com", "password");

    expect(createdUser).toBeTruthy();
    expect(createdUser.id).toBeTruthy();
    expect(createdUser.id.length).toBeGreaterThan(0);

    const userById = await getUserById(createdUser.id);
    expect(userById).toBeTruthy();
    expect(userById!.email).toEqual(createdUser.email);
});