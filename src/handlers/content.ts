import { Request, Response } from "express";
import { IRepositoryContent } from "../repositories";
import { ICreateContentDto } from "../entities";
import { getVideoDetails } from "../sevices/oembed";
import { IHandlerContent } from ".";
import { JwtAuthRequest } from "../auth/jwt";

export function newHandlerContent(
  repoContent: IRepositoryContent
): IHandlerContent {
  return new HandlerContent(repoContent);
}

class HandlerContent implements IHandlerContent {
  private repo: IRepositoryContent;
  constructor(repo: IRepositoryContent) {
    this.repo = repo;
  }

  async createContent(req: JwtAuthRequest, res: Response): Promise<Response> {
    const createContent: ICreateContentDto = req.body;

    if (!createContent.videoUrl) {
      return res
        .status(400)
        .json({ error: "missing videoUrl in json body" })
        .end();
    }

    try {
      const details = await getVideoDetails(createContent.videoUrl);
      const createdContent = await this.repo.createContent({
        ...details,
        ownerId: req.payload.id,
        ...createContent,
      });
      const created = {
        ...createdContent,
        user: undefined,
        postedBy: createdContent.postedBy,
      };
      return res.status(201).json(created).end();
    } catch (err) {
      console.error(`failed to create content: ${err}`);
      return res.status(500).json({ error: `failed to create content` }).end();
    }
  }

  async getContent(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${req.params.id} is not a number` })
        .end();
    }

    return this.repo
      .getContentbyId(id)
      .then((content) => {
        if (!content) {
          return res
            .status(404)
            .json({ error: `no such content: ${id}` })
            .end();
        }
        return res.status(201).json(content).end();
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: `failed to get content : ${err}` })
          .end();
      });
  }

  async getContents(req: Request, res: Response): Promise<Response> {

    return this.repo
      .getAllContents()
      .then((contents) => {
        
        return res.status(200).json({data :contents.reverse()},).end();
      })
      .catch((err) => {
        const errMsg = `failed to get contents`;
        console.error(`${errMsg}: ${err}`);

        return res.status(500).json({ error: errMsg }).end();
      });

  }

  async deleteContent(req: Request, res: Response): Promise<Response> {
    if (!req.params.id) {
      return res.status(400).json({ error: `missing id in params` }).end();
    }
    const id = Number(req.params.id);
    const { ownerId } = req.body;
    const arg = { id, ownerId };
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${req.params.id} is not a number` })
        .end();
    }

    try {
      const deleted = await this.repo.deleteContentByOwnerId(arg);

      return res.status(200).json(deleted).end();
    } catch (err) {
      const errMsg = `failed to delete content: ${id}`;
      console.error(`${errMsg}: ${err}`);

      return res.status(500).json({ error: errMsg }).end();
    }
  }

  async updateContent(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    // isNaN checks if its arg is NaN
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${req.params.id} is not a number` });
    }

    const { ownerId } = req.body;
    const { comment } = req.body;
    const { rating } = req.body;
    const updatedcontent = { id, ownerId, comment, rating };

    return this.repo
      .updateContentByOwnerId(updatedcontent)
      .then((updated) => res.status(201).json(updated).end())
      .catch((err) => {
        const errMsg = `failed to update content ${id}: ${err}`;
        console.error(errMsg);
        return res.status(500).json({ error: errMsg }).end();
      });
  }
}
