export class AccountRole {
    id: number = 0;
    role: string = '';
    isDisabled = false;
}

export enum Role {
    Admin = 1,
    Master = 2,
    Consultant = 3,
}

export var roles: AccountRole[] = [
    { id: 1, role: 'Admin', isDisabled: false },
    { id: 2, role: 'Master', isDisabled: false },
    { id: 3, role: 'Consultant', isDisabled: false },
]