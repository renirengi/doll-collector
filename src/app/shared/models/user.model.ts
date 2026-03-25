import { UserDoll } from "./doll.model";

export enum UserRoles {
  Admin = 'ADMIN',
  Client = 'CLIENT',
}


export interface User {
  id: string;
  email: string;
  role: UserRoles;
  username: string;
  firstName: string;
  lastName:string;
  avatar: string | null;
  createdAt: string;
  updatedAt:string;
  ownedDoll?: UserDoll[];
}
