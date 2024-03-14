import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
interface CreateTweetPayload {
  content: string;
  tweetImageUrl?: string;
}
interface DeleteTweetPayload {
  id: string;
  authorId: string;
}

const s3Client = new S3Client({});

const queries = {
  getAllTweets: () =>
    prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
  getSignedURLForTweet: async (
    parent: any,
    { imageName, imageType }: { imageName: string; imageType: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error(`You are not authenticated`);
    }
    const allowedImageTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(imageType)) {
      throw new Error(`Image Type not supported: ${imageType}`);
    }
    const putObjectCommmand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `uploads/${
        ctx.user.id
      }/tweets/${imageName}-${Date.now()}.${imageType}`,
    });
    const signedURL = await getSignedUrl(s3Client, putObjectCommmand);
    return signedURL;
  },
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

  deleteTweet: async (
    parent: any,
    { payload }: { payload: DeleteTweetPayload },
    ctx: GraphqlContext
  ) => {
    console.log(ctx.user?.id);
    if (!ctx.user) throw new Error("You must be logged in");
    // Delete the Tweet
    const isTweetExisted = await prismaClient.tweet.findUnique({
      where: {
        //TODO: replace  payload.author with ctx.user.id
        authorId: payload.authorId,
        id: payload.id,
      },
    });
    if (!isTweetExisted) throw new Error("Performing unexpected action");

    const deleting = await prismaClient.tweet.delete({
      where: {
        id: payload.id,
      },
    });
    return deleting;
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
