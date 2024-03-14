export const types = `#graphql
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
