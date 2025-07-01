export class Basic_List  {
    id: number = 0;

    activeString?: string = '';
    active?: boolean = false;
    created?: Date = new Date
    lastUpdated?: Date;
    deactivated?: Date;

    account_Created_Id?: number = 0;
    account_Created?: string = '';
}

export class Basic {
    id: number = 0;
    active: boolean = false;
    created: Date = undefined as unknown as Date;
    lastUpdated?: Date;
    deactivated?: Date;
    account_Created_Id: number = 0;
}