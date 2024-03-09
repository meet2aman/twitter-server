"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
 input CreateTweetInput {
  content: String!
  tweetImageUrl: String
}

    type Tweet {
        id: ID!
        content: String!
        tweetImageUrl: String

        author: User


    }

`;
