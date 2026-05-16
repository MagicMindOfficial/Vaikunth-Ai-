export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'Starter' | 'Creator' | 'Studio';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: SubscriptionPlan;
  creationsCount: number;
  lastCreationDate?: string;
  biometricEnabled: boolean;
  language: string;
  role: UserRole;
  joinedAt: string;
}

export type CreationType = 'image' | 'audio' | 'video';

export interface Creation {
  id: string;
  userId: string;
  type: CreationType;
  tool: string;
  input: string;
  outputUrl: string;
  mimeType?: string;
  thumbnailUrl?: string;
  createdAt: string;
  quality: string;
  isFavourite: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'offer' | 'update';
  targetPlan?: SubscriptionPlan;
  createdAt: string;
}
