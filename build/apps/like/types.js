"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
input CreateLikeInput {
    userId: String
    tweetId: String
}
input DeleteLikeInput {
    id:ID!
    userId: String
    tweetId: String
}
type Like {
    id:ID!
    likedBy: User
    tweet: Tweet
}
`;
