export const types = `#graphql
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
