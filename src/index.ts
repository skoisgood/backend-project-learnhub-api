import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { newRepositoryUser } from "./repositories/user";
import { newHandlerContent } from "./handlers/content";
import { newRepositoryBlacklist } from "./repositories/blacklist";
import { newRepositoryContent } from "./repositories/content";
import { newHandlerUser } from "./handlers/user";
import express from "express";
import { HandlerMiddleware } from "./auth/jwt";

async function main() {
  const db = new PrismaClient();
  const redis = createClient();
  const cors = require("cors");
  try {
    await redis.connect();
    await db.$connect();
  } catch (err) {
    console.log(err);
  }

  const repoUser = newRepositoryUser(db);
  const repoContent = newRepositoryContent(db);
  const repoBlacklist = newRepositoryBlacklist(redis);
  const handlerUser = newHandlerUser(repoUser, repoBlacklist);
  const handlerMiddleware = new HandlerMiddleware(repoBlacklist);
  const handlerContent = newHandlerContent(repoContent);

  const port = process.env.PORT || 8000;
  const server = express();
  const userRouter = express.Router();
  const contentRouter = express.Router();

  server.use(express.json());
  server.use(cors())
  server.use("/user", userRouter);
  server.use("/content", contentRouter);

  // Check server status
  server.get("/", (_, res) => {
    return res.status(200).json({ status: "ok" }).end();
  });

  //User API
  userRouter.post("/register", handlerUser.register.bind(handlerUser));
  userRouter.post("/login", handlerUser.login.bind(handlerUser));
  userRouter.post(
    "/logout",
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerUser.logout.bind(handlerUser)
  );

  //Content API
  // contentRouter.use(handlerMiddleware.jwtMiddleware.bind(handlerMiddleware));
  contentRouter.post("/", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),handlerContent.createContent.bind(handlerContent));
  contentRouter.get("/:id", handlerContent.getContent.bind(handlerContent));
  contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
  contentRouter.patch(
    "/:id",handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerContent.updateContent.bind(handlerContent)
  );
  contentRouter.delete(
    "/:id",handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerContent.deleteContent.bind(handlerContent)
  );

  server.listen(port, () => console.log(`server listening on ${port}`));
}

main();
