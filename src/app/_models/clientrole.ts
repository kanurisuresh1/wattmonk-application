import { Role } from "./role";
import { User } from "./user";
export class ClientRole {
  id: number;
  displayname: string;
  client: User;
  role: Role;
  canbeaddedby: number;
}
