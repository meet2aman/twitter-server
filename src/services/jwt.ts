import JWT from "jsonwebtoken";
import { User } from "@prisma/client";
import { JWTUser } from "../interfaces";
const JWT_SECRET = "ksjdhf8934fub398#8gfgds";
class JWTService {
  public static generateTokenForUser(user: User) {
    // const user = await prismaClient.user.findUnique({ where: { id: userId } });
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
    };
    const token = JWT.sign(payload, JWT_SECRET);
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return JWT.verify(token, JWT_SECRET) as JWTUser;
    } catch (error) {
      return null;
    }
  }
}
export default JWTService;
