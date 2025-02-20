export interface RegisterPayloadType {
    username: string, email: string, password: string, roleId: number, isVerified: boolean, avatar: string?;
}

export interface IInstitution {
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    headName?: string
    headNIP?: string;
    licenseDocument?: string;
}

export interface IPayloadToken {
    id: userOnDatabase.id,
    username: userOnDatabase.username,
    role: 'admin' | 'school' | 'parent' | 'healthcare'
}

export type Role = 'admin' | 'school' | 'parent' | 'healthcare' | 'uks'