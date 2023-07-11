export interface ICreateUser {
  username: string;
  name: string;
  password: string;
}

export interface IUser extends ICreateUser {
  id: string;
  password: string;
  registeredAt: Date;
}

export type IUserDto = {
  id: string;
  username: string;
  name: string;
  registeredAt: Date;
};

export interface ICreateContentDto {
  videoUrl: string;
  comment: string;
  rating: number;
}

export interface ICreateContent extends ICreateContentDto {
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorUrl: string;
  ownerId: string;
}

export interface IContent extends ICreateContent {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentWithUserDto extends IContent {
  postedBy: IUserDto;
}
