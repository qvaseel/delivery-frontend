export type AuthResultDto = {
  accessToken: string;
  expiresAtUtc: string;
};

export type RegisterDto = {
  email: string;
  password: string;
  fullName: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type MeDto = {
  userId: string;
  email: string;
  roles: string[];
};