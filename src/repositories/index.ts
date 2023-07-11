import {
  IContent,
  IContentWithUserDto,
  ICreateContent,
  ICreateUser,
  IUser,
} from "../entities";

export interface IRepositoryUser {
  createUser(user: ICreateUser): Promise<IUser>;
  getUser(username: string): Promise<IUser>;
}

export interface IRepositoryContent {
  createContent(content: ICreateContent): Promise<IContentWithUserDto>;
  getContentbyId(id: number): Promise<IContent | null>;
  getAllContents(): Promise<IContentWithUserDto[]>;
  deleteContentByOwnerId(arg: {
    id: number;
    ownerId: string;
  }): Promise<IContentWithUserDto>;
  updateContentByOwnerId(arg: {
    id: number;
    ownerId: string;
    comment: string;
    rating: number;
  }): Promise<IContent>;
}

export interface IRepositoryBlacklist {
  addToBlacklist(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}
