import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { AccountRole } from '../models/account-perfil.model';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { AccountResponse, Account, AccountRequest } from '../models/account.model';
import { Map } from '../utils/map';
import { Service } from '../helpers/service.service';

@Injectable({
    providedIn: 'root',

})
export class UserService extends Service {
    override list = new BehaviorSubject<Account[]>([]);
  
    getRoles() {
        return this.http.get<AccountRole[]>(`${this.url}/users/roles`)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar perfis', life: 3000 });
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
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar usuários', life: 3000 });
                }
            }));
    }

    get(id: number) {
            return new Observable<Account>((observer => {
                var item = this.list.value.find(x => x.id == id) as Account;
                if (item) 
                    observer.next(item);
                else 
                    observer.error('Usuários não encontrado.')
                observer.complete();
                return;
            }));
    }

    create(model: Account) {
        var request = Map(model, new AccountRequest)
        return this.http.post<Response>(`${this.url}/users`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível cadastrar usuário', life: 3000 });
                }
            }));
    }

    edit(model: Account) {
        var request = Map(model, new AccountRequest)
        return this.http.put<Response>(`${this.url}/users`, request)
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível editar usuário', life: 3000 });
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/users/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                            this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: `Não foi possível ${( activated ? 'desabilitar' : 'habilitar')}  usuário`, life: 3000 });
                }
            }));
    }

    resetPassword(id: number) {
        return this.http.patch<Response>(`${this.url}/users/reset-password/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível alterar senha', life: 3000 });
                }
            }));
    }


}
