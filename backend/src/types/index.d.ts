import { Types } from 'mongoose';

export interface IUserPayload {
  _id: string;
  email: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  bio?: string;
  avatar?: string;
  password?: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
