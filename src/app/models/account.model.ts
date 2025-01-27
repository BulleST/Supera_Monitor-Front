export class Login {
    email: string = '';
    password: string = '';
}

export class Register {
    name: string = '';
    email: string = '';
    phone: string = '';
    password: string = '';
    confirmPassword: string = '';
    acceptTerms: boolean = false;
}

export interface Account_List {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    verified?: Date;
    isVerified: boolean;
    passwordReset?: Date;
    created: Date;
    updated?: Date;
    deactivated?: Date;
    customer_Id: number;
    role_Id: number;
    active: boolean;
}

export interface Account {
    id: number;
    name: string;
    phone: string;
    email: string;
    role: string;
    created: Date;
    updated?: Date;
    isVerified: boolean;
    passwordReset?: Date;
    jwtToken: string;
    refreshToken: string;
    role_Id: number;
    customer_Id: number;
}

export class Account {
    id: number = 0;
    name: string = '';
    phone: string = '';
    email: string = '';
    role: string = '';
    created: Date = new Date;
    updated?: Date;
    isVerified: boolean = false;
    passwordReset?: Date;
    jwtToken: string = '';
    refreshToken: string = '';
    role_Id: number = 0;
    customer_Id: number = 0;
}

export class ResetPassword {
    token: string = '';
    password: string = '';
    confirmPassword: string = '';
}

export class ChangePassword {
    currentPassword: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
}

export class UpdateAccount {
    name: string = '';
    phone: string = '';
    email: string = '';
}

