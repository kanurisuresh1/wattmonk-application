import { User } from "./user";

export class Activity {
  id: number;
  activity: string;
  performer: User;
  created_at: string;
  type: string;
  recordid: string;
}
