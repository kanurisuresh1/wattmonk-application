import { User } from "./user";

export class UserSetting {
  created_at: Date;
  created_by: string;
  id: number;
  namedashboard: string;
  nameinbox: string;
  namepermit: string;
  namepestamp: string;
  nameprelim: string;
  namesurvey: string;
  nameteam: string;
  updated_at: Date;
  updated_by: string;
  user: User;
  visibilitypermit: boolean;
  visibilitypestamp: boolean;
  visibilityprelim: boolean;
  visibilitysurvey: boolean;
  visibilityteam: boolean;
}
