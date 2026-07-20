import mongoose, { InferSchemaType, HydratedDocument } from 'mongoose';

const githubConnectionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    githubUsername: { type: String, required: true },
    accessToken: { type: String, required: true },
    lastSyncedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type GitHubConnection = InferSchemaType<typeof githubConnectionSchema>;
export type GitHubConnectionDocument = HydratedDocument<GitHubConnection>;

const GitHubConnectionEntity = mongoose.model(
  'GitHubConnection',
  githubConnectionSchema,
);

export default GitHubConnectionEntity;
