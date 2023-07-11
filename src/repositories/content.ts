import { PrismaClient } from "@prisma/client";
import { IContent, IContentWithUserDto, ICreateContent } from "../entities";
import { IRepositoryContent } from ".";

export function newRepositoryContent(db: PrismaClient) {
  return new RepositoryContent(db);
}

class RepositoryContent implements IRepositoryContent {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async createContent(content: ICreateContent): Promise<IContentWithUserDto> {
    // console.log(content);
   
    return await this.db.content.create({
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            registeredAt: true,
          },
        },
      },
      data: {
        ...content,
        ownerId: undefined,
        postedBy: { connect: { id: content.ownerId } },
      },
    });
  }

  async getContentbyId(id: number): Promise<IContentWithUserDto | null> {
    return await this.db.content.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            registeredAt: true,
          },
        },
      },
    });
  }

  async getAllContents(): Promise<IContentWithUserDto[]> {
    return await this.db.content.findMany({
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            registeredAt: true,
          },
        },
      },
    });
  }

  async deleteContentByOwnerId(arg: {
    id: number;
    ownerId: string;
  }): Promise<IContentWithUserDto> {
    const content = await this.db.content.findFirst({
      where: { id: arg.id, ownerId: arg.ownerId },
    });

    if (!content) return Promise.reject(`no such content: ${arg.id}`);

    return await this.db.content.delete({
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            registeredAt: true,
          },
        },
      },
      where: { id: arg.id },
    });
  }

  async updateContentByOwnerId(arg: {
    id: number;
    ownerId: string;
    comment: string;
    rating: number;
  }): Promise<IContent> {
    const content = await this.db.content.findFirst({
      where: { id: arg.id, ownerId: arg.ownerId },
    });

    if (!content) return Promise.reject(`no such content: ${arg.id}`);

    return await this.db.content.update({
      include: {
        postedBy: {
          select: {
            id: true,
            username: true,
            name: true,
            registeredAt: true,
            password: false,
          },
        },
      },
      where: { id: arg.id },
      data: { comment: arg.comment, rating: arg.rating },
    });
  }
}
