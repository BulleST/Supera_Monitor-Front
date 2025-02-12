export class AccountRole {
    id: number = 0;
    role: string = '';
    isDisabled = false;
}

export enum Role {
    Admin = 3,
    Teacher = 2,
    Assistant = 3,
}

export var roles: AccountRole[] = [
    { id: 1, role: 'Admin', isDisabled: false },
    { id: 2, role: 'Master', isDisabled: false },
    { id: 3, role: 'Consultant', isDisabled: false },
]