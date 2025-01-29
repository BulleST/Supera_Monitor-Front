import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { AccountRole } from '../models/account-perfil.model';
import { environment } from '../../environments/environment.prod';
import { MessageService } from 'primeng/api';
import { Account, Account_List } from '../models/account.model';

@Injectable({
    providedIn: 'root',
    
})
export class UserService {
    url = '';
    list = new BehaviorSubject<Account_List[]>([]);
    objeto = new BehaviorSubject<Account | undefined>(undefined);

    constructor(
        private http: HttpClient,
                private messageService: MessageService,
        // @Inject('BASE_URL') url: string
    ) {
        // this.url = url + 'back'
        this.url = environment.url + 'back';
    }

    getRoles() {
        return this.http.get<AccountRole[]>(`${this.url}/users/roles`)
        .pipe(tap({
            error: err => {
                this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível carregar perfis', life: 3000 });
            }
        }));
    }

    getList() {
        return this.http.get<Account_List[]>(`${this.url}/users/all/`)
            .pipe(tap({
                next: list => {
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível carregar usuários', life: 3000 });
                }
            }));
    }

    get(id: number) {
        return this.http.get<Account>(`${this.url}/users/${id}`)
        .pipe(tap({
            error: err => {
                this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível carregar usuário', life: 3000 });
            }
        }));
    }

    create(request: Account) {
        return this.http.post<Response>(`${this.url}/users`, request)
        .pipe(tap({
            error: err => {
                this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível cadastrar usuário', life: 3000 });
            }
        }));
    }

    edit(request: Account) {
        return this.http.put<Response>(`${this.url}/users`, request)
        .pipe(tap({
            error: err => {
                this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível editar usuário', life: 3000 });
            }
        }));
    }

    delete(id: number) {
        return this.http.delete<Response>(`${this.url}/users/${id}`)
        .pipe(tap({
            error: err => {
                this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível excluir usuário', life: 3000 });
            }
        }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<Response>(`${this.url}/users/${id}/${activated}`, {})
        .pipe(tap({
            error: err => {
                this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível habilitar/desabilitar usuário', life: 3000 });
            }
        }));
    }

    resetPassword(id: number) {
        return this.http.patch<Response>(`${this.url}/users/reset-password/${id}`, {})
        .pipe(tap({
            error: err => {
                this.messageService.add({ severity: 'danger', summary: 'Error', detail: 'Não foi possível alterar senha', life: 3000 });
            }
        }));
    }


}
