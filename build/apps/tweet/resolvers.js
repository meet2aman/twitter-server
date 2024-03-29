"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../clients/db");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_DEFAULT_REGION
});
const queries = {
    getAllTweets: () => db_1.prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
    getSignedURLForTweet: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { imageName, imageType }, ctx) {
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
        const putObjectCommmand = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`,
        });
        const signedURL = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, putObjectCommmand);
        return signedURL;
    }),
};
const mutations = {
    createTweet: (parent_2, _b, ctx_2) => __awaiter(void 0, [parent_2, _b, ctx_2], void 0, function* (parent, { payload }, ctx) {
        if (!ctx.user)
            throw new Error("You must be logged in");
        const tweet = yield db_1.prismaClient.tweet.create({
            data: {
                content: payload.content,
                tweetImageUrl: payload.tweetImageUrl,
                author: { connect: { id: ctx.user.id } },
            },
        });
        return tweet;
    }),
    deleteTweet: (parent_3, _c, ctx_3) => __awaiter(void 0, [parent_3, _c, ctx_3], void 0, function* (parent, { payload }, ctx) {
        var _d;
        console.log((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id);
        if (!ctx.user)
            throw new Error("You must be logged in");
        // Delete the Tweet
        const isTweetExisted = yield db_1.prismaClient.tweet.findUnique({
            where: {
                //TODO: replace  payload.author with ctx.user.id
                authorId: payload.authorId,
                id: payload.id,
            },
        });
        if (!isTweetExisted)
            throw new Error("Performing unexpected action");
        const deleting = yield db_1.prismaClient.tweet.delete({
            where: {
                id: payload.id,
            },
        });
        return deleting;
    }),
};
const extraResolver = {
    Tweet: {
        author: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            if (!parent.authorId) {
                return null; // Or handle the case where authorId is null
            }
            return yield db_1.prismaClient.user.findUnique({
                where: { id: parent.authorId },
            });
        }),
    },
};
exports.resolvers = { mutations, extraResolver, queries };
