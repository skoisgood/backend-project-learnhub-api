// import { PrismaClient } from "@prisma/client";

// async function main() {
//   const db = new PrismaClient();
//   const content = await db.content.findUnique({
//     include: {
//       owner: {
//         select: {
//           id: true,
//           username: true,
//         },
//       },
//     },
//     where: { id: 3 },
//   });

//   console.log(content);
// }

// main();
