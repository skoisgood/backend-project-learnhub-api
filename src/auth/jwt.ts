import { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { IRepositoryBlacklist } from "../repositories";

export interface Payload {
  id: string;
  username: string;
}

export function newJwt(secret: string, data: Payload): string {
  return jsonwebtoken.sign(data, secret, {
    algorithm: "HS512",
    expiresIn: "12h",
    issuer: "learnhub-api",
    subject: "user-login",
    audience: "user",
  });
}

export const secret = "my-super-secret";

//JWT middleware
export interface JwtAuthRequest extends Request {
  token: string;
  payload: Payload;
}

export class HandlerMiddleware {
  private repoBlacklist: IRepositoryBlacklist;
  constructor(repoBlacklist: IRepositoryBlacklist) {
    this.repoBlacklist = repoBlacklist;
  }

  async jwtMiddleware(req: JwtAuthRequest, res: Response, next: NextFunction) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      if (!token) {
        return res.status(401).json({ error: "missing JWT token" }).end();
      }

      const decoded = jsonwebtoken.verify(token, secret);
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
    } catch (err) {
      console.error(`Auth failed for token ${token}: ${err}`);
      return res.status(400).json({ error: "authentication failed" }).end();
    }
  }
}
