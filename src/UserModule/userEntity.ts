import mongoose, { InferSchemaType, HydratedDocument } from 'mongoose';

export const USER_TIERS = ['free', 'pro', 'team', 'enterprise'] as const;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    tier: {
      type: String,
      enum: USER_TIERS,
      default: 'free',
    },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

const UserEntity = mongoose.model('User', userSchema);

export default UserEntity;
