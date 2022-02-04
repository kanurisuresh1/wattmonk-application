import { User } from "./user";

export class Role {
  id: number;
  name: string;
  description: string;
  type: string;
  canbeaddedby: User;
  client: User;
  displayname: string;
}
