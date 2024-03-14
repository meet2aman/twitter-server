import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { GraphqlContext } from "../interfaces";
import { User } from "./user/index";
import { Like } from "./like/index";
import { Tweet } from "./tweet/index";
import JWTService from "../services/jwt";

// ------------ MAIN-SERVER-FN ----------------- //
export async function initServer() {
  // ********** Creating express Instance ******** //
  const app = express();

  // ********** Applying Middlewares ******** //
  app.use(bodyParser.json());
  app.use(cors());

  // ********** Intializing Apollo-GraphQL Server ******** //
  const graphqlServer = new ApolloServer<GraphqlContext>({
    // ********** Type defining ******** //
    typeDefs: `
    ${User.types}
    ${Like.types}
    ${Tweet.types}

    
    type Query {
        ${User.queries}
        ${Like.queries}
        ${Tweet.queries}
    }

    type Mutation {
     ${Tweet.mutations}
     ${Like.mutations}

    }
  
    `,
    /// RESOLVERS ///
    resolvers: {
      // ********** Resolvers for Query ******** //
      Query: { ...User.resolvers.queries, ...Tweet.resolvers.queries },
      // ********** Resolvers for Mutaion ******** //
      Mutation: { ...Tweet.resolvers.mutations, ...Like.resolvers.mutations },
      // ********** Extra-Resolvers ******** //
      ...Tweet.resolvers.extraResolver,
      ...User.resolvers.extraResolver,
      ...Like.resolvers.extraResolver,
    },
  });

  /// Graphql Server Configuration Initing the GQL SERVER  ///
  await graphqlServer.start();
  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(req.headers.authorization)
            : undefined,
        };
      },
    })
  );
  return app;
}
