// Export all schemas
export * from './auth'; // Better Auth core schema
export * from './users';
export * from './sessions';
export * from './posts';
export * from './categories';
export * from './comments';

// Re-export common types
// Better Auth types
export type {
  User as BetterAuthUser,
  NewUser as NewBetterAuthUser,
  Session as BetterAuthSession,
  NewSession as NewBetterAuthSession,
  Account,
  NewAccount,
  Verification,
  NewVerification,
} from './auth';

// Application types
export type {
  User,
  NewUser,
  EmailVerification,
  NewEmailVerification,
} from './users';

export type { Session, NewSession } from './sessions';

export type { Post, NewPost } from './posts';

export type {
  Category,
  NewCategory,
  Tag,
  NewTag,
  PostCategory,
  PostTag,
} from './categories';

export type { Comment, NewComment } from './comments';
