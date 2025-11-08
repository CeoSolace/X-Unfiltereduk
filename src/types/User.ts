// src/types/User.ts
export interface UserPublicProfile {
  id: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
  header: string;
  verified: boolean;
  isPremium: boolean;
  isOrganisation: boolean;
  createdAt: string;
}

export interface CurrentUser extends UserPublicProfile {
  email: string;
  organisationId: string | null;
}
