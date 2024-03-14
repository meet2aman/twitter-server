"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
  createLike(payload: CreateLikeInput!): Like!
  deleteLike(payload: DeleteLikeInput!): Like
`;
