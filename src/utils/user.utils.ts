import User from "../models/user.model";
import HttpError from "./http-error.utils";

class UserUtils {
  static async getUser(filter: string, select?: string[]) {
    const selection = select ? select.join(" ") : "email role";
    const query = filter.includes("@") ? { email: filter } : { _id: filter };
    const user = await User.findOne(query).select(selection).lean();

    if (!user) throw new HttpError(404, "Invalid Credentials");

    return user;
  }
}

export default UserUtils;
