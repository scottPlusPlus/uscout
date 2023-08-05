import { fillEmptyFields } from "./objectUtils";

interface ExampleObject {
  name: string;
  age: number;
  email?: string | null;
}

test("test fillEmptyFields",() => {

    const emailAlice = "alice@example.com";
    const nameJohn = "John";

    const objA: ExampleObject = {
        name: nameJohn,
        age: 30,
      };
      
      const objB: ExampleObject = {
        name: "Alice",
        age: 25,
        email: emailAlice,
      };
      
      fillEmptyFields(objA, objB);
      expect(objA.email).toEqual(emailAlice);
      expect(objA.name).toEqual(nameJohn);
});