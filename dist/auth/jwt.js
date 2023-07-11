"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerMiddleware = exports.secret = exports.newJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function newJwt(secret, data) {
    return jsonwebtoken_1.default.sign(data, secret, {
        algorithm: "HS512",
        expiresIn: "12h",
        issuer: "learnhub-api",
        subject: "user-login",
        audience: "user",
    });
}
exports.newJwt = newJwt;
exports.secret = "my-super-secret";
class HandlerMiddleware {
    constructor(repoBlacklist) {
        this.repoBlacklist = repoBlacklist;
    }
    async jwtMiddleware(req, res, next) {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        try {
            if (!token) {
                return res.status(401).json({ error: "missing JWT token" }).end();
            }
            const decoded = jsonwebtoken_1.default.verify(token, exports.secret);
            req.token = token;
            const id = decoded["id"];
            const username = decoded["username"];
            const isBlacklisted = await this.repoBlacklist.isBlacklisted(token);
            if (isBlacklisted) {
                return res.status(401).json({ status: "logged out" }).end();
            }
            if (!id || !username) {
                return res
                    .status(401)
                    .json({ error: "missing id and/or username" })
                    .end();
            }
            req.payload = {
                id,
                username,
            };
            return next();
        }
        catch (err) {
            console.error(`Auth failed for token ${token}: ${err}`);
            return res.status(400).json({ error: "authentication failed" }).end();
        }
    }
}
exports.HandlerMiddleware = HandlerMiddleware;
//# sourceMappingURL=jwt.js.map