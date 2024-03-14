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
const mutations = {
    /// Creating a new like For a tweet by a user ///
    createLike: (parent, { payload }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user)
            throw new Error("You must be logged in");
        // Check if the user has already liked the tweet //
        const existingLike = yield db_1.prismaClient.like.findFirst({
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
        const like = yield db_1.prismaClient.like.create({
            data: {
                likedBy: { connect: { id: ctx.user.id } },
                tweet: { connect: { id: payload.tweetId } },
            },
        });
        return like;
    }),
    /// deleting existed liked with user and tweet ///
    deleteLike: (parent, { payload }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user)
            throw new Error("You must be logged in");
        const like = yield db_1.prismaClient.like.findUnique({
            where: {
                id: payload.id,
            },
        });
        //TODO: have to replace payload.userID with ctx.user.id
        console.log((like === null || like === void 0 ? void 0 : like.userId) === payload.userId);
        console.log((like === null || like === void 0 ? void 0 : like.tweetId) === payload.tweetId);
        if (like &&
            (like.userId === payload.userId && like.tweetId === payload.tweetId)) {
            const disliked = yield db_1.prismaClient.like.delete({
                where: {
                    id: payload.id,
                    userId: ctx.user.id,
                    tweetId: payload.tweetId,
                },
            });
            if (!disliked)
                throw new Error(`Performing unexpected action.`);
            return disliked;
        }
    }),
};
// --------------- RESOLVERS -------------------- //
const extraResolver = {
    Like: {
        //// Fetching Details of user by Whom tweet has been Liked /////
        likedBy: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            if (!parent.userId) {
                return null; // Or handle the case where authorId is null
            }
            const user = yield db_1.prismaClient.user.findUnique({
                where: { id: parent.userId },
            });
            return user;
        }),
        ////  Fetching Details of tweet on which user Liked  ////
        tweet: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            if (!parent.tweetId)
                return null;
            const tweet = yield db_1.prismaClient.tweet.findUnique({
                where: { id: parent.tweetId },
            });
            return tweet;
        }),
    },
};
// ------------- EXPORTS ---------------- //
exports.resolvers = { mutations, extraResolver };
