import { Request, Response } from "express";
import { JwtAuthRequest } from "../auth/jwt";

export interface IHandlerUser {
  register(req: Request, res: Response): Promise<Response>;
  login(req: Request, res: Response): Promise<Response>;
  logout(req: JwtAuthRequest, res: Response): Promise<Response>;
}

export interface IHandlerContent {
  createContent(req: Request, res: Response): Promise<Response>;
  getContent(req: Request, res: Response): Promise<Response>;
  getContents(req: Request, res: Response): Promise<Response>;
  deleteContent(req: Request, res: Response): Promise<Response>;
  updateContent(req: Request, res: Response): Promise<Response>;
}
