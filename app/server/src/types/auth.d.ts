export interface RegisterPayloadType {
  username: string;
  email: string;
  password: string;
  roleId: number;
  isVerified: boolean;
  institutionId?: number;
}

export interface IInstitution {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  headName?: string;
  headNIP?: string;
  licenseDocument?: string;
  provinceId?: number;
  cityId?: number;
}

export interface IPayloadToken {
  id: userOnDatabase.id;
  username: userOnDatabase.username;
  role: "admin" | "school" | "parent" | "healthcare";
}

export type Role =
  | "admin"
  | "school"
  | "parent"
  | "healthcare"
  | "uks"
  | "teacher"
  | "staff-puskesmas"
