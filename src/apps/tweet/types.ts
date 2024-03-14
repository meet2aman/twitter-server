export const types = `#graphql
 input CreateTweetInput {
  content: String!
  tweetImageUrl: String
}
 input DeleteTweetInput {
  id: ID!
  authorId: String
}

    type Tweet {
        id: ID!
        content: String!
        tweetImageUrl: String
        author: User
        likes: [Like]
    }

`;
