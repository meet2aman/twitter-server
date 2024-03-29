import { prismaClient } from "../../clients/db";
import axios from "axios";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
interface GoogleTokenResult {
  iss?: string;
  nbf?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  azp?: string;
  name?: string;
  picture?: string;
  given_name: string;
  family_name?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
  locale?: string;
}
const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOAuthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOAuthUrl.searchParams.set("id_token", googleToken);
    const { data } = await axios.get<GoogleTokenResult>(
      googleOAuthUrl.toString(),
      {
        responseType: "json",
      }
    );

    // console.log(data);

    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImage: data.picture,
        },
      });
    }
    const userInDb = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!userInDb) throw new Error(`User not found`);
    const userToken = JWTService.generateTokenForUser(userInDb);
    return userToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    // console.log(ctx);
    const id = ctx.user?.id;
    if (!id) return null;

    const user = await prismaClient.user.findUnique({ where: { id } });
    return user;
  },

  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => {
    const userById = await prismaClient.user.findUnique({ where: { id } });
    return userById;
  },
};

const extraResolver = {
  User: {
    tweets: (parent: User) =>
      prismaClient.tweet.findMany({
        where: {
          authorId: parent.id,
        },
      }),
  },
};

export const resolvers = { queries, extraResolver };
