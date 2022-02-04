import { User } from ".";

export class Groups {
  id: number;
  name: string;
  description: string;
  members: User;
  clients: User;
  status: boolean;
  isselected: boolean;
}
