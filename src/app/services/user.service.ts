import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { Account, Account_List } from '../models/account.model';
import { AccountRole } from '../models/account-perfil.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    url = '';
    list = new BehaviorSubject<Account_List[]>([]);
    objeto = new BehaviorSubject<Account | undefined>(undefined);

    constructor(
        private http: HttpClient,
        // @Inject('BASE_URL') url: string
    ) {
        // this.url = url + 'back'
        this.url = environment.url + 'back';
    }

    getRoles() {
        return this.http.get<AccountRole[]>(`${this.url}/user/roles`);
    }

    getList() {
        return this.http.get<Account_List[]>(`${this.url}/user/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                }
            }));
    }

    get(id: number) {
        return this.http.get<Account>(`${this.url}/user/${id}`);
    }

    create(request: Account) {
        return this.http.post<Response>(`${this.url}/user`, request);
    }

    edit(request: Account) {
        return this.http.put<Response>(`${this.url}/user`, request);
    }

    delete(id: number) {
        return this.http.delete<Response>(`${this.url}/user/${id}`);
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/user/${id}/${activated}`, {});
    }

    resetPassword(id: number) {
        return this.http.patch<Response>(`${this.url}/user/reset-password/${id}`, {});
    }


}
