import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
interface CreateTweetPayload {
  content: string;
  tweetImageUrl?: string;
}

const queries = {
  getAllTweets: () =>
    prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
};

const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You must be logged in");
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        tweetImageUrl: payload.tweetImageUrl,
        author: { connect: { id: ctx.user.id } },
      },
    });
    return tweet;
  },
};

const extraResolver = {
  Tweet: {
    author: async (parent: Tweet) => {
      if (!parent.authorId) {
        return null; // Or handle the case where authorId is null
      }
      return await prismaClient.user.findUnique({
        where: { id: parent.authorId },
      });
    },
  },
};

export const resolvers = { mutations, extraResolver, queries };
