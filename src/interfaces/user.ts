export interface IUser {
    email?: string;
    password?: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    createdAt?: any;
    updatedAt?: any;
    updatedBy?: string;
    active?: boolean;
    token?: string;
    role?: number;
    lastLoginAt?: any;
}