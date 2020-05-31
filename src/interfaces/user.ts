export interface IUser {
    email: string;
    password: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    createdAt?: any;
    updatedAt?: any;
    updatedBy?: string;
    active?: boolean;
    token?: string; // Used to verify user through email
    role?: number; // 1: master, 2:admin, 3:normal user
    lastLoginAt?: any;
}