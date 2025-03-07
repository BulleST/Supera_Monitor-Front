import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { AccountRole } from '../models/account-perfil.model';
import { Account, AccountRequest } from '../models/account.model';
import { Map } from '../utils/map';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';

@Injectable({
    providedIn: 'root',

})
export class UserService extends Service {
    override list = new BehaviorSubject<Account[]>([]);

    getRoles() {
        return this.http.get<AccountRole[]>(`${this.url}/users/roles`)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível carregar perfis. \n ${getError(err)}`);
                }
            }));
    }

    getList() {
        return this.http.get<Account[]>(`${this.url}/users/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar usuários. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return new Promise<Account>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                await lastValueFrom(this.getList());

            var item = this.list.value.find(x => x.id == id) as Account;
            if (!item) {
                this.toastrService.error(`Usuário não encontrado.`);
               return reject('Usuário não encontrado.')
            }


            return resolve(item);
        })
    }

    create(model: Account) {
        var request = Map(model, new AccountRequest)
        return this.http.post<Response>(`${this.url}/users`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar usuário. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: Account) {
        var request = Map(model, new AccountRequest)
        return this.http.put<Response>(`${this.url}/users`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar usuário. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/users/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível ${(activated ? 'desabilitar' : 'habilitar')}  usuário`);
                }
            }));
    }

    resetPassword(id: number) {
        return this.http.patch<Response>(`${this.url}/users/reset-password/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível alterar senha. \n ${getError(err)}`);
                }
            }));
    }


}
