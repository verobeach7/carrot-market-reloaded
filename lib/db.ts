import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function test() {
  /* const token = await db.sMSToken.create({
    data: {
      token: "121212",
      user: {
        connect: {
          id: 1,
        },
      },
    },
  }); */
  const token = await db.sMSToken.findUnique({
    where: {
      id: 1,
    },
    // include 객체는 관계를 포함하는 데 사용됨
    include: {
      user: true,
    },
  });
  console.log(token);
}

test();

export default db;
