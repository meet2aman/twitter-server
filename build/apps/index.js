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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const index_1 = require("./user/index");
const index_2 = require("./like/index");
const index_3 = require("./tweet/index");
const jwt_1 = __importDefault(require("../services/jwt"));
// ------------ MAIN-SERVER-FN ----------------- //
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        // ********** Creating express Instance ******** //
        const app = (0, express_1.default)();
        // ********** Applying Middlewares ******** //
        app.use(body_parser_1.default.json());
        app.use((0, cors_1.default)());
        // ********** Intializing Apollo-GraphQL Server ******** //
        const graphqlServer = new server_1.ApolloServer({
            // ********** Type defining ******** //
            typeDefs: `
    ${index_1.User.types}
    ${index_2.Like.types}
    ${index_3.Tweet.types}

    
    type Query {
        ${index_1.User.queries}
        ${index_2.Like.queries}
        ${index_3.Tweet.queries}
    }

    type Mutation {
     ${index_3.Tweet.mutations}
     ${index_2.Like.mutations}

    }
  
    `,
            /// RESOLVERS ///
            resolvers: Object.assign(Object.assign(Object.assign({ 
                // ********** Resolvers for Query ******** //
                Query: Object.assign(Object.assign({}, index_1.User.resolvers.queries), index_3.Tweet.resolvers.queries), 
                // ********** Resolvers for Mutaion ******** //
                Mutation: Object.assign(Object.assign({}, index_3.Tweet.resolvers.mutations), index_2.Like.resolvers.mutations) }, index_3.Tweet.resolvers.extraResolver), index_1.User.resolvers.extraResolver), index_2.Like.resolvers.extraResolver),
        });
        /// Graphql Server Configuration Initing the GQL SERVER  ///
        yield graphqlServer.start();
        app.use("/graphql", (0, express4_1.expressMiddleware)(graphqlServer, {
            context: ({ req, res }) => __awaiter(this, void 0, void 0, function* () {
                return {
                    user: req.headers.authorization
                        ? jwt_1.default.decodeToken(req.headers.authorization)
                        : undefined,
                };
            }),
        }));
        return app;
    });
}
exports.initServer = initServer;
