import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";
import { nanoid } from "nanoid";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  email: User["email"],
  password: string
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  //TODO - should be able to rely on Prisma's default cuid,
  //but does not seem to be working, at least not with prismock
  const uuid = nanoid();
  const user = await prisma.user.create({
    data: {
      email,
      id: uuid,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
  return user;
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
