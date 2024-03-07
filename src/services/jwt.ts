import JWT from "jsonwebtoken";
import { prismaClient } from "../clients/db";
import { User } from "@prisma/client";
const JWT_SECRET = "ksjdhf8934fub398#8gfgds";
class JWTService {
  public static generateTokenForUser(user: User) {
    // const user = await prismaClient.user.findUnique({ where: { id: userId } });
    const payload = {
      id: user?.id,
      email: user?.email,
    };
    const token = JWT.sign(payload, JWT_SECRET);
    return token;
  }
}

export default JWTService;
