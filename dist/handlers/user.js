"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newHandlerUser = void 0;
const bcrypt_1 = require("../auth/bcrypt");
const jwt_1 = require("../auth/jwt");
function newHandlerUser(repo, repoBlacklist) {
    return new HandlerUser(repo, repoBlacklist);
}
exports.newHandlerUser = newHandlerUser;
class HandlerUser {
    constructor(repo, repoBlacklist) {
        this.repo = repo;
        this.repoBlacklist = repoBlacklist;
    }
    async register(req, res) {
        const { username, name, password } = req.body;
        if (!username || !password || !name) {
            return res
                .status(400)
                .json({ error: "missing username ,or name ,or password" })
                .end();
        }
        return this.repo
            .createUser({ username, name, password: (0, bcrypt_1.hashPassword)(password) })
            .then((user) => {
            return res
                .status(200)
                .json({ ...user, password: undefined })
                .end();
        })
            .catch((err) => {
            return res
                .status(500)
                .json({ error: `Failed to register ${username} : ${err}` })
                .end();
        });
    }
    async login(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "missing username or password" })
                .end();
        }
        return this.repo
            .getUser(username)
            .then((user) => {
            if (!(0, bcrypt_1.comparePassword)(password, user.password)) {
                return res
                    .status(401)
                    .json({ error: "invalid username or password" })
                    .end();
            }
            const payload = { id: user.id, username: user.username };
            const accessToken = (0, jwt_1.newJwt)(jwt_1.secret, payload);
            return res
                .status(200)
                .json({
                status: "logged in",
                id: user.id,
                username: user.username,
                accessToken
            })
                .end();
        })
            .catch((err) => {
            console.error(`failed to get user: ${err}`);
            return res.status(500).end();
        });
    }
    async logout(req, res) {
        return await this.repoBlacklist
            .addToBlacklist(req.token)
            .then(() => {
            return res
                .status(200)
                .json({ status: `logout successful token :${req.token}` })
                .end();
        })
            .catch((err) => {
            console.error(err);
            return res.status(400).json({ status: `logout fail` }).end();
        });
    }
}
//# sourceMappingURL=user.js.map