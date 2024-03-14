import { Like, Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
interface CreateLikePayload {
  tweetId: string;
  userId: string;
}
interface DeleteLikePayload {
  id: string;
  tweetId: string;
  userId: string;
}
const mutations = {
  /// Creating a new like For a tweet by a user ///
  createLike: async (
    parent: any,
    { payload }: { payload: CreateLikePayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You must be logged in");
    // Check if the user has already liked the tweet //
    const existingLike = await prismaClient.like.findFirst({
      where: {
        userId: payload.userId,
        tweetId: payload.tweetId,
      },
    });

    if (existingLike) {
      // If a like already exists, return its ID //
      return { id: existingLike.id };
    }

    // Create the like //
    const like = await prismaClient.like.create({
      data: {
        likedBy: { connect: { id: ctx.user.id } },
        tweet: { connect: { id: payload.tweetId } },
      },
    });

    return like;
  },

  /// deleting existed liked with user and tweet ///
  deleteLike: async (
    parent: any,
    { payload }: { payload: DeleteLikePayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You must be logged in");

    const like = await prismaClient.like.findUnique({
      where: {
        id: payload.id,
      },
    });
    //TODO: have to replace payload.userID with ctx.user.id
    console.log(like?.userId === payload.userId);
    console.log(like?.tweetId === payload.tweetId);

    if (
      like &&
      (like.userId === payload.userId && like.tweetId === payload.tweetId)
    ) {
      const disliked = await prismaClient.like.delete({
        where: {
          id: payload.id,
          userId: ctx.user.id,
          tweetId: payload.tweetId,
        },
      });
      if (!disliked) throw new Error(`Performing unexpected action.`);
      return disliked;
    }
  },
};

// --------------- RESOLVERS -------------------- //
const extraResolver = {
  Like: {
    //// Fetching Details of user by Whom tweet has been Liked /////

    likedBy: async (parent: Like) => {
      if (!parent.userId) {
        return null; // Or handle the case where authorId is null
      }
      const user = await prismaClient.user.findUnique({
        where: { id: parent.userId },
      });
      return user;
    },

    ////  Fetching Details of tweet on which user Liked  ////

    tweet: async (parent: Like) => {
      if (!parent.tweetId) return null;

      const tweet = await prismaClient.tweet.findUnique({
        where: { id: parent.tweetId },
      });
      return tweet;
    },
  },
};

// ------------- EXPORTS ---------------- //
export const resolvers = { mutations, extraResolver };
