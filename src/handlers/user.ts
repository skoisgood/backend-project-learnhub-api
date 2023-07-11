import { IHandlerUser } from ".";
import { comparePassword, hashPassword } from "../auth/bcrypt";
import { JwtAuthRequest, Payload, newJwt, secret } from "../auth/jwt";
import { IRepositoryBlacklist, IRepositoryUser } from "../repositories";
import { Request, Response } from "express";

export function newHandlerUser(
  repo: IRepositoryUser,
  repoBlacklist: IRepositoryBlacklist
): IHandlerUser {
  return new HandlerUser(repo, repoBlacklist);
}

class HandlerUser implements IHandlerUser {
  private repo: IRepositoryUser;
  private repoBlacklist: IRepositoryBlacklist;

  constructor(repo: IRepositoryUser, repoBlacklist: IRepositoryBlacklist) {
    this.repo = repo;
    this.repoBlacklist = repoBlacklist;
  }

  async register(req: Request, res: Response): Promise<Response> {
    const { username, name, password } = req.body;
    if (!username || !password || !name) {
      return res
        .status(400)
        .json({ error: "missing username ,or name ,or password" })
        .end();
    }

    return this.repo
      .createUser({ username, name, password: hashPassword(password) })
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

  async login(req: Request, res: Response): Promise<Response> {
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
        if (!comparePassword(password, user.password)) {
          return res
            .status(401)
            .json({ error: "invalid username or password" })
            .end();
        }

        const payload: Payload = { id: user.id, username: user.username };
        const accessToken = newJwt(secret, payload);

        return res
          .status(200)
          .json({
            status: "logged in",
            id: user.id,
            username: user.username,
            accessToken
          },
          )
          .end();
      })
      .catch((err) => {
        console.error(`failed to get user: ${err}`);
        return res.status(500).end();
      });
  }

  async logout(req: JwtAuthRequest, res: Response): Promise<Response> {
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
