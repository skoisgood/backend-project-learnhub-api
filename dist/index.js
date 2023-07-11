"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
const user_1 = require("./repositories/user");
const content_1 = require("./handlers/content");
const blacklist_1 = require("./repositories/blacklist");
const content_2 = require("./repositories/content");
const user_2 = require("./handlers/user");
const express_1 = __importDefault(require("express"));
const jwt_1 = require("./auth/jwt");
async function main() {
    const db = new client_1.PrismaClient();
    const redis = (0, redis_1.createClient)();
    const cors = require("cors");
    try {
        await redis.connect();
        await db.$connect();
    }
    catch (err) {
        console.log(err);
    }
    const repoUser = (0, user_1.newRepositoryUser)(db);
    const repoContent = (0, content_2.newRepositoryContent)(db);
    const repoBlacklist = (0, blacklist_1.newRepositoryBlacklist)(redis);
    const handlerUser = (0, user_2.newHandlerUser)(repoUser, repoBlacklist);
    const handlerMiddleware = new jwt_1.HandlerMiddleware(repoBlacklist);
    const handlerContent = (0, content_1.newHandlerContent)(repoContent);
    const port = process.env.PORT || 8000;
    const server = (0, express_1.default)();
    const userRouter = express_1.default.Router();
    const contentRouter = express_1.default.Router();
    server.use(express_1.default.json());
    server.use(cors());
    server.use("/user", userRouter);
    server.use("/content", contentRouter);
    // Check server status
    server.get("/", (_, res) => {
        return res.status(200).json({ status: "ok" }).end();
    });
    //User API
    userRouter.post("/register", handlerUser.register.bind(handlerUser));
    userRouter.post("/login", handlerUser.login.bind(handlerUser));
    userRouter.post("/logout", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerUser.logout.bind(handlerUser));
    //Content API
    // contentRouter.use(handlerMiddleware.jwtMiddleware.bind(handlerMiddleware));
    contentRouter.post("/", handlerMiddleware.jwtMiddleware, handlerContent.createContent.bind(handlerContent));
    contentRouter.get("/:id", handlerContent.getContent.bind(handlerContent));
    contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
    contentRouter.patch("/:id", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerContent.updateContent.bind(handlerContent));
    contentRouter.delete("/:id", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerContent.deleteContent.bind(handlerContent));
    server.listen(port, () => console.log(`server listening on ${port}`));
}
main();
//# sourceMappingURL=index.js.map