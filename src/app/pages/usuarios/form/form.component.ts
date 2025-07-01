import { Component, inject, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Crypto, insertOrReplace, showError } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AccountService } from '../../../services/account.service';
import { Account, AccountResponse } from '../../../models/account.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Role } from '../../../models/account-perfil.model';
import { ToastrService } from 'ngx-toastr';
import { playAlert, playSuccess } from '../../../utils/audio';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    injector = inject(Injector);
    object: Account = new Account;
    loading = false;
    error: string = '';
    isEditPage = false;
    emailPattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    subscription: Subscription[] = [];
    account?: AccountResponse;
    Role: typeof Role = Role;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: UserService,
        private accountService: AccountService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
    ) {

        var account = this.accountService.account.subscribe(account => {
            this.account = account;
        });
        this.subscription.push(account);

        this.loadPage();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        var account: AccountResponse = this.accountService.accountValue as AccountResponse;

        var params = this.activatedRoute.params.subscribe(res => {
            this.isEditPage = !!res['id'];
            if (this.isEditPage) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.service.get(id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                    })
                    .catch(res => {
                        this.visible = false;
                    });
            } else {
                this.visible = true;
            }
        })
        this.subscription.push(params);
    }

    visibleChange() {
        if (!this.visible) {
            var route = this.isEditPage ? ['../../'] : ['../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    async sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e);
        }

        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: 'Tem certeza que deseja salvar os dados do usuário?',
            header: 'Salvar dados',
            acceptLabel: 'Salvar',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e)
            }
        })
    }



    send(e: any) {
        this.loading = true;
        this.object.role_Id = Role.Assistant;
        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    this.toastrService.success(this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
                    this.visible = false;
                    this.visibleChange();
                    // playSuccess();
                }
                else {
                    this.error = res.message;
                    this.showError('Erro', this.error, e);
                }
            })
            .catch((res: HttpErrorResponse) => {
                this.error = res.error.message;
                this.loading = false;
                this.showError('Erro', this.error, e);
            });
    }

    request() {
        if (this.isEditPage) {
            return lastValueFrom(this.service.edit(this.object));
        }
        return lastValueFrom(this.service.create(this.object));
    }

}
