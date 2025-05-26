
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


export class ResetPassword {
    token: string = '';
    password!: string;
    confirmPassword!: string ;
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


