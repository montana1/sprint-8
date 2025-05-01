type Roles = {
  roles: string[];
};

export type UserData = {
  sub: string;
  email_verified: boolean;
  realm_access: Roles;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};

type PermissionValues<T> = {
  [K in keyof T]: T[K][keyof T[K]];
}[keyof T];

export const PERMISSIONS = {
  reports: {
    view: 'prothetic_user',
  },
};

export type Permission = PermissionValues<typeof PERMISSIONS>;
